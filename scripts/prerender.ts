import { default as server } from "../dist/server/index.js";
import fs from "fs";
import path from "path";

const routes = ["/", "/missao", "/tutorial"];
const outDir = "dist/client";

async function prerender() {
  for (const route of routes) {
    const req = new Request(`http://localhost:3000${route}`);
    const res = await server.fetch(req, {}, {});
    const html = await res.text();
    const filename = route === "/" ? "index.html" : `${route.slice(1)}.html`;
    fs.writeFileSync(path.join(outDir, filename), html);
    console.log(`Prerendered ${route} -> ${filename}`);
  }
}

prerender().catch(console.error);
