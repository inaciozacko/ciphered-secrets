import { default as server } from "../dist/server/index.js";
import fs from "fs";
import path from "path";

const ASSETS_DIR = path.join(process.cwd(), "dist", "client", "assets");

function getContentType(filePath: string): string {
  const ext = path.extname(filePath);
  switch (ext) {
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".ico":
      return "image/x-icon";
    case ".woff2":
      return "font/woff2";
    case ".woff":
      return "font/woff";
    default:
      return "application/octet-stream";
  }
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/assets/")) {
    const fileName = path.basename(url.pathname);
    const filePath = path.join(ASSETS_DIR, fileName);

    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath);
        return new Response(content, {
          headers: {
            "Content-Type": getContentType(filePath),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      // file not found, fall through to server handler
    }
  }

  return server.fetch(request, {}, {});
}
