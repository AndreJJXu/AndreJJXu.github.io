import { createBlogStore, renderMarkdown } from "./blog-import.js";
import { createResearchStore } from "./research-now.js";
import publishedContent from "./content/published.json";

// Motion gate: entrance animations hide their targets only under `html.js`,
// so a visit with JS disabled always renders a fully visible page.
document.documentElement.classList.add("js");
// Force-settle safety net: if entrance animations never advance (e.g. headless
// capture or a throttled compositor), flip `entrance-done` so the hero settles
// fully visible instead of being caught mid-fade forever.
window.setTimeout(function () {
  document.documentElement.classList.add("entrance-done");
}, 1500);
setupPortraitReveal();

const siteData = {
  contact: {
    email: "jjxu_dr@stu.ecnu.edu.cn",
    cvUrl: "/cv/",
  },
  profiles: [
    {
      label: "Google Scholar",
      url: "https://scholar.google.com/citations?user=Ezn3PjgAAAAJ",
    },
    {
      label: "GitHub",
      url: "https://github.com/AndreJJXu",
    },
    {
      label: "ORCID",
      url: "https://orcid.org/0009-0007-1965-867X",
    },
  ],
  projects: [
    {
      title: "Multimodal Digital Therapeutics",
      summary:
        "负责人项目「人机混合下基于多模态的数字药物研究」。围绕情感体验与多模态交互探索数字健康支持；项目结题评定为优秀。",
      summaryEn:
        "A research project on multimodal digital support, emotional experience, and human-centered interaction. The project was rated excellent at completion.",
      role: "Project Director",
      roleZh: "项目负责人",
      fund: "Interdisciplinary Research Project · ECNU",
      fundZh: "交叉学科研究项目 · 华东师范大学",
      period: "2024 — 2025 · Excellent",
      periodZh: "2024 — 2025 · 结题优秀",
      color: "blue",
    },
    {
      title: "Emotion-Controllable Music-to-Image",
      summary:
        "负责人项目「人机混合智能下情感可控的音乐图像生成研究」。探索如何将人类反馈与情感意图带入音乐到图像的跨模态生成。",
      summaryEn:
        "Exploring how human feedback and affective intent can shape cross-modal music-to-image generation.",
      role: "Project Director",
      roleZh: "项目负责人",
      fund: "Doctoral Research Innovation Fund · ECNU",
      fundZh: "博士生科研创新基金 · 华东师范大学",
      period: "2023 · Advised by Liang He",
      periodZh: "2023 · 指导教师 Liang He",
      color: "red",
    },
    {
      title: "EduChat-R1",
      summary:
        "参与 ECNU EduChat-R1 开源教育推理模型项目，支持面向教育场景的推理能力建设与开源协作。",
      summaryEn:
        "Contributing to an open education reasoning model through research, engineering, and open-source collaboration.",
      role: "Participant",
      roleZh: "项目参与",
      fund: "Open Education Reasoning Model · ECNU",
      fundZh: "开源教育推理模型 · 华东师范大学",
      period: "2025 · Open-source release",
      periodZh: "2025 · 开源发布",
      color: "green",
    },
  ],
  publications: [
    {
      title: "MARS: Multimodal-Assisted Refined Semantic Alignment",
      authors: "Junjie Xu, Xingjiao Wu, Zihao Zhang, Shuwen Yang, Tianlong Ma, Daoguo Dong, Liang He",
      venue: "Information Processing & Management · Accepted",
    },
    {
      title: "Bidirectional Directed Acyclic Graph Neural Network for Aspect-level Sentiment Classification",
      authors: "Junjie Xu, Luwei Xiao, Anran Wu, Tianlong Ma, Daoguo Dong, Liang He",
      venue: "ACM TALLIP · Accepted",
    },
    {
      title: "Graph Convolution over the Semantic-syntactic Hybrid Graph Enhanced by Affective Knowledge for Aspect-level Sentiment Classification",
      authors: "Junjie Xu, Shuwen Yang, Luwei Xiao, Zhichao Fu, Xingjiao Wu, Tianlong Ma, Liang He",
      venue: "IJCNN · 2022",
    },
    {
      title: "Attention Mixture Network for Crowd Counting via Binarization Transfer",
      authors: "Junjie Xu, Zihao Zhang, Xin Li, Weijie Li, Kun Yu",
      venue: "McGE / ACM MM Workshop · 2025",
    },
  ],
  patents: [],
  articles: [],
  awards: [
    {
      year: "2025",
      name: "Kuanrui Talent Scholarship",
      org: "ECNU School of Computer Science and Technology",
    },
    {
      year: "2023",
      name: "Shanghai Outstanding Graduate",
      org: "Shanghai Municipal Education Commission",
    },
    {
      year: "2023",
      name: "National Third Prize · Challenge Cup",
      org: "China Association for Science and Technology",
    },
    {
      year: "2022",
      name: "Huaxin Scholarship",
      org: "ECNU School of Computer Science and Technology",
    },
  ],
};

if (Array.isArray(publishedContent?.projects) && publishedContent.projects.length) {
  siteData.projects = publishedContent.projects;
}
if (Array.isArray(publishedContent?.publications) && publishedContent.publications.length) {
  siteData.publications = publishedContent.publications;
}
if (Array.isArray(publishedContent?.patents) && publishedContent.patents.length) {
  siteData.patents = publishedContent.patents;
}
if (Array.isArray(publishedContent?.awards) && publishedContent.awards.length) {
  siteData.awards = publishedContent.awards;
}
if (Array.isArray(publishedContent?.articles) && publishedContent.articles.length) {
  siteData.articles = publishedContent.articles;
}
if (publishedContent?.contact && typeof publishedContent.contact === "object") {
  siteData.contact = { ...siteData.contact, ...publishedContent.contact };
}
if (Array.isArray(publishedContent?.profiles) && publishedContent.profiles.length) {
  siteData.profiles = publishedContent.profiles;
}

const blogStore = createBlogStore(siteData.articles);
const researchStore = createResearchStore();
const locale = document.body?.dataset.locale === "zh" ? "zh" : "en";
const ui = locale === "zh"
  ? {
      all: "全部",
      count: "篇记录",
      featured: "精选记录",
      read: "阅读记录",
      close: "收起记录",
      readArticle: "阅读",
      projectDetails: "项目详情",
      readPaper: "阅读论文",
      coInventor: "共同发明人 · 许俊杰",
      otherInventor: "另列发明人",
      statuses: {
        published: "已发表",
        accepted: "已接收",
        preprint: "预印本",
        "under review": "评审中",
        manuscript: "手稿",
      },
      cv: "下载简历",
    }
  : {
      all: "All",
      count: "posts",
      featured: "Featured post",
      read: "Read post",
      close: "Close post",
      readArticle: "Read",
      projectDetails: "Project details",
      readPaper: "Read paper",
      coInventor: "Co-inventor · Junjie Xu",
      otherInventor: "Other listed inventor",
      statuses: {
        published: "Published",
        accepted: "Accepted",
        preprint: "Preprint",
        "under review": "Under review",
        manuscript: "Manuscript",
      },
      cv: "Download CV",
    };
