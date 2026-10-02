import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publicContent } from "../content/public-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = publicContent(
  JSON.parse(await readFile(resolve(root, "content/published.json"), "utf8")),
);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const firstAuthor = (p) => /^Junjie Xu\b/i.test(p.authors || "");
const text = (zh, en, cn) => (zh ? cn : en);
const arrow = '<span aria-hidden="true">↗</span>';

export function header(zh, switchUrl, active = "") {
  const home = zh ? "/zh/" : "/";
  return `<header class="site-header"><div class="header-inner">
    <a class="brand" href="${home}" aria-label="${text(zh, "Junjie Xu — home", "许俊杰 — 首页")}"><span class="brand-symbol" aria-hidden="true">jx<span>·</span></span><span class="brand-name">${text(zh, "Junjie Xu", "许俊杰")}</span></a>
    <nav class="primary-nav" aria-label="${text(zh, "Main navigation", "主导航")}">
      <a href="${home}#work">${text(zh, "Selected work", "代表工作")}</a>
      <a href="${zh ? "/works/zh/" : "/works/"}"${active === "research" ? ' aria-current="page"' : ""}>${text(zh, "Research", "研究成果")}</a>
      <a href="${home}#directions">${text(zh, "What's next", "未来方向")}</a>
      <a href="${zh ? "/writing/zh/" : "/writing/"}"${active === "writing" ? ' aria-current="page"' : ""}>${text(zh, "Notes", "随笔")}</a>
    </nav>
    <div class="header-tools"><button class="theme-toggle" type="button" data-theme-toggle aria-label="${text(zh, "Switch color theme", "切换颜色主题")}" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5a8.5 8.5 0 1 0 9.7 9.7Z"/></svg></button><a class="language-link" href="${switchUrl}" lang="${zh ? "en" : "zh-CN"}">${zh ? "EN" : "中文"}</a><a class="nav-contact" href="mailto:${esc(data.contact.email)}">${text(zh, "Let's connect", "联系我")} ${arrow}</a></div>
  </div></header>`;
}

export function footer(zh) {
  return `<footer class="site-footer"><a class="footer-name" href="${zh ? "/zh/" : "/"}">${text(zh, "Junjie Xu", "许俊杰")}<span> / </span>${text(zh, "Research with a human perspective.", "从人的体验出发，做有价值的研究。")}</a><div><span>© 2026</span><a href="${zh ? "/cv/zh/" : "/cv/"}">${text(zh, "Curriculum vitae", "学术简历")} ${arrow}</a><a href="https://github.com/AndreJJXu" target="_blank" rel="noopener noreferrer">GitHub ${arrow}</a></div></footer>`;
}

