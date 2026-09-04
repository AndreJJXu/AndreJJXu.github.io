import { renderMarkdown } from "./blog-import.js";

export const RESEARCH_STORAGE_KEY = "junjie-xu-research-now:v1";

const STORAGE_VERSION = 1;
const MAX_TITLE_LENGTH = 140;
const MAX_STAGE_LENGTH = 60;
const MAX_SUMMARY_LENGTH = 240;
const MAX_MARKDOWN_LENGTH = 50000;
const MAX_TAG_LENGTH = 42;
const MAX_TAGS = 8;

const SEED_RECORDS = [
  {
    id: "affective-music-image",
    seeded: true,
    title: "情感可控的音乐图像生成",
    stage: "Experiments",
    tags: ["Multimodal AI", "Affective Computing"],
    summary: "正在整理音乐线索、人类反馈与视觉控制之间的可解释关系。",
    markdown: `## 当前问题

我正在梳理音乐线索、人类反馈与视觉控制之间的关系：哪些变化真正改变了人的感受，哪些只是表面上的风格变化。

### 下一步

- 复核跨模态控制变量与反馈记录
- 比较不同情绪强度下的生成结果
- 把可解释的观察转化为下一轮实验设计`,
    createdAt: "2026-08-12T09:00:00+08:00",
    updatedAt: "2026-08-30T09:00:00+08:00",
  },
  {
    id: "multimodal-digital-support",
    seeded: true,
    title: "多模态数字疗法的体验评价",
    stage: "Research design",
    tags: ["Digital Therapeutics", "Human-AI Collaboration"],
    summary: "把“支持感”拆成可以观察、讨论和迭代的体验维度。",
    markdown: `## 研究笔记

这项工作关注系统是否在合适的时刻提供了恰当的支持，而不只是在离线指标上表现良好。

我正在把使用场景、情绪负荷、自主性与心理舒适感整理成可讨论的观察维度，并保留人的犹豫与边界。

> 有效的支持，需要同时尊重情境和人的判断。`,
    createdAt: "2026-08-10T09:00:00+08:00",
    updatedAt: "2026-08-28T09:00:00+08:00",
  },
];

const asText = (value) => (typeof value === "string" ? value.trim() : "");

const hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash).toString(36);
};

export function makeResearchId(value) {
  const normalized = asText(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safeValue = normalized || `note-${hashString(asText(value) || "untitled")}`;
  return /^\d/.test(safeValue) ? `note-${safeValue}` : safeValue;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeTimestamp(value, fallback) {
  const text = asText(value);
  if (!text) return fallback;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : asText(value).split(",");
  return [...new Set(values.map(asText).filter(Boolean))]
    .map((tag) => tag.slice(0, MAX_TAG_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_TAGS);
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
  if (!summary) return "记录正在推进的研究问题、实验与阶段性判断。";
  return summary.length > MAX_SUMMARY_LENGTH
    ? `${summary.slice(0, MAX_SUMMARY_LENGTH - 3)}...`
    : summary;
}

function normalizeRecord(record, fallback = {}) {
  if (!record || typeof record !== "object") return null;
  const title = asText(record.title).slice(0, MAX_TITLE_LENGTH);
  const markdown = typeof record.markdown === "string"
    ? record.markdown.trim().slice(0, MAX_MARKDOWN_LENGTH)
    : "";
  if (!title || !markdown) return null;

  const createdAt = normalizeTimestamp(record.createdAt, fallback.createdAt || nowIso());
  const updatedAt = normalizeTimestamp(record.updatedAt, createdAt);
  return {
    id: makeResearchId(asText(record.id) || title),
    title,
    stage: (asText(record.stage) || "Exploration").slice(0, MAX_STAGE_LENGTH),
    tags: normalizeTags(record.tags),
    summary: (asText(record.summary) || inferSummary(markdown)).slice(0, MAX_SUMMARY_LENGTH),
    markdown,
    createdAt,
    updatedAt,
    seeded: Boolean(record.seeded),
  };
}

function cloneSeeds() {
  return SEED_RECORDS.map((record) => normalizeRecord(record)).filter(Boolean);
}

function normalizeRecords(values, deletedIds = []) {
  const recordsById = new Map();
  values.forEach((value) => {
    const record = normalizeRecord(value);
    if (record && !deletedIds.includes(record.id)) recordsById.set(record.id, record);
  });
  return [...recordsById.values()];
}

function readState() {
  try {
    const raw = window.localStorage.getItem(RESEARCH_STORAGE_KEY);
    if (raw === null) return { found: false, valid: true, records: [], deletedSeedIds: [], persistent: true };

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        found: true,
        valid: true,
        records: normalizeRecords(parsed),
        deletedSeedIds: [],
        persistent: true,
      };
    }

    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.records)) {
      return { found: true, valid: false, records: [], deletedSeedIds: [], persistent: false };
    }

    const deletedIds = Array.isArray(parsed.deletedSeedIds)
      ? [...new Set(parsed.deletedSeedIds.map(makeResearchId))]
      : [];
    return {
      found: true,
      valid: true,
      records: normalizeRecords(parsed.records, deletedIds),
      deletedSeedIds: deletedIds,
      persistent: true,
    };
  } catch {
    return { found: true, valid: false, records: [], deletedSeedIds: [], persistent: false };
  }
}