let activeTag = "All";
let editingResearchId = "";
let researchEditorMode = "write";
let lastResearchTrigger = null;

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>'"]/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return entities[character];
  });

function linkAttributes(url) {
  return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noreferrer noopener"' : "";
}

function safeUrl(url) {
  const value = String(url ?? "").trim();
  return /^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/i.test(value) ? value : "";
}

function optionalLink(url, label) {
  const href = safeUrl(url);
  if (!href) return "";
  return `<a class="record-link" href="${escapeHTML(href)}"${linkAttributes(href)}>${escapeHTML(label)} <span aria-hidden="true">↗</span></a>`;
}

function statusClass(status) {
  return String(status || "record")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function localizeStatus(status) {
  const value = String(status ?? "").trim();
  return ui.statuses[value.toLowerCase()] || value;
}

function renderProfiles() {
  const target = document.querySelector("#profile-links");
  if (!target) return;
  target.innerHTML = siteData.profiles
    .map((profile) => {
      const href = safeUrl(profile.url);
      if (!href) return "";
      return `
        <a
          class="profile-link"
          href="${escapeHTML(href)}"
          target="_blank"
          rel="noreferrer noopener"
        >
          ${escapeHTML(profile.label)} <span aria-hidden="true">↗</span>
        </a>
      `;
    })
    .join("");
}

function renderContactLinks() {
  const target = document.querySelector("#contact-links");
  if (!target) return;

  const links = [];
  if (siteData.contact.email) {
    links.push(`<a class="profile-link" href="mailto:${escapeHTML(siteData.contact.email)}">Email <span aria-hidden="true">↗</span></a>`);
  }
  const cvHref = safeUrl(siteData.contact.cvUrl);
  if (cvHref) {
    links.push(`<a class="profile-link" href="${escapeHTML(cvHref)}"${linkAttributes(cvHref)} download>${ui.cv} <span aria-hidden="true">↓</span></a>`);
  }

  target.innerHTML = links.join("");
  target.hidden = links.length === 0;
}

function renderProjects() {
  const target = document.querySelector("#project-list");
  if (!target) return;
  target.innerHTML = siteData.projects
    .map((project, index) => {
      const href = safeUrl(project.url);
      return `
        <article class="project">
          <p class="project-index">0${index + 1}</p>
          <div>
            <h3 class="project-title">${href ? `<a href="${escapeHTML(href)}"${linkAttributes(href)}>${escapeHTML(project.title)} <span aria-hidden="true">↗</span></a>` : escapeHTML(project.title)}</h3>
            <p class="project-summary">${escapeHTML(locale === "en" ? project.summaryEn || project.summary : project.summary)}</p>
          </div>
          <div class="project-meta">
            <span><strong>${escapeHTML(locale === "zh" ? project.roleZh || project.role : project.role)}</strong></span>
            <span>${escapeHTML(locale === "zh" ? project.fundZh || project.fund : project.fund)}</span>
            <span>${escapeHTML(locale === "zh" ? project.periodZh || project.period : project.period)}</span>
            ${optionalLink(href, ui.projectDetails)}
          </div>
        </article>`;
    })
    .join("");
}

function renderPublications() {
  const target = document.querySelector("#publication-list");
  if (!target) return;
  target.innerHTML = siteData.publications
    .map((publication, index) => {
      const href = safeUrl(publication.url);
      const rawStatus = locale === "zh" ? publication.statusZh || publication.status : publication.status;
      const status = localizeStatus(rawStatus);
      const cited =
        Number.isFinite(publication.citations) && publication.citations > 0
          ? locale === "zh"
            ? `<span class="publication-meta-cited"> · 被引 ${publication.citations}</span>`
            : `<span class="publication-meta-cited"> · Cited by ${publication.citations}</span>`
          : "";
      const statusPill = status
        ? `<span class="record-status record-status--${statusClass(rawStatus)}">${escapeHTML(status)}</span>`
        : "";
      const readLink = optionalLink(href, ui.readPaper);
      const metaFoot = statusPill + readLink;
      const titleMarkup = href
        ? `<a href="${escapeHTML(href)}"${linkAttributes(href)}>${escapeHTML(publication.title)}<span class="title-arrow" aria-hidden="true">&nbsp;↗</span></a>`
        : escapeHTML(publication.title);
      return `
        <li class="publication" style="--row-i: ${index}">
          <div>
            <h3 class="publication-title">${titleMarkup}</h3>
            <p class="publication-authors">${escapeHTML(publication.authors)}</p>
          </div>
          <p class="publication-meta">
            <span class="publication-meta-venue">${escapeHTML(publication.venue)}${cited}</span>
            ${metaFoot ? `<span class="publication-meta-foot">${metaFoot}</span>` : ""}
          </p>
        </li>`;
    })
    .join("");
}

function renderPatents() {
  const target = document.querySelector("#patent-list");
  if (!target) return;
  target.innerHTML = siteData.patents
    .map(
      (patent, index) => `
        <li class="patent" style="--row-i: ${index}">
          <span class="patent-index">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3 class="patent-title">${escapeHTML(patent.title)}</h3>
            <p class="patent-meta"><span>${escapeHTML(patent.publicationNumber)}</span><span>${escapeHTML(patent.publicationDate)}</span></p>
          </div>
          <p class="patent-inventor">${escapeHTML(ui.coInventor)}${patent.inventor ? `<span>${escapeHTML(ui.otherInventor)} · ${escapeHTML(patent.inventor)}</span>` : ""}</p>
        </li>`,
    )
    .join("");
}

function renderAwards() {
  const target = document.querySelector("#award-list");
  if (!target) return;
  target.innerHTML = siteData.awards
    .map(
      (award) => `
        <li>
          <span class="award-year">${escapeHTML(award.year)}</span>
          <span class="award-name">${escapeHTML(award.name)}<span class="award-org">${escapeHTML(award.org)}</span></span>
        </li>`,
    )
    .join("");
}

function articleMeta(article) {
  return `<p class="article-meta"><span>${escapeHTML(article.date)}</span><span>${escapeHTML(article.readTime)}</span></p>`;
}

function articleBody(article) {
  let body = "";
  if (article.bodyHtml) {
    body = article.bodyHtml;
  } else if (article.bodyMarkdown) {
    try {
      body = renderMarkdown(article.bodyMarkdown);
    } catch {
      body = `<p>${escapeHTML(article.bodyMarkdown)}</p>`;
    }
  } else if (Array.isArray(article.body) && article.body.length) {
    body = article.body.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
  }
  return `<div class="markdown-body">${body}</div>`;
}

function renderFilters() {
  const target = document.querySelector("#tag-filters");
  if (!target) return;
  const allTags = ["All", ...new Set(blogStore.getArticles().flatMap((article) => article.tags))];
  if (!allTags.includes(activeTag)) activeTag = "All";
  target.innerHTML = allTags
    .map(
      (tag) => `
        <button class="tag-filter ${tag === activeTag ? "is-active" : ""}" type="button" data-tag="${escapeHTML(tag)}" aria-pressed="${tag === activeTag}">
          ${escapeHTML(tag === "All" ? ui.all : tag)}
        </button>`,
    )
    .join("");

  target.querySelectorAll(".tag-filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = button.dataset.tag;
      renderWriting();
    });
  });
}