const themeInit = `(function(){try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

function shell(zh, research, body) {
  const path = research ? (zh ? "/works/zh/" : "/works/") : zh ? "/zh/" : "/";
  const title = text(
    zh,
    "Junjie Xu — Affective & Multimodal AI",
    "许俊杰 — 情感智能与多模态 AI",
  );
  const description = text(
    zh,
    "Research in multimodal alignment, affective understanding and controllable generation. Direct Ph.D. researcher at East China Normal University.",
    "华东师范大学直博生，研究多模态对齐、情感理解与可控生成。代表成果、项目经历与未来研究方向。",
  );
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Junjie Xu",
    alternateName: "许俊杰",
    jobTitle: "Ph.D. Researcher",
    affiliation: {
      "@type": "Organization",
      name: "East China Normal University",
    },
    sameAs: data.profiles.map((p) => p.url),
    knowsAbout: [
      "Multimodal Affective Computing",
      "Cross-modal Alignment",
      "Controllable Generation",
      "Human-AI Collaboration",
    ],
  };
  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}"><head>
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(title)}${research ? text(zh, " · Research", " · 研究成果") : ""}</title>
  <meta name="description" content="${esc(description)}"/><meta name="theme-color" content="#faf9f5"/>
  <meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:type" content="website"/><meta property="og:url" content="https://andrejjxu.github.io${path}"/><meta property="og:image" content="https://andrejjxu.github.io/assets/junjie-xu-portrait-web.jpg"/><meta name="twitter:card" content="summary"/>
  <link rel="canonical" href="https://andrejjxu.github.io${path}"/><link rel="alternate" hreflang="en" href="https://andrejjxu.github.io${research ? "/works/" : "/"}"/><link rel="alternate" hreflang="zh-CN" href="https://andrejjxu.github.io${research ? "/works/zh/" : "/zh/"}"/>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"/><link rel="alternate" type="application/atom+xml" title="${text(zh, "Research notes", "研究随笔")}" href="${zh ? "/zh/feed.xml" : "/feed.xml"}"/>
  <script>${themeInit}</script><link rel="stylesheet" href="/portfolio.css"/>
  <script type="application/ld+json">${JSON.stringify(person)}</script>
</head><body class="portfolio-page" data-page="public" data-view="${research ? "research" : "home"}" data-locale="${zh ? "zh" : "en"}">
  <a class="skip-link" href="#main">${text(zh, "Skip to content", "跳转到正文")}</a>
  ${header(zh, research ? (zh ? "/works/" : "/works/zh/") : zh ? "/" : "/zh/", research ? "research" : "")}
  <main id="main" class="portfolio-main">${body}</main>${footer(zh)}
  <script type="module" src="/portfolio.js"></script>
</body></html>\n`;
}

function waveform() {
  const heights = [
    12, 18, 30, 24, 46, 68, 48, 86, 116, 84, 56, 100, 138, 110, 78, 122, 160,
    132, 84, 52, 74, 44, 28, 20,
  ];
  return `<svg class="waveform" viewBox="0 0 360 200" fill="none" role="img" aria-label="Sound waveform"><g fill="currentColor">${heights.map((h, i) => `<rect x="${14 + i * 14}" y="${100 - h / 2}" width="5" height="${h}" rx="2.5"/>`).join("")}</g></svg>`;
}

function selectedWorks(zh) {
  return `<div class="selected-grid">
    <article class="feature-card mars-card"><div class="feature-copy"><div class="card-topline"><span class="mini-label">01 / CROSS-MODAL GENERATION</span><span class="badge">${text(zh, "Published · First author", "已发表 · 第一作者")}</span></div><h3>MARS<span class="card-title-detail">${text(zh, "From sound to a visual world.", "从声音，到视觉世界。")}</span></h3><p>${text(zh, "Fine-grained audio–image alignment brings semantic detail and aesthetic quality into the same generation process.", "以细粒度音画对齐连接声音与图像，在生成过程中兼顾语义细节与视觉美感。")}</p><div class="feature-bottom"><span>Information Processing &amp; Management</span><a class="circle-link" href="${zh ? "/works/zh/mars/" : "/works/mars/"}" aria-label="${text(zh, "Read the MARS project", "阅读 MARS 项目")}">${arrow}</a></div></div><div class="sound-art" aria-hidden="true"><span class="art-caption">SOUND → VISION</span>${waveform()}<div class="visual-tiles"><span class="visual-tile tile-one"></span><span class="visual-tile tile-two"></span><span class="visual-tile tile-three"></span></div><span class="art-footnote">${text(zh, "Alignment. Detail. Aesthetics.", "对齐 · 细节 · 美感")}</span></div></article>
    <article class="feature-card sentiment-card"><div class="card-topline"><span class="mini-label">02 / AFFECTIVE UNDERSTANDING</span><span class="badge">${text(zh, "Published", "已发表")}</span></div><div class="node-art" aria-hidden="true"><svg viewBox="0 0 380 100" fill="none"><path d="M40 50L125 22L220 65L335 30M40 50L130 78L220 65M125 22L335 30" stroke="currentColor" stroke-width="1.3"/><g fill="currentColor"><circle cx="40" cy="50" r="7"/><circle cx="125" cy="22" r="5"/><circle cx="130" cy="78" r="5"/><circle cx="220" cy="65" r="8"/><circle cx="335" cy="30" r="6"/></g></svg></div><h3>${text(zh, "Understanding sentiment,<br/>in its context.", "理解情感，<br/>也理解它的语境。")}</h3><p>${text(zh, "First-author research in aspect-level sentiment analysis, with published work in ACM TALLIP and IJCNN.", "以图结构建模语义、句法与情感知识，相关一作工作发表于 ACM TALLIP 与 IJCNN。")}</p><div class="feature-bottom"><span>ACM TALLIP · IJCNN</span><a class="circle-link" href="${zh ? "/works/zh/bdann/" : "/works/bdann/"}" aria-label="${text(zh, "Read sentiment analysis research", "阅读情感分析研究")}">${arrow}</a></div></article>
    <article class="feature-card healing-card"><div class="card-topline"><span class="mini-label">03 / RESEARCH INTO PRACTICE</span><span class="badge">${text(zh, "Project lead", "项目负责人")}</span></div><div class="healing-art" aria-hidden="true"><span></span><span></span><span></span><span></span></div><h3>${text(zh, "Technology with<br/>a little more care.", "让技术，<br/>多一份关怀。")}</h3><p>${text(zh, "Led the ECNU multimodal digital-support project, rated excellent at completion. Exploring how affective generation can support everyday experience.", "主持多模态数字药物交叉学科项目，结题评定优秀；探索情感生成如何服务于日常体验与数字健康支持。")}</p><div class="feature-bottom"><span>${text(zh, "ECNU · 2024–2025 · Excellent", "华东师范大学 · 2024–2025 · 结题优秀")}</span><a class="circle-link" href="mailto:${esc(data.contact.email)}" aria-label="${text(zh, "Contact Junjie about digital support", "联系许俊杰了解数字健康项目")}">${arrow}</a></div></article>
  </div>`;
}

