import { readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Post-build step: walk dist/ for every generated index.html and emit a
// sitemap.xml covering all routes. Wired into `build:public` after build-cv.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
const siteBase = "https://andrejjxu.github.io";

async function collectHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = join(dir, entry.name);
      return entry.isDirectory() ? collectHtmlFiles(fullPath) : (entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : []);
    }),
  );
  return files.flat();
}

const escapeXml = (value) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

const htmlFiles = await collectHtmlFiles(distRoot);
// Skip noindex pages (admin/, demos/) — they must not appear in the sitemap.
const noindexPrefixes = ["admin/", "demos/", "404.html"];
const routes = htmlFiles
  .map((file) => relative(distRoot, file).split(sep).join("/"))
  .filter((path) => !noindexPrefixes.some((p) => path === p || path.startsWith(p)))
  .map((path) => (path === "index.html" ? "" : path.replace(/index\.html$/, "")))
  .map((path) => `${siteBase}/${path}`)
  .sort();

const lastmod = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
  .join("\n")}
</urlset>
`;

await writeFile(resolve(distRoot, "sitemap.xml"), xml, "utf8");
console.log(`sitemap generated: dist/sitemap.xml (${routes.length} URLs, lastmod ${lastmod})`);
