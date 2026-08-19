import { readFile, writeFile } from "node:fs/promises";

const sourceUrl = new URL("../src/index.js", import.meta.url);
const outputUrl = new URL("../dist/rosa.global.js", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const body = source
  .replaceAll("export default rosa;", "")
  .replaceAll("export const ", "const ")
  .replaceAll("export function ", "function ");

const banner = `/* @genart/rosa v0.1.0 | MIT | generated file */\n`;
const globalBuild = `${banner}(() => {\n"use strict";\n${body}\nglobalThis.Rosa = rosa;\n})();\n`;
await writeFile(outputUrl, globalBuild);
console.log("Built dist/rosa.global.js");