function renderWriting() {
  if (!document.querySelector("#article-count")) return;
  const articles = blogStore.getArticles().map((article) =>
    locale === "en"
      ? {
          ...article,
          title: article.titleEn || article.title,
          summary: article.summaryEn || article.summary,
          body: article.bodyEn || article.body,
          bodyHtml: article.bodyHtmlEn || article.bodyHtml,
          bodyMarkdown: article.bodyMarkdownEn || article.bodyMarkdown,
        }
      : article,
  );
  renderFilters();
  const filtered = articles.filter(
    (article) => activeTag === "All" || article.tags.includes(activeTag),
  );
  const featured = filtered.find((article) => article.featured);
  const otherArticles = filtered.filter((article) => article !== featured);
  const featuredTarget = document.querySelector("#featured-article");
  const listTarget = document.querySelector("#article-list");
  if (!featuredTarget || !listTarget) return;

  document.querySelector("#article-count").textContent = `${filtered.length} ${ui.count}`;

  if (featured) {
    featuredTarget.classList.remove("is-hidden");
    featuredTarget.innerHTML = `
      <article class="featured-story">
        <div>
          <span class="featured-label">${ui.featured}</span>
          <h3>${escapeHTML(featured.title)}</h3>
          <p class="featured-summary">${escapeHTML(featured.summary)}</p>
        </div>
        <div class="featured-side">
          <div>${articleMeta(featured)}</div>
          <button class="read-toggle" type="button" aria-expanded="false" aria-controls="article-body-${featured.id}" data-article-toggle="${featured.id}" aria-label="${escapeHTML(ui.readArticle)}《${escapeHTML(featured.title)}》">
            ${ui.read} <span class="toggle-icon" aria-hidden="true">↓</span>
          </button>
        </div>
        <div class="article-body" id="article-body-${featured.id}">${articleBody(featured)}</div>
      </article>`;
  } else {
    featuredTarget.classList.add("is-hidden");
    featuredTarget.innerHTML = "";
  }

  listTarget.innerHTML = otherArticles
    .map(
      (article) => `
        <article class="article">
          ${articleMeta(article)}
          <div>
            <h3>${escapeHTML(article.title)}</h3>
            <p class="article-summary">${escapeHTML(article.summary)}</p>
          </div>
          <button class="read-toggle" type="button" aria-expanded="false" aria-controls="article-body-${article.id}" data-article-toggle="${article.id}" aria-label="${escapeHTML(ui.readArticle)}《${escapeHTML(article.title)}》">
            <span class="toggle-icon" aria-hidden="true">↓</span>
          </button>
          <div class="article-body" id="article-body-${article.id}">${articleBody(article)}</div>
        </article>`,
    )
    .join("");

  document.querySelectorAll("[data-article-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const body = document.querySelector(`#article-body-${button.dataset.articleToggle}`);
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      body.classList.toggle("is-open", !isOpen);

      if (button.closest(".featured-story")) {
        button.firstChild.textContent = isOpen ? `${ui.read} ` : `${ui.close} `;
      }
    });
  });
}

function updateImportCount() {
  const target = document.querySelector("#import-count");
  if (target) target.textContent = String(blogStore.getImportedArticles().length);
}

function renderImportedPosts() {
  const target = document.querySelector("#imported-post-list");
  if (!target) return;

  const imported = blogStore.getImportedArticles().sort((first, second) => {
    return String(second.date).localeCompare(String(first.date));
  });

  if (!imported.length) {
    target.innerHTML = `<li class="imported-post-empty">No imported posts yet.</li>`;
    return;
  }

  target.innerHTML = imported
    .map(
      (article) => `
        <li class="imported-post-item">
          <div>
            <strong>${escapeHTML(article.title)}</strong>
            <span>${escapeHTML(article.date)} · ${escapeHTML(article.sourceName)}</span>
          </div>
          <button class="imported-post-delete" type="button" data-delete-import="${escapeHTML(article.id)}" aria-label="Delete ${escapeHTML(article.title)}">Delete</button>
        </li>`,
    )
    .join("");

  target.querySelectorAll("[data-delete-import]").forEach((button) => {
    button.addEventListener("click", () => {
      blogStore.deleteImported(button.dataset.deleteImport);
      renderWriting();
      renderImportedPosts();
      updateImportCount();
      setBlogStatus("Imported post deleted.");
    });
  });
}

function setBlogStatus(message, kind = "") {
  const target = document.querySelector("#blog-status");
  if (!target) return;
  target.textContent = message;
  target.dataset.status = kind;
}

