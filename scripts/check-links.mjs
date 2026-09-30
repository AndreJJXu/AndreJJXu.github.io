import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Post-build check: every root-relative URL referenced by the built pages
// (href/src/srcset, plus link/meta where applicable) must resolve to a file
// in dist/. External URLs, anchors, mailto and data URIs are skipped. This
// catches dead internal links — e.g. a page dropped from the build while
// other pages still link to it.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
const problems = [];

async function collectHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = join(dir, entry.name);
      return entry.isDirectory() ? collectHtml(fullPath) : entry.isFile() && entry.name.endsWith(".html") ? [fullPath] : [];
    }),
  );
  return files.flat();
}

const urlToPath = (url) => {
  const [pathPart] = url.split("#");
  if (!pathPart || pathPart === "") return null;
  let candidate = resolve(distRoot, `.${pathPart}`);
  if (existsSync(candidate) && !candidate.endsWith(".html")) {
    const asDirIndex = join(candidate, "index.html");
    if (existsSync(asDirIndex)) candidate = asDirIndex;
  }
  return candidate;
};

const htmlFiles = await collectHtml(distRoot);
const checked = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const refs = new Set();
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) refs.add(match[1]);
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of match[1].split(",")) refs.add(part.trim().split(/\s+/)[0]);
  }
  for (const url of refs) {
    if (/^(https?:|mailto:|data:|tel:|#|javascript:)/i.test(url)) continue;
    if (!url.startsWith("/")) continue; // relative-to-page assets are rare; hashed assets use absolute paths
    const target = urlToPath(url);
    const key = `${url}`;
    if (checked.has(key)) continue;
    checked.add(key);
    if (!target || !existsSync(target)) {
      problems.push(`${file.replace(distRoot, "")} → ${url} does not resolve in dist/`);
    }
  }
}

if (problems.length) {
  console.error(`link check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`link check passed: ${checked.size} internal URLs resolve across ${htmlFiles.length} pages`);