function publicationList(zh, publications, filter = false) {
  return `<ol class="paper-list"${filter ? " data-publication-list" : ""}>${publications
    .map((p) => {
      const link = p.url && /^https:\/\//.test(p.url) ? p.url : "";
      const venue = p.venue;
      const authors = esc(p.authors).replace(
        /Junjie Xu|J Xu\b/g,
        "<strong>$&</strong>",
      );
      return `<li class="paper-row" data-first-author="${firstAuthor(p)}"><div><span class="paper-type">${firstAuthor(p) ? text(zh, "FIRST AUTHOR", "第一作者") : text(zh, "CO-AUTHOR", "共同作者")}</span><h3>${link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(p.title)} ${arrow}</a>` : esc(p.title)}</h3><p class="paper-authors">${authors}</p></div><div class="paper-meta"><span>${esc(venue)}</span><span class="published-mark"><i></i>${text(zh, p.status, p.statusZh || "已发表")}</span></div></li>`;
    })
    .join("")}</ol>`;
}

function home(zh) {
  const featured = data.publications.filter((p) => p.featured);
  const firstCount = data.publications.filter(firstAuthor).length;
  const capabilities = [
    [
      "01",
      text(zh, "Connect the modalities.", "连接不同模态。"),
      text(
        zh,
        "Audio, language and images — with alignment that preserves the details that matter.",
        "从声音、语言到图像，让跨模态对齐保留真正重要的语义细节。",
      ),
      "MARS · IPM",
    ],
    [
      "02",
      text(zh, "Understand the human signal.", "理解人的信号。"),
      text(
        zh,
        "Bring affect, context and human feedback into how models interpret and generate.",
        "把情感、语境与人的反馈，带入模型的理解和生成过程。",
      ),
      "ACM TALLIP · IJCNN",
    ],
    [
      "03",
      text(zh, "Make research useful.", "让研究产生价值。"),
      text(
        zh,
        "Lead projects from research questions to prototypes and human-centered applications.",
        "从研究问题到原型与应用，以项目负责人的角色推进完整研究过程。",
      ),
      text(zh, "2 funded projects led", "主持 2 项科研课题"),
    ],
  ];
  const directions = [
    [
      "01",
      "HUMAN–AI COLLABORATION",
      text(zh, "Affective, trustworthy agents.", "情感智能体与可信协作"),
      text(
        zh,
        "How can affective cues and human feedback support appropriate trust, oversight and long-term collaboration?",
        "研究情感线索与人类反馈如何支持恰当的信任、有效的监督和持续的人机协作。",
      ),
      text(
        zh,
        "Affective computing → agent collaboration",
        "从情感计算，走向智能体协作",
      ),
    ],
    [
      "02",
      "CONTROLLABLE GENERATION",
      text(zh, "Generation with human intent.", "以人的意图控制生成"),
      text(
        zh,
        "Build on audio–image alignment toward multimodal generation shaped by emotional intent and human preferences.",
        "以音画对齐积累为基础，探索由情感意图和人类偏好驱动的多模态可控生成。",
      ),
      text(
        zh,
        "Cross-modal alignment → preference learning",
        "从跨模态对齐，走向偏好学习",
      ),
    ],
    [
      "03",
      "HUMAN-CENTERED APPLICATIONS",
      text(
        zh,
        "Digital support, thoughtfully built.",
        "面向体验的数字健康支持",
      ),
      text(
        zh,
        "Turn research into carefully evaluated experiences for digital well-being and educational support.",
        "把研究转化为可验证的交互体验，探索数字健康与教育支持中的应用价值。",
      ),
      text(
        zh,
        "Project leadership → real-world evaluation",
        "从项目推进，走向真实场景验证",
      ),
    ],
  ];
  return shell(
    zh,
    false,
    `
  <section class="hero-section" id="about" aria-labelledby="page-title"><div class="hero-content">
    <p class="eyebrow"><span class="status-dot"></span>${text(zh, "AFFECTIVE AI · MULTIMODAL INTELLIGENCE", "情感智能 · 多模态 AI")}</p>
    <h1 id="page-title">${text(zh, "Intelligence,<br/><em>shaped by people.</em>", '让智能，<br/>更懂<span class="hero-emphasis">人的体验。</span>')}</h1>
    <p class="hero-identity">${text(zh, "I'm Junjie Xu.", "我是许俊杰。")} <span>${text(zh, "Ph.D. researcher at ECNU.", "华东师范大学计算机科学与技术学院直博生。")}</span></p>
    <p class="hero-description">${text(zh, "I connect sound, images and human experience through multimodal alignment, affective understanding and controllable generation.", '我研究声音、图像与人的体验之间的连接，<br class="desktop-break"/>聚焦多模态对齐、情感理解与可控生成。')}</p>
    <div class="hero-actions"><a class="button button-primary" href="#work">${text(zh, "Explore selected work", "了解代表工作")}<span aria-hidden="true">↓</span></a><a class="button button-secondary" href="${zh ? "/cv/zh/" : "/cv/"}">${text(zh, "View my CV", "查看学术简历")} ${arrow}</a></div>
    <div class="hero-profiles">${data.profiles.map((p) => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.label)} ${arrow}</a>`).join("")}</div>
  </div><figure class="hero-portrait"><div class="portrait-frame"><picture><source type="image/webp" srcset="/assets/junjie-xu-portrait-web.webp"/><img src="/assets/junjie-xu-portrait-web.jpg" alt="${text(zh, "Portrait of Junjie Xu", "许俊杰肖像")}" width="800" height="1000" fetchpriority="high"/></picture><div class="portrait-label"><span>${text(zh, "Junjie Xu", "许俊杰")}<small>East China Normal University</small></span><span class="portrait-mark" aria-hidden="true">↗</span></div></div><figcaption><span class="status-dot"></span>${text(zh, "Based in Shanghai · Thinking beyond modalities", "立足上海 · 探索模态之间的可能")}</figcaption></figure></section>
  <section class="proof-strip" aria-label="${text(zh, "Research at a glance", "研究概览")}"><div><strong>${firstCount}<span> / ${data.publications.length}</span></strong><span>${text(zh, "First-author / published papers", "第一作者 / 已发表论文")}</span></div><div><strong>2</strong><span>${text(zh, "Funded research projects led", "主持科研课题")}</span></div><div><strong>${data.patents.length}</strong><span>${text(zh, "Patent applications · co-inventor", "公开专利申请 · 共同发明人")}</span></div><div class="visit-proof"><span class="mini-label">NEXT CHAPTER</span><strong>ECNU <span aria-hidden="true">→</span> NTU</strong><span>${text(zh, "CSC-funded visit · Nov 2026–Nov 2027", "CSC 资助访学 · 2026.11–2027.11")}</span></div></section>
  <section class="content-section strengths-section" aria-labelledby="strengths-title"><div class="section-heading"><div><p class="eyebrow">${text(zh, "A CONNECTED RESEARCH PATH", "贯穿研究的一条主线")}</p><h2 id="strengths-title">${text(zh, "Technical depth.<br/>A human perspective.", "技术的深度，<br/>与人的视角。")}</h2></div><p>${text(zh, "My work brings three capabilities together — from understanding a signal to building something meaningful with it.", '将三种能力连接起来：理解信号，控制生成，<br class="desktop-break"/>再把研究推进到有价值的应用。')}</p></div><div class="strength-grid">${capabilities.map(([n, title, copy, evidence]) => `<article class="strength-item"><span class="item-number">${n}</span><h3>${title}</h3><p>${copy}</p><span class="evidence-tag">${evidence}</span></article>`).join("")}</div></section>
  <section class="content-section" id="work" aria-labelledby="work-title"><div class="section-heading"><div><p class="eyebrow">SELECTED WORK / 01–03</p><h2 id="work-title">${text(zh, "A few works.<br/>A clearer picture.", "用代表工作，<br/>说明我能做什么。")}</h2></div><a class="text-link" href="${zh ? "/works/zh/" : "/works/"}">${text(zh, "Explore published research", "浏览已发表研究")} ${arrow}</a></div>${selectedWorks(zh)}</section>
  <section class="content-section directions-section" id="directions" aria-labelledby="directions-title"><div class="section-heading"><div><p class="eyebrow">WHAT'S NEXT</p><h2 id="directions-title">${text(zh, "Where this work<br/>could go next.", "沿着积累，<br/>探索下一种可能。")}</h2></div><p>${text(zh, "Prospective directions grounded in my current work. Open to conversations and research collaboration.", '从现有研究积累出发的未来方向，<br class="desktop-break"/>也期待由此开启新的交流与合作。')}</p></div><div class="direction-grid">${directions.map(([n, label, title, copy, base]) => `<article class="direction-card"><div class="direction-top"><span>${n}</span>${arrow}</div><p class="mini-label">${label}</p><h3>${title}</h3><p>${copy}</p><div class="direction-base">${base}</div></article>`).join("")}</div><div class="visit-note"><span class="visit-icon" aria-hidden="true">↗</span><p><strong>${text(zh, "A new research chapter at NTU.", "即将在南洋理工大学开启新的研究阶段。")}</strong><span>${text(zh, "CSC-funded visiting research with Prof. Eric Cambria, scheduled for November 2026–November 2027.", "获 CSC 资助，计划于 2026 年 11 月至 2027 年 11 月赴 Eric Cambria 教授团队访学。")}</span></p></div></section>
  <section class="content-section compact-research" id="publications" aria-labelledby="publication-title"><div class="section-heading"><div><p class="eyebrow">PUBLISHED RESEARCH</p><h2 id="publication-title">${text(zh, "Selected publications.", "精选论文。")}</h2></div><a class="text-link" href="${zh ? "/works/zh/" : "/works/"}#publications">${text(zh, `All ${data.publications.length} published papers`, `全部 ${data.publications.length} 篇已发表论文`)} ${arrow}</a></div>${publicationList(zh, featured)}</section>
  <section class="content-section credentials-section" aria-label="${text(zh, "Further experience", "更多经历")}"><details class="credential-details" id="patents"><summary><span><small>${text(zh, "INNOVATION", "技术创新")}</small>${text(zh, `${data.patents.length} patent applications`, `${data.patents.length} 项公开专利申请`)}</span><span class="details-plus" aria-hidden="true">+</span></summary><p class="detail-intro">${text(zh, "Co-inventor; public application numbers are listed for verification.", "以共同发明人身份申请，以下列出公开的专利公开号。")}</p><ol class="patent-records">${data.patents.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.publicationNumber)} · ${esc(p.publicationDate)}</p></li>`).join("")}</ol></details><details class="credential-details" id="honors"><summary><span><small>${text(zh, "RECOGNITION", "荣誉与经历")}</small>${text(zh, "Honors & project experience", "荣誉与项目经历")}</span><span class="details-plus" aria-hidden="true">+</span></summary><ul class="honor-records">${data.awards.map((a) => `<li><span>${esc(a.year)}</span><div><strong>${esc(zh ? a.nameZh || a.name : a.name)}</strong><p>${esc(zh ? a.orgZh || a.org : a.org)}</p></div></li>`).join("")}</ul></details></section>
  <section class="contact-section" id="contact" aria-labelledby="contact-title"><p class="eyebrow">LET'S CONNECT</p><h2 id="contact-title">${text(zh, "Good research starts<br/>with a conversation.", "好的研究，<br/>也始于一次交流。")}</h2><p>${text(zh, "For research, collaboration, or a shared question.", "关于研究、合作，或者一个值得共同探索的问题。")}</p><a class="button button-primary" href="mailto:${esc(data.contact.email)}">${text(zh, "Get in touch", "与我联系")} ${arrow}</a><a class="contact-email" href="mailto:${esc(data.contact.email)}">${esc(data.contact.email)}</a></section>`,
  );
}

