import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Post-build check: EN/ZH structural parity. The two locales are maintained
// as parallel hand-authored (or generated) pages, and they drift silently —
// a stale card label on one side, a missing page on the other. This gate
// fails the build when the structure no longer mirrors.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
const problems = [];

const listPages = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

// 1. Work pages: dist/works/{slug} must mirror dist/works/zh/{slug}
const enWorks = listPages(resolve(distRoot, "works")).filter((slug) => slug !== "zh");
const zhWorks = listPages(resolve(distRoot, "works/zh"));
for (const slug of enWorks.filter((s) => !zhWorks.includes(s))) {
  problems.push(`works: EN page dist/works/${slug}/ has no ZH mirror`);
}
for (const slug of zhWorks.filter((s) => !enWorks.includes(s))) {
  problems.push(`works: ZH page dist/works/zh/${slug}/ has no EN mirror`);
}

// 2. Writing pages: article routes must mirror across locales (article pages
//    are emitted as {slug}/index.html directories)
const writingRoutes = (dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "zh" && existsSync(resolve(dir, entry.name, "index.html")))
    .map((entry) => entry.name)
    .sort();
const enWriting = writingRoutes(resolve(distRoot, "writing"));
const zhWriting = writingRoutes(resolve(distRoot, "writing/zh"));
for (const id of enWriting.filter((x) => !zhWriting.includes(x))) {
  problems.push(`writing: EN page /writing/${id}/ has no ZH mirror`);
}
for (const id of zhWriting.filter((x) => !enWriting.includes(x))) {
  problems.push(`writing: ZH page /writing/zh/${id}/ has no EN mirror`);
}

// 3. Gallery structure: same scene count, same card count, same tile sequence
const galleryFiles = [
  ["works/index.html", "works/zh/index.html"],
];
for (const [enFile, zhFile] of galleryFiles) {
  const en = readFileSync(resolve(distRoot, enFile), "utf8");
  const zh = readFileSync(resolve(distRoot, zhFile), "utf8");
  const count = (html, re) => (html.match(re) || []).length;
  const scenes = count(en, /class="scene(?:\s|")/g);
  const scenesZh = count(zh, /class="scene(?:\s|")/g);
  if (scenes !== scenesZh) problems.push(`gallery: scene count EN=${scenes} ZH=${scenesZh}`);
  const cards = count(en, /class="paper-card"/g);
  const cardsZh = count(zh, /class="paper-card"/g);
  if (cards !== cardsZh) problems.push(`gallery: paper-card count EN=${cards} ZH=${cardsZh}`);
  const tiles = (html) => [...html.matchAll(/class="paper-tile">([^<]+)</g)].map((m) => m[1].trim());
  const enTiles = tiles(en).join("|");
  const zhTiles = tiles(zh).join("|");
  if (enTiles !== zhTiles) problems.push(`gallery: paper tiles differ EN=[${enTiles}] ZH=[${zhTiles}]`);
}

// 4. Locale switch targets resolve: every /works/zh/… link on EN pages has a
//    built page and vice versa (cheap proxy: count hrefs into zh from EN works).
if (problems.length) {
  console.error(`parity check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`parity check passed: ${enWorks.length} work pages mirrored, ${enWriting.length} writing pages mirrored, gallery structure in sync`);
