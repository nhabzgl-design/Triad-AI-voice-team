const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { deliberate, providerStatus } = require("./src/orchestrator");

const ROOT = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 3000);
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };

function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 200_000) { reject(new Error("Request too large")); req.destroy(); }
    });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "GET" && url.pathname === "/api/health") {
    return send(res, 200, { ok: true, app: "TRIAD AI", providers: providerStatus() });
  }
  if (req.method === "POST" && url.pathname === "/api/deliberate") {
    try {
      const body = await readBody(req);
      if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 12000) {
        return send(res, 400, { error: "Maglagay ng tanong o task na 1–12,000 characters." });
      }
      const result = await deliberate(body.prompt.trim());
      return send(res, 200, result);
    } catch (error) {
      return send(res, 500, { error: error.message || "Hindi nakumpleto ang deliberation." });
    }
  }
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(ROOT, requested);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
  send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || "application/octet-stream");
});
server.listen(PORT, () => console.log(`TRIAD AI listening on ${PORT}`));