function setupBlogImport() {
  const importButton = document.querySelector("#import-markdown");
  const manageButton = document.querySelector("#manage-imports");
  const input = document.querySelector("#markdown-input");
  const dialog = document.querySelector("#import-dialog");
  const clearButton = document.querySelector("#clear-imports");
  if (!importButton || !manageButton || !input || !dialog || !clearButton) return;

  let lastTrigger = null;

  importButton.addEventListener("click", () => {
    lastTrigger = importButton;
    input.click();
  });

  input.addEventListener("change", async () => {
    const files = [...input.files];
    input.value = "";
    if (!files.length) return;

    importButton.disabled = true;
    setBlogStatus(`Reading ${files.length} Markdown file${files.length > 1 ? "s" : ""}...`);
    const result = await blogStore.importFiles(files);
    renderWriting();
    updateImportCount();
    importButton.disabled = false;

    const summary = [];
    if (result.added) summary.push(`${result.added} added`);
    if (result.updated) summary.push(`${result.updated} updated`);
    if (result.rejected.length) summary.push(`${result.rejected.length} rejected`);
    if (!result.persisted && (result.added || result.updated)) summary.push("session only");
    setBlogStatus(summary.length ? `Import complete: ${summary.join(", ")}.` : "No files imported.", result.rejected.length ? "error" : "success");

    if (result.rejected.length) {
      const details = result.rejected.map((item) => `${item.name}: ${item.reason}`).join(" | ");
      setBlogStatus(`${document.querySelector("#blog-status").textContent} ${details}`, "error");
    }
  });

  manageButton.addEventListener("click", () => {
    lastTrigger = manageButton;
    renderImportedPosts();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  dialog.addEventListener("close", () => {
    lastTrigger?.focus();
  });

  clearButton.addEventListener("click", () => {
    if (!blogStore.getImportedArticles().length) return;
    if (!window.confirm("Clear all imported work posts from this browser?")) return;
    blogStore.clearImported();
    renderWriting();
    renderImportedPosts();
    updateImportCount();
    setBlogStatus("All imported posts cleared.");
  });

  updateImportCount();
}

function formatResearchDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toISOString().slice(0, 10).replace(/-/g, ".");
}

function setResearchStatus(message, kind = "") {
  const target = document.querySelector("#research-now-status");
  if (!target) return;
  target.textContent = message;
  target.dataset.status = kind;
}

function setResearchFormStatus(message, kind = "") {
  const target = document.querySelector("#research-form-status");
  if (!target) return;
  target.textContent = message;
  target.dataset.status = kind;
}

function researchTagsMarkup(tags) {
  if (!tags.length) return "";
  return tags.map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
}

function renderResearchNow() {
  const target = document.querySelector("#research-note-list");
  const countTarget = document.querySelector("#research-now-count");
  if (!target || !countTarget) return;

  const records = researchStore.getRecords();
  countTarget.textContent = `${records.length} active ${records.length === 1 ? "note" : "notes"}`;

  if (!records.length) {
    target.innerHTML = `
      <div class="research-empty-state">
        <p class="research-empty-kicker">No active notes</p>
        <p>Start a small record for the question you are working on now.</p>
        <button class="blog-control" type="button" data-new-research>＋ New note</button>
      </div>`;
  } else {
    target.innerHTML = records
      .map((record, index) => {
        let body = "<p>Nothing to preview yet.</p>";
        try {
          body = renderMarkdown(record.markdown) || body;
        } catch {
          body = "<p>Preview unavailable for this note.</p>";
        }

        return `
          <article class="research-note">
            <p class="research-note-index">${String(index + 1).padStart(2, "0")}</p>
            <div class="research-note-content">
              <div class="research-note-meta">
                <span class="research-stage">${escapeHTML(record.stage)}</span>
                <span>Updated ${escapeHTML(formatResearchDate(record.updatedAt))}</span>
              </div>
              <h3>${escapeHTML(record.title)}</h3>
              <p class="research-note-summary">${escapeHTML(record.summary)}</p>
              <div class="research-note-footer">
                <div class="research-note-tags">${researchTagsMarkup(record.tags)}</div>
                <div class="research-note-actions">
                  <button class="research-note-read" type="button" data-research-read="${escapeHTML(record.id)}" aria-expanded="false" aria-controls="research-body-${escapeHTML(record.id)}">
                    Read note <span aria-hidden="true">↓</span>
                  </button>
                  <button class="research-note-edit" type="button" data-research-edit="${escapeHTML(record.id)}">Edit</button>
                </div>
              </div>
              <div class="research-note-body markdown-body" id="research-body-${escapeHTML(record.id)}" hidden>${body}</div>
            </div>
          </article>`;
      })
      .join("");
  }

  if (!researchStore.isPersistent()) {
    setResearchStatus("Local saving is unavailable; changes will last for this session only.", "warning");
  } else if (document.querySelector("#research-now-status")?.dataset.status === "warning") {
    setResearchStatus("");
  }

  target.querySelectorAll("[data-research-read]").forEach((button) => {
    button.addEventListener("click", () => {
      const body = document.getElementById(`research-body-${button.dataset.researchRead}`);
      if (!body) return;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      body.hidden = expanded;
      button.querySelector("span").textContent = expanded ? "↓" : "↑";
    });
  });
}

function setResearchEditorMode(mode) {
  researchEditorMode = mode;
  const writeTab = document.querySelector("#research-write-tab");
  const previewTab = document.querySelector("#research-preview-tab");
  const input = document.querySelector("#research-markdown");
  const preview = document.querySelector("#research-preview");
  if (!writeTab || !previewTab || !input || !preview) return;

  const isWrite = mode === "write";
  writeTab.classList.toggle("is-active", isWrite);
  previewTab.classList.toggle("is-active", !isWrite);
  writeTab.setAttribute("aria-pressed", String(isWrite));
  previewTab.setAttribute("aria-pressed", String(!isWrite));
  input.hidden = !isWrite;
  preview.hidden = isWrite;
  if (!isWrite) updateResearchPreview();
}

function updateResearchPreview() {
  const input = document.querySelector("#research-markdown");
  const preview = document.querySelector("#research-preview");
  if (!input || !preview) return;
  const markdown = input.value.trim();
  if (!markdown) {
    preview.innerHTML = `<p class="research-preview-empty">Nothing to preview yet.</p>`;
    return;
  }

  try {
    preview.innerHTML = renderMarkdown(markdown) || `<p class="research-preview-empty">Nothing to preview yet.</p>`;
  } catch {
    preview.innerHTML = `<p class="research-preview-empty">Preview unavailable for this Markdown.</p>`;
  }
}

function openResearchEditor(id = "", trigger = null) {
  const dialog = document.querySelector("#research-dialog");
  const title = document.querySelector("#research-dialog-title");
  const titleInput = document.querySelector("#research-title");
  const stageInput = document.querySelector("#research-stage");
  const tagsInput = document.querySelector("#research-tags");
  const summaryInput = document.querySelector("#research-summary");
  const markdownInput = document.querySelector("#research-markdown");
  const deleteButton = document.querySelector("#delete-research-note");
  if (!dialog || !title || !titleInput || !stageInput || !tagsInput || !summaryInput || !markdownInput || !deleteButton) return;

  const record = id ? researchStore.getRecord(id) : null;
  editingResearchId = record?.id || "";
  lastResearchTrigger = trigger;
  title.textContent = record ? "Edit research note" : "New research note";
  titleInput.value = record?.title || "";
  stageInput.value = record?.stage || "Exploration";
  tagsInput.value = record?.tags.join(", ") || "";
  summaryInput.value = record?.summary || "";
  markdownInput.value = record?.markdown || "";
  deleteButton.hidden = !record;
  setResearchFormStatus("");
  setResearchEditorMode("write");

  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  window.requestAnimationFrame(() => titleInput.focus());
}

function closeResearchEditor() {
  const dialog = document.querySelector("#research-dialog");
  if (!dialog) return;
  if (typeof dialog.close === "function" && dialog.open) {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
  lastResearchTrigger?.focus();
  lastResearchTrigger = null;
  editingResearchId = "";
}

function setupResearchEditor() {
  const newButton = document.querySelector("#new-research-note");
  const list = document.querySelector("#research-note-list");
  const dialog = document.querySelector("#research-dialog");
  const form = document.querySelector("#research-form");
  const closeButton = document.querySelector("#research-dialog-close");
  const cancelButton = document.querySelector("#cancel-research-note");
  const deleteButton = document.querySelector("#delete-research-note");
  const writeTab = document.querySelector("#research-write-tab");
  const previewTab = document.querySelector("#research-preview-tab");
  const markdownInput = document.querySelector("#research-markdown");
  if (!newButton || !list || !dialog || !form || !closeButton || !cancelButton || !deleteButton || !writeTab || !previewTab || !markdownInput) return;

  let previewFrame = 0;
  const schedulePreview = () => {
    if (researchEditorMode !== "preview" || previewFrame) return;
    previewFrame = window.requestAnimationFrame(() => {
      previewFrame = 0;
      updateResearchPreview();
    });
  };

  newButton.addEventListener("click", () => openResearchEditor("", newButton));
  list.addEventListener("click", (event) => {
    const clickedElement = event.target instanceof Element ? event.target : null;
    const editButton = clickedElement?.closest("[data-research-edit]");
    if (editButton) {
      openResearchEditor(editButton.dataset.researchEdit, editButton);
      return;
    }
    const emptyStateButton = clickedElement?.closest("[data-new-research]");
    if (emptyStateButton) openResearchEditor("", emptyStateButton);
  });

  writeTab.addEventListener("click", () => setResearchEditorMode("write"));
  previewTab.addEventListener("click", () => setResearchEditorMode("preview"));
  markdownInput.addEventListener("input", schedulePreview);
  closeButton.addEventListener("click", closeResearchEditor);
  cancelButton.addEventListener("click", closeResearchEditor);

  form.addEventListener(
    "invalid",
    () => setResearchFormStatus("Please complete the required fields.", "error"),
    true,
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      setResearchFormStatus("Please complete the required fields.", "error");
      return;
    }

    const result = researchStore.saveDraft(
      {
        title: document.querySelector("#research-title").value,
        stage: document.querySelector("#research-stage").value,
        tags: document.querySelector("#research-tags").value,
        summary: document.querySelector("#research-summary").value,
        markdown: markdownInput.value,
      },
      editingResearchId,
    );
    if (!result.ok) {
      setResearchFormStatus(result.error, "error");
      return;
    }

    renderResearchNow();
    setResearchStatus(
      result.persisted ? "Draft saved in this browser." : "Draft saved for this session only.",
      result.persisted ? "success" : "warning",
    );
    closeResearchEditor();
  });

  deleteButton.addEventListener("click", () => {
    const record = editingResearchId ? researchStore.getRecord(editingResearchId) : null;
    if (!record) return;
    if (!window.confirm(`Delete “${record.title}” from this browser?`)) return;
    const result = researchStore.deleteRecord(record.id);
    renderResearchNow();
    setResearchStatus(
      result.persisted ? "Research note deleted." : "Research note deleted for this session only.",
      result.persisted ? "success" : "warning",
    );
    closeResearchEditor();
  });

  dialog.addEventListener("close", () => {
    if (previewFrame) window.cancelAnimationFrame(previewFrame);
    previewFrame = 0;
    lastResearchTrigger?.focus();
    lastResearchTrigger = null;
    editingResearchId = "";
  });

  dialog.addEventListener("cancel", () => {
    setResearchFormStatus("");
  });
}

