import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const pathname = url.pathname === "/" ? "/bloomlab/" : decodeURIComponent(url.pathname);
    let filename = resolve(root, `.${pathname}`);
    if (!filename.startsWith(`${root}${sep}`)) throw new Error("Invalid path");
    const info = await stat(filename);
    if (info.isDirectory()) filename = resolve(filename, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(filename)] || "application/octet-stream" });
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, () => {
  console.log(`Bloom Lab is growing at http://localhost:${port}/bloomlab/`);
});
