import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { isPublicPublication } from "../content/public-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, process.argv[2] || "dist");
const site = JSON.parse(
  await readFile(resolve(root, "content/site.json"), "utf8"),
);
const content = JSON.parse(
  await readFile(resolve(root, "content/published.json"), "utf8"),
);
const allowed = new Set(
  (site.publicWorks || []).filter(
    (slug) => !(site.reviewHold || []).includes(slug),
  ),
);
const issues = [];
const files = [];
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.push(file);
  }
}
if (!existsSync(dist))
  throw new Error("Build the public site before checking disclosure.");
await walk(dist);
for (const file of files) {
  const path = relative(dist, file).replaceAll("\\", "/");
  const work =
    path === "works/zh/index.html"
      ? null
      : /^works\/(?:zh\/)?([^/]+)\//.exec(path);
  const figure = /^assets\/works\/([^/]+)\//.exec(path);
  if (work && !allowed.has(work[1]))
    issues.push(`Unapproved research route: ${path}`);
  if (figure && !allowed.has(figure[1]))
    issues.push(`Unapproved research figure: ${path}`);
  if (/^(private-research|studio|content)\//.test(path))
    issues.push(`Private source shipped: ${path}`);
  if (
    /\.(pdf|docx?|pptx?|zip|tar|gz|tex|csv|xlsx?)$/i.test(path) &&
    !/^assets\/cv\/junjie-xu-cv-(en|zh)\.pdf$/.test(path)
  )
    issues.push(`Unapproved material download: ${path}`);
  if (
    ![".html", ".js", ".json", ".xml", ".bib", ".css", ".txt"].includes(
      extname(path),
    )
  )
    continue;
  const source = await readFile(file, "utf8");
  for (const slug of site.reviewHold || []) {
    if (
      source.includes(`/works/${slug}/`) ||
      source.includes(`/works/zh/${slug}/`)
    )
      issues.push(`Restricted research URL in ${path}: ${slug}`);
  }
  if (
    /arxiv\.org\/(?:abs|pdf)\/|ssrn\.com\/abstract=|openreview\.net\/forum\?id=|rs\.3\.rs-/i.test(
      source,
    )
  )
    issues.push(`Unpublished material link in ${path}`);
  if (/private-research\//.test(source))
    issues.push(`Local private path in ${path}`);
}
// A new draft must never be silently treated as a published source record.
for (const p of content.publications || []) {
  if (!isPublicPublication(p))
    issues.push(
      `Move draft metadata to the local private directory: ${p.title}`,
    );
}
if (issues.length) {
  console.error(
    `Public disclosure check failed:\n${[...new Set(issues)].map((s) => `  - ${s}`).join("\n")}`,
  );
  process.exit(1);
}
console.log(
  `Public disclosure check passed: ${allowed.size} approved work routes, ${content.publications.length} published papers; no restricted routes, figures or downloads.`,
);
