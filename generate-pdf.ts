import { readdir } from 'node:fs/promises';
import { chromium } from "playwright-core";

const dir = import.meta.dirname;

async function generate() {
	const browser = await chromium.launch({ headless: true, args: ["--disable-web-security"] })
	const page = await browser.newPage({ bypassCSP: true })
	page.addInitScript((dir) => {
	  window.addEventListener('DOMContentLoaded', () => {
		const html = document.querySelector("html") as HTMLHtmlElement
		html.innerHTML = html?.innerHTML.replace("/style.css", `file:///${dir}/style.css`).replaceAll("/images/", `file:///${dir}/images/`)
	  });
	}, dir);

	const files = (await readdir("./sets")).filter((f) => f !== "template.html")

	for(const file of files) {
		page.goto(`file:///${dir}/sets/${file}`)
		await page.waitForLoadState()
		// console.info("waitForLoadState")
		await page.waitForSelector("page")
		// console.log("waitForSelector")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForLoadState("networkidle")

		const title = (await page.title()).replaceAll(":", " ").replaceAll(" ", "-")

		await page.pdf({
			path: `./storage/${title}.pdf`,
			printBackground: false,
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
