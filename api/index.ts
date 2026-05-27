import { default as server } from "../dist/server/index.js";

export default async function handler(request: Request): Promise<Response> {
  return server.fetch(request, {}, {});
}
