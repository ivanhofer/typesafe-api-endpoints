import pkg from 'glob'
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
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

const subFolders = ['adapters']

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

const getTemplate = {
	esm: (subFolder: string) => `export * from "../esm/${subFolder}"
`
	,
	cjs: (subFolder: string) => `"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	if (k2 === undefined) k2 = k;
	Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
	if (k2 === undefined) k2 = k;
	o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
	for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("../cjs/${subFolder}/index.cjs"), exports);
`
}

subFolders.forEach(subFolder => {
	mkdirSync(resolve(__dirname, subFolder))

	const filePath = resolve(__dirname, subFolder, `index.d.ts`)

	const content = `export * from '../types/${subFolder}'
`

	writeFileSync(filePath, content, { encoding: 'utf8' })

	// eslint-disable-next-line no-console
	console.info(`linked types file for '${subFolder}'`)


	modules.forEach(({ folder, fileEnding, }) => {
		const filePath = resolve(__dirname, subFolder, `index.${fileEnding}`)

		const content = getTemplate[folder](subFolder)

		writeFileSync(filePath, content, { encoding: 'utf8' })

		// eslint-disable-next-line no-console
		console.info(`linked '${fileEnding}' index file for '${subFolder}'`)
	})
})
