import pkg from 'glob'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sync: glob } = pkg;

const modules = [
	{ folder: 'cjs', fileEnding: 'cjs', regex: /require\("\.(.*)"\)/g, },
	{ folder: 'esm', fileEnding: 'mjs', regex: /port .* from '\.(.*)'/g }
] as const

modules.forEach(({ folder, fileEnding, regex }) => {
	const files = glob(resolve(__dirname, `${folder}/**/*.js`))

	files.forEach((file) => {
		const filePath = resolve(__dirname, file)

		const content = readFileSync(filePath).toString()

		const newContent = content.replace(regex, (importStatement, path) =>
			importStatement.replace(path, path + `.${fileEnding}`),
		)

		const newFilePath = resolve(__dirname, file.replace(/\.js$/, `.${fileEnding}`))
		writeFileSync(newFilePath, newContent, { encoding: 'utf8' })
		rmSync(filePath)

		// eslint-disable-next-line no-console
		console.info(`fixed '${fileEnding}' imports for '.${file.replace(__dirname, '')}'`)
	})
})
