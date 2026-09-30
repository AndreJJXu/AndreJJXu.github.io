import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Post-build step: emit Atom feeds from the articles in content/published.json.
// Two locales, two feeds: /feed.xml (EN titles, links to /writing/{id}/) and
// /zh/feed.xml (Chinese titles, links to /writing/zh/{id}/). Article dates are
// month-precision ("2026.08"), so they normalize to the first of the month.
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

const monthToDateFallback = () => `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;

const locales = {
  en: {
    out: "feed.xml",
    feedTitle: "Junjie Xu — Work Blog",
    feedSubtitle: "Notes on project progress, research practice, and human-AI collaboration.",
    authorName: "Junjie Xu",
    htmlLang: "en",
    xmlLang: "",
    pagePath: "/writing",
    title: (article) => article.titleEn || article.title || article.id,
    summary: (article) => article.summaryEn || article.summary || "",
  },
  zh: {
    out: "zh/feed.xml",
    feedTitle: "许俊杰 — 工作记录",
    feedSubtitle: "关于项目推进、研究实践与人机协作的记录。",
    authorName: "许俊杰",
    htmlLang: "zh-CN",
    xmlLang: ' xml:lang="zh-CN"',
    pagePath: "/writing/zh",
    title: (article) => article.title || article.titleEn || article.id,
    summary: (article) => article.summary || article.summaryEn || "",
  },
};

for (const [locale, config] of Object.entries(locales)) {
  const entries = articles
    .map((article) => {
      const updated = monthToDate(article.date) || monthToDate(article.publishedAt);
      if (!updated) return null;
      const link = `${siteBase}${config.pagePath}/${article.id}/`;
      return { updated, title: config.title(article), summary: config.summary(article), link, sortKey: article.date || "" };
    })
    .filter(Boolean)
    .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));

  const lastUpdated = entries[0]?.updated || monthToDateFallback();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"${config.xmlLang}>
  <title>${escapeXml(config.feedTitle)}</title>
  <subtitle>${escapeXml(config.feedSubtitle)}</subtitle>
  <id>${siteBase}${config.pagePath}/</id>
  <updated>${lastUpdated}</updated>
  <link rel="alternate" type="text/html" hreflang="${config.htmlLang}" href="${siteBase}${config.pagePath}/" />
  <link rel="self" type="application/atom+xml" href="${siteBase}/${config.out}" />
  <author><name>${escapeXml(config.authorName)}</name></author>
${entries
  .map(
    (entry) => `  <entry>
    <title>${escapeXml(entry.title)}</title>
    <id>${entry.link}</id>
    <updated>${entry.updated}</updated>
    <link rel="alternate" type="text/html" href="${entry.link}" />
    <summary>${stripTags(entry.summary)}</summary>
  </entry>`,
  )
  .join("\n")}
</feed>
`;

  const outPath = resolve(projectRoot, "dist", config.out);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, xml, "utf8");
  console.log(`feed generated: dist/${config.out} (${entries.length} entries, ${locale}, updated ${lastUpdated})`);
}