function setActiveNavigation() {
  // Only in-page anchors participate; links like `/works/` would make
  // querySelector throw and abort the rest of the module.
  const links = [...document.querySelectorAll(".section-nav a")].filter((link) =>
    (link.getAttribute("href") || "").startsWith("#"),
  );
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visible) return;
      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-24% 0px -62% 0px", threshold: [0.01, 0.3, 0.7] },
  );

  sections.forEach((section) => observer.observe(section));
  links.forEach((link) => {
    link.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        const nav = link.closest(".section-nav");
        if (!nav) return;
        const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
        const centeredScroll = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
        nav.scrollTo({
          left: Math.max(0, Math.min(maxScroll, centeredScroll)),
          behavior: "smooth",
        });
      });
    });
  });
}

function setupBackToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;

  const updateVisibility = () => {
    button.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.75);
  };

  let visibilityFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (visibilityFrame) return;
      visibilityFrame = window.requestAnimationFrame(() => {
        visibilityFrame = 0;
        updateVisibility();
      });
    },
    { passive: true },
  );
  updateVisibility();

  button.addEventListener("click", () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.1 });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const WORD_SPLIT_SELECTOR =
  "#work-title, #publication-title, #patent-title, #research-now-title, #writing-title, #honors-title";

// Vanilla SplitText equivalent: wrap each text unit (one CJK character per
// unit, space-delimited latin words) in a span carrying its sequence index.
// `unitClassName` / `indexProperty` parameterize the span class and index
// variable so the focus-reveal module can reuse the exact same split logic
// (.word for the heading fades, .fword for the statement focus sweep).
// Existing markup (.title-mark, <strong>, links, <br>) is preserved, and the
// split root gets an aria-label with the original text for screen readers.
// Returns the number of units created.
function splitRevealWords(element, unitClassName = "word", indexProperty = "--w-i") {
  if (!element) return 0;
  if (element.dataset.splitWords) return Number(element.dataset.splitWords);

  const originalText = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  const isCJK = (character) =>
    /[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7ff\uf900-\ufaff\ufe30-\ufe4f\uff00-\uffef]/.test(character);
  let sequence = 0;

  const wrapUnits = (text) => {
    const fragment = document.createDocumentFragment();
    const appendWord = (value) => {
      const span = document.createElement("span");
      span.className = unitClassName;
      span.style.setProperty(indexProperty, String(sequence++));
      span.textContent = value;
      fragment.append(span);
    };
    for (const chunk of text.split(/(\s+)/)) {
      if (!chunk) continue;
      if (/^\s+$/.test(chunk)) {
        fragment.append(chunk);
        continue;
      }
      let run = "";
      let runIsCJK = null;
      const flushRun = () => {
        if (!run) return;
        if (runIsCJK) {
          for (const character of run) appendWord(character);
        } else {
          appendWord(run);
        }
        run = "";
      };
      for (const character of chunk) {
        const characterIsCJK = isCJK(character);
        if (characterIsCJK !== runIsCJK) {
          flushRun();
          runIsCJK = characterIsCJK;
        }
        run += character;
      }
      flushRun();
    }
    return fragment;
  };

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent.trim()) return;
        node.replaceChild(wrapUnits(child.textContent), child);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
        walk(child);
      }
    });
  };

  walk(element);
  element.setAttribute("aria-label", originalText);
  element.dataset.splitWords = String(sequence);
  return sequence;
}

