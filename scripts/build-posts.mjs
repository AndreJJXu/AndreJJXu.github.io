import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml, CORE_SCHEMA } from "js-yaml";
import { marked } from "marked";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = resolve(projectRoot, "content/posts");
const publishedPath = resolve(projectRoot, "content/published.json");

const asText = (value) => (typeof value === "string" ? value.trim() : "");

function makeArticleId(value) {
  const normalized = asText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\.md(?:own)?$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "post";
}

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : asText(value).split(",");
  const tags = values.map(asText).filter(Boolean);
  return [...new Set(tags)].slice(0, 8);
}

function normalizeDate(value) {
  const text = asText(value).replace(/[/.]/g, "-");
  const match = text.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (!match) return new Date().toISOString().slice(0, 10);
  const month = String(Math.min(12, Math.max(1, Number(match[2])))).padStart(2, "0");
  const day = String(Math.min(31, Math.max(1, Number(match[3] || "01")))).padStart(2, "0");
  return `${match[1]}-${month}-${day}`;
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferSummary(markdown) {
  const paragraph = markdown
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .find((part) => part && !/^#{1,6}\s/.test(part) && !/^```/.test(part));
  const summary = stripMarkdown(paragraph || "");
  return summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;
}

function estimateReadTime(markdown) {
  const chinese = (markdown.match(/[\u3400-\u9fff]/g) || []).length;
  const words = markdown
    .replace(/[\u3400-\u9fff]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.ceil(chinese / 520 + words / 220))} min read`;
}

function splitFrontMatter(source) {
  const match = source.match(/^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { body: source, metadata: {} };
  let metadata;
  try {
    metadata = loadYaml(match[1], { schema: CORE_SCHEMA });
  } catch (error) {
    throw new Error(`YAML front matter parse failed: ${error.message.split("\n")[0]}`);
  }
  if (metadata == null || typeof metadata !== "object" || Array.isArray(metadata)) metadata = {};
  return { body: source.slice(match[0].length), metadata };
}

// Posts are committed by the site owner through /admin/, so rendering without
// a DOM sanitizer here is acceptable; script tags are still stripped.
function renderBodyHtml(markdown) {
  return marked
    .parse(markdown, { breaks: false, gfm: true })
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "");
}

function parsePost(fileName, source) {
  const { body, metadata } = splitFrontMatter(source);
  const heading = body.match(/^#\s+(.+)$/m);
  const title = asText(metadata.title) || asText(heading?.[1]) || fileName.replace(/\.md$/i, "");
  const bodyMarkdown = heading && !asText(metadata.title)
    ? body.replace(/^#\s+.+(?:\r?\n|$)/m, "").trim()
    : body.trim();

  return {
    id: makeArticleId(asText(metadata.id) || fileName),
    title,
    date: normalizeDate(metadata.date),
    readTime: asText(metadata.readTime) || estimateReadTime(bodyMarkdown),
    tags: normalizeTags(metadata.tags).length ? normalizeTags(metadata.tags) : ["Work Blog"],
    summary: asText(metadata.summary) || inferSummary(bodyMarkdown),
    bodyHtml: renderBodyHtml(bodyMarkdown),
    featured: Boolean(metadata.featured),
  };
}

function main() {
  const published = existsSync(publishedPath)
    ? JSON.parse(readFileSync(publishedPath, "utf8"))
    : {};

  if (!existsSync(postsDir)) {
    console.log("content/posts/ does not exist; no posts to build.");
    return;
  }

  const files = readdirSync(postsDir)
    .filter((name) => /\.(md|markdown)$/i.test(name) && !name.startsWith("."));

  const posts = files.map((name) => {
    const post = parsePost(name, readFileSync(resolve(postsDir, name), "utf8"));
    console.log(`post: ${post.id} (${post.date}) ${post.title}`);
    return post;
  });

  const postIds = new Set(posts.map((post) => post.id));
  const keptArticles = (published.articles || []).filter((article) => !postIds.has(article.id));
  published.articles = [...keptArticles, ...posts].sort((first, second) =>
    String(second.date).localeCompare(String(first.date)),
  );

  writeFileSync(publishedPath, `${JSON.stringify(published, null, 2)}\n`);
  console.log(`Published content updated: ${published.articles.length} articles total.`);
}

main();
