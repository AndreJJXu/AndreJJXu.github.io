import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve("content/published.json");
const data = JSON.parse(await readFile(target, "utf8"));

const problems = [];
const requiredArrays = ["projects", "publications", "patents", "awards", "articles"];

if (data.version !== 1) problems.push(`version must be 1, got ${JSON.stringify(data.version)}`);

for (const field of requiredArrays) {
  if (!Array.isArray(data[field])) problems.push(`field '${field}' must be an array`);
}

if (Array.isArray(data.articles)) {
  const ids = new Set();
  let featured = 0;
  for (const [index, article] of data.articles.entries()) {
    const at = `articles[${index}]`;
    for (const field of ["id", "title", "date", "summary", "body"]) {
      if (article[field] === undefined || article[field] === null || article[field] === "") {
        problems.push(`${at}: missing required field '${field}'`);
      }
    }
    if (article.id) {
      if (ids.has(article.id)) problems.push(`${at}: duplicate id '${article.id}'`);
      ids.add(article.id);
    }
    if (!Array.isArray(article.tags) || !article.tags.length) {
      problems.push(`${at}: needs at least one tag`);
    }
    const hasBody =
      (typeof article.bodyMarkdown === "string" && article.bodyMarkdown.trim().length > 0) ||
      (Array.isArray(article.body) && article.body.length > 0);
    if (!hasBody) {
      problems.push(`${at}: needs bodyMarkdown (string) or body (non-empty array)`);
    }
    if (article.bodyMarkdownEn !== undefined && typeof article.bodyMarkdownEn !== "string") {
      problems.push(`${at}: bodyMarkdownEn must be a string when present`);
    }
    if (article.featured) featured += 1;
  }
  if (featured > 1) problems.push(`articles: ${featured} posts marked featured; only one is shown`);
}

if (Array.isArray(data.publications)) {
  data.publications.forEach((pub, index) => {
    if (!pub.title || !pub.authors || !pub.venue) {
      problems.push(`publications[${index}]: missing title/authors/venue`);
    }
  });
}

if (Array.isArray(data.patents)) {
  data.patents.forEach((patent, index) => {
    if (!patent.title || !patent.publicationNumber) {
      problems.push(`patents[${index}]: missing title/publicationNumber`);
    }
  });
}

if (problems.length) {
  console.error(`content check failed (${problems.length} problem${problems.length > 1 ? "s" : ""}):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `content check passed: ${data.articles?.length ?? 0} articles, ${data.publications?.length ?? 0} publications, ${data.patents?.length ?? 0} patents`,
);
