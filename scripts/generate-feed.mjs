import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Post-build step: emit an Atom feed from the articles in content/published.json.
// Article dates are month-precision ("2026.08"), so they normalize to the first
// of the month. Wired into `build:public` after generate-sitemap.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteBase = "https://andrejjxu.github.io";

const published = JSON.parse(await readFile(resolve(projectRoot, "content/published.json"), "utf8"));
const articles = Array.isArray(published.articles) ? published.articles : [];

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const monthToDate = (value) => {
  const match = /^(\d{4})[./-](\d{1,2})/.exec(String(value || "").trim());
  if (!match) return null;
  const month = String(Math.min(12, Math.max(1, Number(match[2])))).padStart(2, "0");
  return `${match[1]}-${month}-01T00:00:00Z`;
};

const stripTags = (value) => escapeXml(String(value ?? "").replace(/<[^>]*>/g, "").slice(0, 300));

const entries = articles
  .map((article) => {
    const updated = monthToDate(article.date) || monthToDate(article.publishedAt);
    if (!updated) return null;
    const title = article.titleEn || article.title || article.id;
    const summary = article.summaryEn || article.summary || "";
    const id = `${siteBase}/#writing-${article.id}`;
    return { updated, title, summary, id, sortKey: article.date || "" };
  })
  .filter(Boolean)
  .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));

const lastUpdated = entries[0]?.updated || `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Junjie Xu — Work Blog</title>
  <subtitle>Notes on project progress, research practice, and human-AI collaboration.</subtitle>
  <id>${siteBase}/</id>
  <updated>${lastUpdated}</updated>
  <link rel="alternate" type="text/html" hreflang="en" href="${siteBase}/#writing" />
  <link rel="self" type="application/atom+xml" href="${siteBase}/feed.xml" />
  <author><name>Junjie Xu</name></author>
${entries
  .map(
    (entry) => `  <entry>
    <title>${escapeXml(entry.title)}</title>
    <id>${entry.id}</id>
    <updated>${entry.updated}</updated>
    <link rel="alternate" type="text/html" href="${siteBase}/#writing" />
    <summary>${stripTags(entry.summary)}</summary>
  </entry>`,
  )
  .join("\n")}
</feed>
`;

await writeFile(resolve(projectRoot, "dist/feed.xml"), xml, "utf8");
console.log(`feed generated: dist/feed.xml (${entries.length} entries, updated ${lastUpdated})`);
