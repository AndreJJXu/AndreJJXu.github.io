import DOMPurify from "dompurify";
import { load as loadYaml, CORE_SCHEMA } from "js-yaml";
import { marked } from "marked";

export const BLOG_STORAGE_KEY = "junjie-xu-work-blog:v1";

const SAFE_MARKDOWN_CONFIG = {
  ALLOW_DATA_ATTR: false,
  FORBID_ATTR: ["style"],
  FORBID_TAGS: [
    "audio",
    "embed",
    "form",
    "iframe",
    "input",
    "object",
    "script",
    "style",
    "video",
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/(?!\/)|#)/i,
  USE_PROFILES: { html: true },
};

const asText = (value) => (typeof value === "string" ? value.trim() : "");

const hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash).toString(36);
};

export function makeArticleId(value) {
  const normalized = asText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\.md(?:own)?$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeValue = normalized || `post-${hashString(asText(value) || "untitled")}`;
  return /^\d/.test(safeValue) ? `post-${safeValue}` : safeValue;
}

function importedDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);

  const text = asText(value).replace(/[/.]/g, "-");
  const match = text.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (!match) return importedDate();

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  const dayNumber = Number(match[3] || "01");
  if (monthNumber < 1 || monthNumber > 12 || dayNumber < 1) return importedDate();

  const maxDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  if (dayNumber > maxDay) return importedDate();

  const month = String(monthNumber).padStart(2, "0");
  const day = String(dayNumber).padStart(2, "0");
  return `${match[1]}-${month}-${day}`;
}

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : asText(value).split(",");
  const tags = values.map(asText).filter(Boolean);
  return [...new Set(tags)].slice(0, 8);
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "是"].includes(asText(value).toLowerCase());
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
    throw new Error(`YAML 头信息无法解析：${error.message.split("\n")[0]}`);
  }

  if (metadata == null) metadata = {};
  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("YAML 头信息必须是键值对象");
  }

  return { body: source.slice(match[0].length), metadata };
}

export function renderMarkdown(markdown) {
  const rendered = marked.parse(markdown, { breaks: false, gfm: true });
  const clean = DOMPurify.sanitize(rendered, SAFE_MARKDOWN_CONFIG);
  const template = document.createElement("template");
  template.innerHTML = clean;

  template.content.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (/^https?:\/\//i.test(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noreferrer noopener");
    }
  });

  return template.innerHTML;
}

function normalizeRecord(record) {
  if (!record || typeof record !== "object") return null;
  const title = asText(record.title);
  const bodyHtml = asText(record.bodyHtml);
  if (!title || !bodyHtml) return null;

  const tags = normalizeTags(record.tags);
  return {
    id: makeArticleId(asText(record.id) || title),
    title,
    date: normalizeDate(record.date),
    readTime: asText(record.readTime) || "1 min read",
    tags: tags.length ? tags : ["Work Blog"],
    summary: asText(record.summary) || "A work note from Junjie Xu's research practice.",
    bodyHtml: DOMPurify.sanitize(bodyHtml, SAFE_MARKDOWN_CONFIG),
    featured: normalizeBoolean(record.featured),
    imported: true,
    sourceName: asText(record.sourceName) || "Imported Markdown",
    sourceMarkdown: asText(record.sourceMarkdown),
    importedAt: asText(record.importedAt) || new Date().toISOString(),
  };
}

function readStoredRecords() {
  try {
    const raw = window.localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRecord).filter(Boolean);
  } catch {
    return [];
  }
}

function writeStoredRecords(records) {
  try {
    window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export async function parseMarkdownFile(file) {
  if (!file || !/\.(md|markdown)$/i.test(file.name || "")) {
    throw new Error("只支持 .md 或 .markdown 文件");
  }

  const source = await file.text();
  if (!source.trim()) throw new Error("文件内容为空");

  const { body, metadata } = splitFrontMatter(source);
  const heading = body.match(/^#\s+(.+)$/m);
  const title = asText(metadata.title) || asText(heading?.[1]) || asText(file.name).replace(/\.(md|markdown)$/i, "");
  if (!title) throw new Error("无法识别文章标题");

  const bodyMarkdown = heading && !asText(metadata.title)
    ? body.replace(/^#\s+.+(?:\r?\n|$)/m, "").trim()
    : body.trim();
  if (!bodyMarkdown) throw new Error("文章正文为空");

  const tags = normalizeTags(metadata.tags);
  const date = normalizeDate(metadata.date);
  const record = normalizeRecord({
    id: metadata.id || file.name,
    title,
    date,
    readTime: metadata.readTime || estimateReadTime(bodyMarkdown),
    tags: tags.length ? tags : ["Work Blog"],
    summary: asText(metadata.summary) || inferSummary(bodyMarkdown),
    bodyHtml: renderMarkdown(bodyMarkdown),
    featured: metadata.featured,
    sourceName: file.name,
    sourceMarkdown: source,
    importedAt: new Date().toISOString(),
  });

  if (!record) throw new Error("文章内容无法生成有效记录");
  return record;
}

function dateValue(article) {
  const parsed = Date.parse(normalizeDate(article.date));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mergeArticles(builtInArticles, importedArticles) {
  const importedById = new Map(importedArticles.map((article) => [article.id, article]));
  const merged = builtInArticles.map((article) => importedById.get(article.id) || article);
  const builtInIds = new Set(builtInArticles.map((article) => article.id));
  importedArticles.forEach((article) => {
    if (!builtInIds.has(article.id)) merged.push(article);
  });

  const featuredCandidates = merged
    .filter((article) => article.featured)
    .sort((first, second) => {
      if (Boolean(second.imported) !== Boolean(first.imported)) return Number(Boolean(second.imported)) - Number(Boolean(first.imported));
      return dateValue(second) - dateValue(first);
    });
  const featured = featuredCandidates[0];

  return merged
    .map((article) => ({ ...article, featured: article === featured }))
    .sort((first, second) => dateValue(second) - dateValue(first));
}

export function createBlogStore(builtInArticles) {
  let importedArticles = readStoredRecords();

  const getArticles = () => mergeArticles(builtInArticles, importedArticles);
  const getImportedArticles = () => [...importedArticles];

  const importFiles = async (files) => {
    const results = { added: 0, updated: 0, rejected: [], persisted: true };
    const next = [...importedArticles];

    for (const file of files) {
      try {
        const record = await parseMarkdownFile(file);
        const existingIndex = next.findIndex((article) => article.id === record.id);
        if (existingIndex === -1) {
          next.push(record);
          results.added += 1;
        } else {
          next[existingIndex] = record;
          results.updated += 1;
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error || "Unknown error");
        results.rejected.push({ name: file?.name || "Unknown file", reason });
      }
    }

    if (results.added || results.updated) {
      results.persisted = writeStoredRecords(next);
      importedArticles = next;
    }

    return results;
  };

  const deleteImported = (id) => {
    const next = importedArticles.filter((article) => article.id !== id);
    if (next.length === importedArticles.length) return false;
    const persisted = writeStoredRecords(next);
    importedArticles = next;
    return persisted;
  };

  const clearImported = () => {
    const hadRecords = importedArticles.length > 0;
    const persisted = writeStoredRecords([]);
    importedArticles = [];
    return hadRecords && persisted;
  };

  return { clearImported, deleteImported, getArticles, getImportedArticles, importFiles };
}
