import { createServer } from "node:http";
import { readFile, writeFile, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";

// Post-build step: print the generated CV pages (/cv/, /cv/zh/) to A4 PDFs
// into dist/assets/cv/ using headless Chrome. Runs after build-cv/build-writing
// in `build:public`, so the PDFs can never drift from published.json — they are
// build outputs, not committed binaries.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
const outDir = resolve(distRoot, "assets/cv");
const PORT = 4189;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  const isMac = process.platform === "darwin";
  const macPath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (isMac && existsSync(macPath)) return macPath;
  for (const candidate of ["google-chrome", "google-chrome-stable", "chromium-browser", "chromium"]) {
    try {
      const found = execFileSync("sh", ["-c", `command -v ${candidate}`]).toString().trim();
      if (found) return found;
    } catch {
      // not installed — try the next candidate
    }
  }
  return null;
}

const chrome = findChrome();
if (!chrome) {
  console.warn("cv-pdf: no Chrome/Chromium binary found — skipping PDF export (local preview will 404 on /assets/cv/).");
  process.exit(0);
}

if (!existsSync(resolve(distRoot, "cv/index.html"))) {
  console.error("cv-pdf: dist/cv/index.html not found — run after the vite build and build-cv.");
  process.exit(1);
}

const server = createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0].split("#")[0]);
  let filePath = resolve(distRoot, `.${urlPath === "/" ? "/index.html" : urlPath}`);
  if (!filePath.startsWith(distRoot)) {
    res.writeHead(403).end();
    return;
  }
  if (!existsSync(filePath) || urlPath.endsWith("/")) {
    const indexCandidate = join(filePath, "index.html");
    if (existsSync(indexCandidate)) filePath = indexCandidate;
  }
  readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": mime[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

await new Promise((resolveStart) => server.listen(PORT, "127.0.0.1", resolveStart));
mkdirSync(outDir, { recursive: true });

const targets = [
  { page: "/cv/", out: "junjie-xu-cv-en.pdf" },
  { page: "/cv/zh/", out: "junjie-xu-cv-zh.pdf" },
];

// Async spawn — spawnSync would block the event loop and deadlock against
// this script's own static server (Chrome waits for the page, server waits
// for the event loop).
const runChrome = (args) =>
  new Promise((resolveRun) => {
    const child = spawn(chrome, args, { stdio: "ignore" });
    child.on("error", (error) => resolveRun({ ok: false, error }));
    child.on("close", (code) => resolveRun({ ok: code === 0, code }));
  });

for (const target of targets) {
  const result = await runChrome([
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    `--print-to-pdf=${resolve(outDir, target.out)}`,
    `http://127.0.0.1:${PORT}${target.page}`,
  ]);
  if (!result.ok || !existsSync(resolve(outDir, target.out))) {
    console.error(`cv-pdf: failed to export ${target.out} (chrome exit ${result.code ?? result.error})`);
    server.close();
    process.exit(1);
  }
  console.log(`cv-pdf exported: dist/assets/cv/${target.out}`);
}

server.close();
process.exit(0);