// Must run before setupSectionReveal(): the .word spans have to exist before
// the reveal machinery adds .is-revealed, so above-fold headings animate.
function setupWordReveal() {
  // Under reduced motion the word CSS never hides anything; skipping the
  // split keeps the DOM untouched as well.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(WORD_SPLIT_SELECTOR).forEach((element) => splitRevealWords(element));
}

// ---- Focus reveal (statement copy) ----------------------------------------
// Camera-style focus effect (scrolltide.co vocabulary): the statement's words
// sit blurred until a focus frame travels across them and sharpens each one.
//
// Arming invariant (claude.com-style — content never hides without real user
// intent): the blurred armed state only exists when the copy is below the
// fold at load AND a first scroll-intent event has fired. Above the fold it
// sweeps immediately (hero moment). Coarse pointers, narrow viewports and
// reduced motion skip the whole module — they simply get plain text (chosen
// over a word-fade fallback: one behavior, zero legibility risk). The split
// only happens under JS, so no-JS visitors always see the plain paragraph.
const FOCUS_INTENT_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"];

function setupFocusReveal() {
  const container = document.querySelector(".statement-copy");
  if (!container) return;
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches ||
    window.matchMedia("(max-width: 720px)").matches ||
    !("IntersectionObserver" in window) ||
    !("MutationObserver" in window)
  ) {
    return;
  }

  if (!splitRevealWords(container, "fword", "--fi")) return;
  container.style.position = "relative";

  let armed = false;
  let sweepStarted = false;
  let stopWatching = null;

  const startSweep = () => {
    if (sweepStarted) return;
    sweepStarted = true;
    stopWatching?.();

    const units = [...container.querySelectorAll(".fword")];
    const total = units.length;
    if (!total) return;

    // Waypoints are recomputed here at sweep start (container-relative), so
    // a section translateY mid-transition or late font load cannot skew them.
    const containerRect = container.getBoundingClientRect();
    const rects = units.map((unit) => {
      const rect = unit.getBoundingClientRect();
      return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    const padding = 7;
    const duration = Math.min(2100, Math.max(900, (total - 1) * 55));
    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const frame = document.createElement("span");
    frame.className = "focus-frame";
    frame.setAttribute("aria-hidden", "true");
    // top/left anchor on the first word; the tween only varies the transform
    // plus the frame's per-word size.
    frame.style.left = `${rects[0].left - padding}px`;
    frame.style.top = `${rects[0].top - padding}px`;
    container.append(frame);

    const waypoints = rects.map((rect) => ({
      dx: rect.left - rects[0].left,
      dy: rect.top - rects[0].top,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    }));

    // Settle net: even a stalled compositor must land on sharp text.
    window.setTimeout(() => container.classList.add("focus-settled"), duration + 900);

    const dismissFrame = () => {
      frame.classList.add("is-fading");
      window.setTimeout(() => frame.remove(), 340);
    };

    if (total < 2) {
      units.forEach((unit) => unit.classList.add("is-focused"));
      container.classList.add("focus-done");
      dismissFrame();
      return;
    }

    frame.classList.add("is-active");
    let startTime = 0;
    let focusedCount = 0;

    const step = (now) => {
      if (!startTime) startTime = now;
      const linear = Math.min(1, (now - startTime) / duration);
      const progress = easeInOutCubic(linear);

      // The frame center crosses unit i's center at eased progress i/(n-1).
      while (focusedCount < total && focusedCount / (total - 1) <= progress) {
        units[focusedCount].classList.add("is-focused");
        focusedCount++;
      }

      if (linear >= 1) {
        units.forEach((unit) => unit.classList.add("is-focused"));
        container.classList.add("focus-done");
        dismissFrame();
        return;
      }

      const travel = progress * (total - 1);
      const index = Math.min(total - 2, Math.floor(travel));
      const local = travel - index;
      const from = waypoints[index];
      const to = waypoints[index + 1];
      frame.style.transform = `translate(${from.dx + (to.dx - from.dx) * local}px, ${from.dy + (to.dy - from.dy) * local}px)`;
      frame.style.width = `${from.width + (to.width - from.width) * local}px`;
      frame.style.height = `${from.height + (to.height - from.height) * local}px`;
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  // Below the fold: sweep once the section gains .is-revealed (the existing
  // reveal machinery) or — safety net for e.g. scrollbar-drag scrolls that
  // slip past every other trigger — once the copy itself enters the viewport.
  const beginWhenVisible = () => {
    const section = container.closest("main > .section");
    if (section?.classList.contains("is-revealed")) {
      startSweep();
      return;
    }
    const watchers = [];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      watchers.forEach((off) => off());
      startSweep();
    };
    if (section) {
      const classObserver = new MutationObserver(() => {
        if (section.classList.contains("is-revealed")) finish();
      });
      classObserver.observe(section, { attributes: true, attributeFilter: ["class"] });
      watchers.push(() => classObserver.disconnect());
    }
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) finish();
      },
      { threshold: 0.1 },
    );
    visibilityObserver.observe(container);
    watchers.push(() => visibilityObserver.disconnect());
    stopWatching = () => watchers.forEach((off) => off());
  };

  const arm = () => {
    if (armed) return;
    armed = true;
    container.classList.add("focus-armed");
    beginWhenVisible();
  };

  const bounds = container.getBoundingClientRect();
  if (bounds.top < window.innerHeight && bounds.bottom > 0) {
    // Copy already on screen at load: arm now, let the blurred state paint,
    // then sweep immediately — this is the hero moment.
    arm();
    window.requestAnimationFrame(() => window.requestAnimationFrame(startSweep));
    return;
  }

  const onIntent = () => {
    FOCUS_INTENT_EVENTS.forEach((type) =>
      window.removeEventListener(type, onIntent, { capture: true }),
    );
    arm();
  };
  FOCUS_INTENT_EVENTS.forEach((type) =>
    window.addEventListener(type, onIntent, { passive: true, capture: true }),
  );
}

function setupSectionReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sections = [...document.querySelectorAll("main > .section")];
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.02 },
  );

  sections.forEach((section) => {
    section.classList.add("will-reveal");
    observer.observe(section);
  });
}

