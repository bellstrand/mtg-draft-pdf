import { create } from "browser-sync";

const set = Bun.argv[2]
if (!Bun.argv[2]) throw new Error("Missing sets argument!")

const path = `./sets/${set}.html`
const file = Bun.file(path);
if (!(await file.exists())) throw new Error(`Set ${set} does not exist in ./sets/${set}.html`)

const browserServer = create()

browserServer.init({ server: "./", startPath: `./sets/${set}.html`, injectChanges: false, watch: true });
