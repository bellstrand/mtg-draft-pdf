import { readdir } from 'node:fs/promises';
import { chromium } from "playwright-core";

const dir = import.meta.dirname;

async function generate() {
	const browser = await chromium.launch({ headless: true, args: ["--disable-web-security"] })
	const page = await browser.newPage({ bypassCSP: true })
	await page.route("file:///style.css", async (r) => {
		const cssFile = Bun.file(`./style.css`)
		const cssText = await cssFile.text()
		r.fulfill({ status: 200, contentType: "text/css;charset=utf-8", body: cssText.replaceAll("/images/", `file:///${dir}/images/`) })
	});
	await page.route(/html$/, async (r, req) => {
		const htmlFile = Bun.file(req.url().replace(`file://${dir}/`, "./"))
		const htmlText = await htmlFile.text()
		r.fulfill({ status: 200, contentType: "text/html;charset=utf-8", body: htmlText.replaceAll("/images/", `file:///${dir}/images/`) })
	})

	const files = (await readdir("./sets")).filter((f) => f !== "template.html")

	for (const file of files) {
		page.goto(`file://${dir}/sets/${file}`)
		await page.waitForLoadState()
		// console.info("waitForLoadState")
		await page.waitForSelector("page")
		// console.log("waitForSelector")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForLoadState("networkidle")

		const title = (await page.title()).replaceAll(":", "").replaceAll(" ", "-").replaceAll("[", "").replaceAll("]", "")

		await page.pdf({
			path: `./storage/${title}.pdf`,
			printBackground: true,
			scale: 1,
			width: "21cm",
			height: "29.7cm"
		})
		console.info(`Generated "${title}.pdf" PDF`)
	}
	await page.close()

	process.exit(0)
}

void generate()