function research(zh) {
  return shell(
    zh,
    true,
    `<section class="research-intro"><p class="eyebrow">RESEARCH / SELECTED &amp; PUBLISHED</p><h1>${text(zh, "Ideas, with<br/><em>evidence behind them.</em>", "让想法，<br/>有成果作为回答。")}</h1><p>${text(zh, "A focused collection of published work in multimodal generation, affective computing and language understanding.", "围绕多模态生成、情感计算与语言理解，<br/>展示已经发表的研究与代表工作。")}</p></section><section id="work" aria-label="${text(zh, "Selected works", "代表工作")}">${selectedWorks(zh)}</section><section class="content-section" id="publications"><div class="section-heading"><div><p class="eyebrow">PUBLICATION INDEX</p><h2>${text(zh, "Published work.", "已发表论文。")}</h2></div><a class="text-link" href="/assets/junjie-xu-publications.bib" download>${text(zh, "Export citations", "导出文献引用")} ↓</a></div><div class="publication-controls" role="group" aria-label="${text(zh, "Filter publications", "筛选论文")}"><button class="is-active" type="button" data-publication-filter="all" aria-pressed="true">${text(zh, "All published", "全部已发表")} <span>${data.publications.length}</span></button><button type="button" data-publication-filter="first" aria-pressed="false">${text(zh, "First author", "第一作者")} <span>${data.publications.filter(firstAuthor).length}</span></button><span class="filter-status" role="status" aria-live="polite" data-filter-status>${text(zh, `${data.publications.length} papers`, `${data.publications.length} 篇论文`)}</span></div>${publicationList(zh, data.publications, true)}<p class="research-footnote">${text(zh, "For ongoing research and potential collaboration, please get in touch.", "关于正在开展的研究与潜在合作，欢迎联系交流。")}</p></section>`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  for (const [file, zh, researchPage] of [
    ["index.html", false, false],
    ["zh/index.html", true, false],
    ["works/index.html", false, true],
    ["works/zh/index.html", true, true],
  ]) {
    await mkdir(dirname(resolve(root, file)), { recursive: true });
    await writeFile(
      resolve(root, file),
      researchPage ? research(zh) : home(zh),
    );
  }
  console.log(
    `Portfolio pages generated: 2 locales, ${data.publications.length} published papers.`,
  );
}
