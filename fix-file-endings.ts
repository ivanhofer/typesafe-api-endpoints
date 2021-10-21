import pkg from 'glob'
import { rename } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sync: glob } = pkg;

const modules = [
	{ dir: 'cjs', fileEnding: 'cjs', },
	{ dir: 'esm', fileEnding: 'mjs', }
] as const

modules.forEach(({ dir, fileEnding }) => {
	const files = glob(resolve(__dirname, `./${dir}/**/*.js`))
	files.forEach((file) => rename(file, file.replace(/\.js$/, `.${fileEnding}`), () => { undefined }))
	console.log(`'${fileEnding}' module files files renamed`);
})