function setupStudioPublishing() {
  const button = document.querySelector("#export-content");
  const status = document.querySelector("#publish-status");
  if (!button || !status) return;

  button.addEventListener("click", () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles: siteData.profiles,
      contact: siteData.contact,
      projects: siteData.projects,
      publications: siteData.publications,
      patents: siteData.patents,
      awards: siteData.awards,
      articles: blogStore.getArticles(),
      researchNotes: researchStore.getRecords(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `junjie-xu-content-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    status.textContent = "Reviewed content package exported. Run the content import command before building the public site.";
    status.dataset.status = "success";
  });
}

function setupPublicBuildAdjustments() {
  if (typeof __PUBLIC_BUILD__ === "undefined" || !__PUBLIC_BUILD__) return;

  document.querySelectorAll("[data-studio-link]").forEach((link) => link.remove());

  const focusNote = document.querySelector(".private-studio-note");
  if (focusNote) {
    focusNote.classList.add("current-focus-note");
    focusNote.innerHTML =
      locale === "zh"
        ? `<p>当前聚焦两项进行中的工作：<a class="text-link" href="/works/evidial/">EviDial 对话支持研究<span aria-hidden="true">↗</span></a> 正在筹备，<a class="text-link" href="/works/counterfactual-evidence-fidelity/">反事实证据保真度探索计划<span aria-hidden="true">↗</span></a> 也在持续推进。工作记录会先在本地整理，准备就绪后会在这里分享。</p>`
        : `<p>Current focus sits with two live efforts: the <a class="text-link" href="/works/evidial/">EviDial dialogue-support study<span aria-hidden="true">↗</span></a>, now in preparation, and the <a class="text-link" href="/works/counterfactual-evidence-fidelity/">counterfactual-evidence fidelity exploratory program<span aria-hidden="true">↗</span></a>, in active exploration. Work notes are prepared locally and will be shared here when ready.</p>`;
  }
}

function setupPortraitReveal() {
  document.querySelectorAll(".portrait-photo img").forEach((img) => {
    const markFailed = () => img.classList.add("img-failed");
    if (img.complete && img.naturalWidth === 0) {
      markFailed();
      return;
    }
    img.addEventListener("error", markFailed, { once: true });
  });
}

// "Mesh Flow" hero background: a dot grid that sits almost invisible until
// the pointer draws it into a traveling sine wave. One canvas inside .hero,
// independent from the entrance choreography (which is CSS-only on
// .hero-copy > * / .portrait and never targets the canvas).
function setupMeshFlow() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Tuning, CSS px.
  const SPACING = 26; // grid pitch
  const DOT_RADIUS = 1;
  const INFLUENCE = 170; // pointer reach
  const WAVE_LENGTH = 28; // sine wavelength along the radius
  const WAVE_SPEED = 2.6; // radians per second (wave travels outward)
  const WAVE_AMPLITUDE = 5;
  const BASE_ALPHA = 0.05;
  const BOOST_ALPHA = 0.45;
  const LERP = 0.12;
  const DPR_CAP = 2;
  const MIN_VIEWPORT = 700;
  const TAU = Math.PI * 2;

  let canvas = null;
  let context = null;
  let baseLayer = null; // offscreen pre-render of the resting grid
  let resizeObserver = null;
  let intersectionObserver = null;
  let rafId = 0;
  let running = false;
  let inViewport = true;
  let width = 0;
  let height = 0;
  let pixelRatio = 0;
  let columns = 0;
  let rows = 0;
  let originX = 0;
  let originY = 0;
  let pointerX = 0; // smoothed pointer, hero-local CSS px
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerInside = false;
  let influence = 0; // smoothed 0..1, scales the reach radius
  let needsRepaint = true; // canvas bitmap starts transparent

  const isEligible = () =>
    !reducedMotion.matches && finePointer.matches && window.innerWidth >= MIN_VIEWPORT;

  // Rendering is skipped entirely when the hero is off-screen, the tab is
  // hidden, or there is nothing animating (no pointer influence, no pending
  // repaint). The rAF loop stops instead of idling.
  const shouldRun = () =>
    Boolean(canvas) && inViewport && !document.hidden && (influence > 0 || needsRepaint);

  function start() {
    if (running || !shouldRun()) return;
    running = true;
    rafId = window.requestAnimationFrame(frame);
  }

  function frame(now) {
    rafId = 0;
    if (!canvas) {
      running = false;
      return;
    }

    if (pointerInside) {
      influence += (1 - influence) * LERP;
      pointerX += (targetX - pointerX) * LERP;
      pointerY += (targetY - pointerY) * LERP;
    } else if (influence > 0) {
      influence -= influence * LERP; // pointer left: reach collapses to 0
      if (influence < 0.001) influence = 0;
    }

    render(now / 1000);

    if (influence <= 0.002) needsRepaint = false; // base state is on canvas
    if (shouldRun()) {
      rafId = window.requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function render(seconds) {
    if (!baseLayer) return;
    context.clearRect(0, 0, width, height);

    // Resting grid: pre-rendered at full alpha once per resize; one
    // globalAlpha'd drawImage composites it.
    context.globalAlpha = BASE_ALPHA;
    context.drawImage(baseLayer, 0, 0, width, height);
    context.globalAlpha = 1;

    if (influence <= 0.002) return;

    // Only dots inside the reach square get touched; the grid is regular, so
    // neighbors come straight from index math — no per-frame allocations.
    const reach = INFLUENCE * influence;
    const reachSq = reach * reach;
    const firstColumn = Math.max(0, Math.ceil((pointerX - reach - originX) / SPACING));
    const lastColumn = Math.min(columns - 1, Math.floor((pointerX + reach - originX) / SPACING));
    const firstRow = Math.max(0, Math.ceil((pointerY - reach - originY) / SPACING));
    const lastRow = Math.min(rows - 1, Math.floor((pointerY + reach - originY) / SPACING));
    if (lastColumn < firstColumn || lastRow < firstRow) return;

    context.fillStyle = "rgb(117, 183, 255)";
    for (let row = firstRow; row <= lastRow; row += 1) {
      const gridY = originY + row * SPACING;
      const offsetY = gridY - pointerY;
      for (let column = firstColumn; column <= lastColumn; column += 1) {
        const gridX = originX + column * SPACING;
        const offsetX = gridX - pointerX;
        const distSq = offsetX * offsetX + offsetY * offsetY;
        if (distSq >= reachSq) continue;
        const dist = Math.sqrt(distSq);
        const falloff = (1 - dist / reach) * (1 - dist / reach);
        const wave = Math.sin(dist / WAVE_LENGTH - seconds * WAVE_SPEED);
        context.globalAlpha = BASE_ALPHA + BOOST_ALPHA * falloff * (0.6 + 0.4 * wave);
        context.beginPath();
        context.arc(gridX, gridY + wave * WAVE_AMPLITUDE * falloff, DOT_RADIUS, 0, TAU);
        context.fill();
      }
    }
    context.globalAlpha = 1;
  }

  function resize() {
    if (!canvas) return;
    const nextWidth = hero.clientWidth;
    const nextHeight = hero.clientHeight;
    const nextRatio = Math.min(DPR_CAP, window.devicePixelRatio || 1);
    if (nextWidth === width && nextHeight === height && nextRatio === pixelRatio) return;

    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextRatio;
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    needsRepaint = true; // bitmap resize clears the canvas

    columns = Math.max(1, Math.ceil(width / SPACING));
    rows = Math.max(1, Math.ceil(height / SPACING));
    originX = (width - (columns - 1) * SPACING) / 2;
    originY = (height - (rows - 1) * SPACING) / 2;

    baseLayer = document.createElement("canvas");
    baseLayer.width = canvas.width;
    baseLayer.height = canvas.height;
    const baseContext = baseLayer.getContext("2d");
    baseContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    baseContext.fillStyle = "rgb(117, 183, 255)";
    baseContext.beginPath();
    for (let row = 0; row < rows; row += 1) {
      const y = originY + row * SPACING;
      for (let column = 0; column < columns; column += 1) {
        const x = originX + column * SPACING;
        baseContext.moveTo(x + DOT_RADIUS, y);
        baseContext.arc(x, y, DOT_RADIUS, 0, TAU);
      }
    }
    baseContext.fill();

    // The loop may be quiescent (no influence, repaint already settled);
    // the bitmap rebuild just cleared it, so kick one repaint frame.
    start();
  }

  function trackPointer(event) {
    if (event.pointerType === "touch") return;
    const bounds = hero.getBoundingClientRect();
    targetX = event.clientX - bounds.left;
    targetY = event.clientY - bounds.top;
    if (!pointerInside) {
      pointerInside = true;
      pointerX = targetX; // snap: no wave sweeping in from a stale position
      pointerY = targetY;
      needsRepaint = true; // wake the quiescent loop
    }
    start();
  }

  function releasePointer() {
    pointerInside = false;
  }

  function handleVisibility() {
    if (!document.hidden) start();
  }

  function handleIntersection(entries) {
    inViewport = entries.some((entry) => entry.isIntersecting);
    if (inViewport) start();
  }

  function init() {
    canvas = document.createElement("canvas");
    canvas.className = "mesh-flow";
    canvas.setAttribute("aria-hidden", "true");
    hero.append(canvas);
    context = canvas.getContext("2d");
    if (!context) {
      canvas.remove();
      canvas = null;
      return;
    }

    width = 0;
    height = 0;
    pixelRatio = 0;
    inViewport = true;
    needsRepaint = true;
    resize();

    hero.addEventListener("pointermove", trackPointer, { passive: true });
    hero.addEventListener("pointerenter", trackPointer, { passive: true });
    hero.addEventListener("pointerleave", releasePointer, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(hero);
    }
    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(handleIntersection);
      intersectionObserver.observe(hero);
    }
    start();
  }

  function teardown() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    running = false;
    inViewport = true;
    influence = 0;
    pointerInside = false;
    hero.removeEventListener("pointermove", trackPointer);
    hero.removeEventListener("pointerenter", trackPointer);
    hero.removeEventListener("pointerleave", releasePointer);
    document.removeEventListener("visibilitychange", handleVisibility);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
    if (canvas) {
      canvas.remove();
      canvas = null;
      context = null;
      baseLayer = null;
    }
  }

  function handleEligibility() {
    if (isEligible()) {
      if (!canvas) init();
    } else if (canvas) {
      teardown();
    }
  }

  // Reduced motion, coarse pointer, or a viewport narrower than 700px: the
  // canvas is never created — the static page texture stays as-is.
  if (!isEligible()) return;
  init();
  reducedMotion.addEventListener("change", handleEligibility);
  finePointer.addEventListener("change", handleEligibility);
  window.addEventListener("resize", handleEligibility);
}

function setupHeroAtmosphere() {
  const hero = document.querySelector(".hero");
  const shell = document.querySelector(".page-shell");
  const rail = document.querySelector(".site-rail");

  if (!hero || !shell || !rail) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let layoutFrame = 0;
  let pointerFrame = 0;
  let pointerPosition = null;

  const updateLayout = () => {
    layoutFrame = 0;
    const shellTop = shell.getBoundingClientRect().top;
    const heroBottom = hero.getBoundingClientRect().bottom;
    const heroBoundary = Math.max(0, Math.ceil(heroBottom - shellTop));
    const railThreshold = Math.min(72, rail.getBoundingClientRect().height);

    shell.style.setProperty("--hero-boundary", `${heroBoundary}px`);
    document.body.classList.toggle("hero-rail-active", heroBottom > railThreshold);
  };

  const scheduleLayoutUpdate = () => {
    if (layoutFrame) return;
    layoutFrame = window.requestAnimationFrame(updateLayout);
  };

  const hidePointerField = () => {
    hero.style.setProperty("--hero-pointer-opacity", "0");
  };

  const updatePointerField = (event) => {
    if (reducedMotion.matches || !finePointer.matches) return;

    const bounds = hero.getBoundingClientRect();
    pointerPosition = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!pointerPosition) return;
      hero.style.setProperty("--hero-pointer-x", `${pointerPosition.x}px`);
      hero.style.setProperty("--hero-pointer-y", `${pointerPosition.y}px`);
      hero.style.setProperty("--hero-pointer-opacity", "1");
    });
  };

  const createRipple = (event) => {
    if (reducedMotion.matches || (event.pointerType === "mouse" && event.button !== 0)) return;

    const bounds = hero.getBoundingClientRect();
    const ripple = document.createElement("span");
    const removeRipple = () => ripple.remove();

    ripple.className = "hero-ripple";
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.left = `${event.clientX - bounds.left}px`;
    ripple.style.top = `${event.clientY - bounds.top}px`;
    ripple.addEventListener("animationend", removeRipple, { once: true });
    hero.append(ripple);
    window.setTimeout(removeRipple, 900);
  };

  const handleMotionPreference = () => {
    if (reducedMotion.matches || !finePointer.matches) hidePointerField();
    if (reducedMotion.matches) hero.querySelectorAll(".hero-ripple").forEach((ripple) => ripple.remove());
  };

  hero.addEventListener("pointermove", updatePointerField, { passive: true });
  hero.addEventListener("pointerleave", hidePointerField);
  hero.addEventListener("pointerdown", createRipple, { passive: true });
  window.addEventListener("scroll", scheduleLayoutUpdate, { passive: true });
  window.addEventListener("resize", scheduleLayoutUpdate, { passive: true });
  reducedMotion.addEventListener("change", handleMotionPreference);
  finePointer.addEventListener("change", handleMotionPreference);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(scheduleLayoutUpdate);
    resizeObserver.observe(hero);
    resizeObserver.observe(rail);
  }

  if (document.fonts?.ready) document.fonts.ready.then(scheduleLayoutUpdate);
  scheduleLayoutUpdate();
}

renderProfiles();
renderContactLinks();
renderProjects();
renderPublications();
renderPatents();
renderAwards();
renderResearchNow();
renderWriting();

setActiveNavigation();
setupBackToTop();
setupWordReveal();
setupFocusReveal();
setupSectionReveal();
setupPublicBuildAdjustments();
setupHeroAtmosphere();
setupMeshFlow();
setupBlogImport();
setupResearchEditor();
setupStudioPublishing();