function createEnvelope(records, deletedSeedIds) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    records,
    deletedSeedIds: [...new Set(deletedSeedIds)],
  });
}

export function createResearchStore() {
  const stored = readState();
  let records = stored.found && stored.valid ? stored.records : cloneSeeds();
  let deletedSeedIds = stored.found && stored.valid ? stored.deletedSeedIds : [];
  let persistent = stored.persistent;

  if (!stored.found && records.length) {
    try {
      window.localStorage.setItem(RESEARCH_STORAGE_KEY, createEnvelope(records, deletedSeedIds));
    } catch {
      persistent = false;
    }
  }

  const persist = () => {
    try {
      window.localStorage.setItem(RESEARCH_STORAGE_KEY, createEnvelope(records, deletedSeedIds));
      persistent = true;
      return true;
    } catch {
      persistent = false;
      return false;
    }
  };

  const getRecords = () => [...records].sort((first, second) => {
    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime();
  });

  const getRecord = (id) => records.find((record) => record.id === id) || null;

  const allocateId = (title) => {
    const base = makeResearchId(title);
    let candidate = base;
    let suffix = 2;
    while (records.some((record) => record.id === candidate) || deletedSeedIds.includes(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  };

  const saveDraft = (input, existingId = "") => {
    const title = asText(input?.title);
    const stage = asText(input?.stage);
    const markdown = typeof input?.markdown === "string" ? input.markdown.trim() : "";
    if (!title) return { ok: false, error: "请填写标题。" };
    if (!stage) return { ok: false, error: "请填写研究阶段。" };
    if (!markdown) return { ok: false, error: "请填写 Markdown 正文。" };
    if (title.length > MAX_TITLE_LENGTH) return { ok: false, error: `标题不能超过 ${MAX_TITLE_LENGTH} 个字符。` };
    if (stage.length > MAX_STAGE_LENGTH) return { ok: false, error: `研究阶段不能超过 ${MAX_STAGE_LENGTH} 个字符。` };
    if (markdown.length > MAX_MARKDOWN_LENGTH) return { ok: false, error: `正文不能超过 ${MAX_MARKDOWN_LENGTH} 个字符。` };

    const existing = existingId ? getRecord(existingId) : null;
    try {
      renderMarkdown(markdown);
    } catch {
      return { ok: false, error: "Markdown 预览失败，请检查正文格式。" };
    }

    const timestamp = nowIso();
    const record = normalizeRecord({
      id: existing?.id || allocateId(title),
      title,
      stage,
      tags: input?.tags,
      summary: input?.summary,
      markdown,
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
      seeded: existing?.seeded || false,
    });

    if (!record) return { ok: false, error: "记录内容无法保存。" };
    records = existing
      ? records.map((item) => (item.id === existing.id ? record : item))
      : [...records, record];
    deletedSeedIds = deletedSeedIds.filter((id) => id !== record.id);
    const persisted = persist();
    return { ok: true, record, persisted };
  };

  const deleteRecord = (id) => {
    const existing = getRecord(id);
    if (!existing) return { deleted: false, persisted: persistent };
    records = records.filter((record) => record.id !== id);
    if (existing.seeded) deletedSeedIds = [...new Set([...deletedSeedIds, id])];
    return { deleted: true, persisted: persist() };
  };

  return {
    deleteRecord,
    getRecord,
    getRecords,
    isPersistent: () => persistent,
    saveDraft,
  };
}
