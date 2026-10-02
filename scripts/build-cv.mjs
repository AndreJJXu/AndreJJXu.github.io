import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publicContent } from "../content/public-policy.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const published = publicContent(JSON.parse(
  await readFile(resolve(projectRoot, "content/published.json"), "utf8"),
));

// ------------------------------------------------------------------
// Manually managed CV facts that are not part of the published content
// package yet. Edit here; everything else syncs from published.json.
// ------------------------------------------------------------------
const managed = {
  email: "jjxu_dr@stu.ecnu.edu.cn",
  site: "https://andrejjxu.github.io",
  profiles: [
    { label: "Google Scholar", url: "https://scholar.google.com/citations?user=Ezn3PjgAAAAJ" },
    { label: "GitHub", url: "https://github.com/AndreJJXu" },
    { label: "ORCID", url: "https://orcid.org/0009-0007-1965-867X" },
  ],
  interests: {
    en: ["Multimodal Affective Computing", "Cross-modal Alignment", "Music-to-Image Generation", "Human-AI Collaboration"],
    zh: ["多模态情感计算", "跨模态对齐", "音乐图像生成", "人机混合智能"],
  },
  education: [
    {
      period: "2023 — 2028 (expected)",
      periodZh: "2023 — 2028（预计）",
      en: "Direct Ph.D. student, Computer Science — East China Normal University, Shanghai",
      zh: "华东师范大学 计算机科学与技术学院 直博生（计算机科学与技术专业）",
    },
    {
      period: "2026.11 — 2027.11",
      periodZh: "2026.11 — 2027.11",
      en: "Upcoming visiting research, Nanyang Technological University — hosted by Prof. Eric Cambria (CSC-funded)",
      zh: "计划开展 CSC 资助的新加坡南洋理工大学联合培养（师从 Eric Cambria 教授）",
    },
  ],
  projects: [
    {
      en: {
        name: "Multimodal Digital Therapeutics",
        role: "Project Director",
        meta: "Interdisciplinary Research Project · ECNU · 2024 — 2025 · Rated Excellent",
        summary:
          "Led a research project on multimodal digital support, emotional experience, and human-centered interaction.",
      },
      zh: {
        name: "多模态数字药物研究",
        role: "项目负责人",
        meta: "校内交叉学科研究项目 · 华东师范大学 · 2024 — 2025 · 结题优秀",
        summary: "负责人机混合下基于多模态的数字药物研究，探索情感体验与多模态交互的数字健康支持。",
      },
    },
    {
      en: {
        name: "Emotion-Controllable Music-to-Image",
        role: "Project Director",
        meta: "Doctoral Research Innovation Fund · ECNU · 2023 · Advised by Liang He",
        summary: "Explored how human feedback and affective intent shape cross-modal music-to-image generation.",
      },
      zh: {
        name: "情感可控的音乐图像生成研究",
        role: "项目负责人",
        meta: "博士生科研创新基金 · 华东师范大学 · 2023 · 指导教师 Liang He",
        summary: "探索如何将人类反馈与情感意图带入音乐到图像的跨模态生成。",
      },
    },
    {
      en: {
        name: "EduChat-R1",
        role: "Participant",
        meta: "Open Education Reasoning Model · ECNU · 2025 · Open-source release",
        summary: "Contributed to an open education reasoning model through research, engineering, and open-source collaboration.",
      },
      zh: {
        name: "EduChat-R1 开源教育推理模型",
        role: "项目参与",
        meta: "开源教育推理模型 · 华东师范大学 · 2025 · 开源发布",
        summary: "参与开源教育推理模型项目，支持面向教育场景的推理能力建设与开源协作。",
      },
    },
  ],
  awards: [
    { year: "2025", en: "Kuanrui Talent Scholarship", zh: "宽睿英才奖学金", org: "ECNU School of Computer Science and Technology", orgZh: "华东师范大学计算机科学与技术学院" },
    { year: "2023", en: "Shanghai Outstanding Graduate", zh: "上海市优秀毕业生", org: "Shanghai Municipal Education Commission", orgZh: "上海市教育委员会" },
    { year: "2023", en: "National Third Prize · Challenge Cup", zh: "“挑战杯”全国三等奖", org: "China Association for Science and Technology", orgZh: "中国科学技术协会" },
    { year: "2022", en: "Huaxin Scholarship", zh: "华鑫奖学金", org: "ECNU School of Computer Science and Technology", orgZh: "华东师范大学计算机科学与技术学院" },
  ],

};

const publications = Array.isArray(published.publications) ? published.publications : [];
const patents = Array.isArray(published.patents) ? published.patents : [];
const name = { en: "Junjie Xu", zh: "许俊杰" };
const role = {
  en: "Direct Ph.D. Researcher · Affective AI · East China Normal University",
  zh: "华东师范大学 直博生 · 情感人工智能研究方向",
};

const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function publicationEntry(pub, lang) {
  const authors = esc(pub.authors).replace(
    /Junjie Xu|许俊杰/,
    (m) => `<strong>${m}</strong>`,
  );
  const title = pub.url
    ? `<a href="${esc(pub.url)}">${esc(pub.title)}</a>`
    : esc(pub.title);
  const status = lang === "zh" ? pub.statusZh || pub.status : pub.status;
  return `<li>
    <p class="pub-title">${title}</p>
    <p class="pub-authors">${authors}</p>
    <p class="pub-venue">${esc(pub.venue)}${status ? ` <span class="chip">${esc(status)}</span>` : ""}</p>
  </li>`;
}

function render(lang) {
  const t =
    lang === "zh"
      ? {
          interests: "研究方向",
          education: "教育经历",
          publications: "论文发表",
          pubNote: "以下仅列已发表论文，包括第一作者与合作研究成果。",
          patents: "发明专利",
          patNote: "以下专利均以共同发明人身份申请，公开号可在中国专利公布公告网查询。",
          projects: "科研项目",
          awards: "荣誉奖项",
          print: "打印 / 存为 PDF",
          pdf: "下载 PDF",
          back: "返回主页",
          updated: `更新于 ${new Date().toISOString().slice(0, 10)}`,
          switchLang: "English",
          switchHref: "/cv/",
        }
      : {
          interests: "Research Interests",
          education: "Education",
          publications: "Publications",
          pubNote: "Published papers only, including first-author and collaborative research.",
          patents: "Patents",
          patNote: "All patents filed as co-inventor; publication numbers verifiable on China's patent gazette.",
          projects: "Research Projects",
          awards: "Honors & Awards",
          print: "Print / Save as PDF",
          pdf: "Download PDF",
          back: "Back to site",
          updated: `Updated ${new Date().toISOString().slice(0, 10)}`,
          switchLang: "中文",
          switchHref: "/cv/zh/",
        };

  const contactLine = [
    `<a href="mailto:${esc(managed.email)}">${esc(managed.email)}</a>`,
    `<a href="/">${esc(managed.site.replace("https://", ""))}</a>`,
    ...managed.profiles.map((p) => `<a href="${esc(p.url)}">${esc(p.label)}</a>`),
  ].join('<span class="dot">·</span>');

  return `<!doctype html>
<html lang="${lang === "zh" ? "zh-CN" : "en"}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>${esc(name[lang])} · Curriculum Vitae</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
<style>
  :root { --ink: #10151d; --secondary: #4a5563; --tertiary: #6d7885; --line: #e3e7ec; --accent: #1d5fb4; --font-serif: Georgia, "Times New Roman", "Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #f4f5f7;
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Segoe UI", sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .sheet {
    max-width: 820px;
    margin: 40px auto;
    padding: 56px 60px;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(16, 21, 29, 0.08);
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  header h1 { margin: 0; font-family: var(--font-serif); font-size: 34px; font-weight: 700; letter-spacing: -0.02em; }
  header .role { margin: 8px 0 0; color: var(--secondary); font-size: 15px; }
  header .contact { margin: 14px 0 0; color: var(--tertiary); font-size: 12.5px; }
  header .contact .dot { margin: 0 8px; }
  section { margin-top: 34px; }
  section > h2 {
    margin: 0 0 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);
    font-family: var(--font-serif);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .note { margin: -6px 0 12px; color: var(--tertiary); font-size: 12px; }
  ul { margin: 0; padding: 0; list-style: none; }
  .interests li, .edu li {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 16px;
    padding: 8px 0;
  }
  .radar-wrap {
    display: grid;
    grid-template-columns: 400px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }
  .radar { width: 100%; height: auto; }
  .radar-grid polygon { fill: none; stroke: var(--line); }
  .radar-grid line { stroke: var(--line); }
  .radar-data {
    fill: rgba(29, 95, 180, 0.13);
    stroke: var(--accent);
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .radar-dots circle { fill: var(--accent); }
  .radar-labels text { font-size: 11px; fill: var(--secondary); }
  .radar-labels .radar-name { font-weight: 600; }
  .radar-labels .radar-score { font-weight: 700; fill: var(--ink); }
  .radar-notes { display: grid; gap: 16px; }
  .radar-note-block h3 {
    margin: 0 0 8px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--ink);
  }
  .radar-note-block li { padding: 7px 0; }
  .radar-note-block li + li { border-top: 1px solid var(--line); }
  .radar-note-block strong { display: block; font-size: 13px; }
  .radar-note-block span { display: block; margin-top: 2px; color: var(--secondary); font-size: 12.5px; }
  .improve-block h3 { color: #b4562f; }
  .improve-block li strong { color: #b4562f; }
  .edu li + li { border-top: 1px solid var(--line); }
  .period { color: var(--tertiary); font-size: 12.5px; padding-top: 2px; }
  .interests li { display: block; padding: 2px 0; }
  .interests .tags { color: var(--secondary); }
  .pub-title { margin: 0; font-weight: 600; line-height: 1.45; }
  .pub-authors { margin: 3px 0 0; color: var(--secondary); font-size: 12.5px; }
  .pub-venue { margin: 3px 0 0; color: var(--tertiary); font-size: 12.5px; font-style: italic; }
  .pubs li, .patents li { padding: 10px 0; }
  .pubs li + li, .patents li + li { border-top: 1px solid var(--line); }
  .chip {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 8px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: #f6f8fa;
    color: var(--secondary);
    font-size: 10.5px;
    font-style: normal;
    font-weight: 600;
    vertical-align: 1px;
  }
  .proj { padding: 10px 0; }
  .proj + .proj { border-top: 1px solid var(--line); }
  .proj-head { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: baseline; }
  .proj-head strong { font-size: 14.5px; }
  .proj-head .role-chip { color: var(--accent); font-size: 12px; font-weight: 600; }
  .proj p { margin: 4px 0 0; color: var(--secondary); font-size: 13px; }
  .proj .meta { color: var(--tertiary); font-size: 12px; }
  .award { display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 14px; padding: 7px 0; }
  .award + .award { border-top: 1px solid var(--line); }
  .award .year { color: var(--tertiary); font-size: 12.5px; padding-top: 2px; }
  .award .org { display: block; color: var(--tertiary); font-size: 12px; }
  footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    gap: 16px;
    color: var(--tertiary);
    font-size: 12px;
  }
  .toolbar {
    position: sticky;
    top: 16px;
    z-index: 5;
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }
  .toolbar button, .toolbar a {
    padding: 9px 18px;
    border: 0;
    border-radius: 999px;
    background: #10151d;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 10px 26px rgba(16, 21, 29, 0.25);
  }
  .toolbar button:hover, .toolbar a:hover { background: #2a3342; }
  @media (max-width: 700px) {
    .sheet { margin: 16px; padding: 32px 24px; }
    .interests li, .edu li, .award { grid-template-columns: 1fr; gap: 2px; }
    .radar-wrap { grid-template-columns: 1fr; }
    .radar { max-width: 340px; margin: 0 auto; }
  }
  @media print {
    body { background: #fff; font-size: 12px; }
    .sheet { margin: 0; padding: 0; border: 0; border-radius: 0; box-shadow: none; max-width: none; }
    .toolbar { display: none !important; }
    section { break-inside: avoid-page; }
    .pubs li, .patents li, .proj, .award { break-inside: avoid; }
    a { color: var(--ink); }
    header h1 { font-size: 28px; }
    .improve-block { display: none !important; }
    .radar-wrap { grid-template-columns: 360px minmax(0, 1fr); gap: 20px; }
    .radar-note-block span { font-size: 11px; }
  }
  @page { size: A4; margin: 14mm; }
</style>
</head>
<body>
  <div class="toolbar">
    <button type="button" onclick="window.print()">${t.print}</button>
    <a href="/assets/cv/junjie-xu-cv-${lang === "zh" ? "zh" : "en"}.pdf" download>${t.pdf} ↓</a>
    <a href="${t.switchHref}">${t.switchLang}</a>
    <a href="/">← ${t.back}</a>
  </div>
  <div class="sheet">
    <header>
      <h1>${esc(name[lang])}</h1>
      <p class="role">${esc(role[lang])}</p>
      <p class="contact">${contactLine}</p>
    </header>

    <section>
      <h2>${t.interests}</h2>
      <ul class="interests">
        <li><span class="tags">${managed.interests[lang].map(esc).join('<span class="dot"> · </span>')}</span></li>
      </ul>
    </section>



    <section>
      <h2>${t.education}</h2>
      <ul class="edu">
        ${managed.education.map((item) => `<li><span class="period">${esc(lang === "zh" ? item.periodZh : item.period)}</span><span>${esc(lang === "zh" ? item.zh : item.en)}</span></li>`).join("\n        ")}
      </ul>
    </section>

    <section>
      <h2>${t.publications}</h2>
      <p class="note">${t.pubNote}</p>
      <ul class="pubs">
        ${publications.map((pub) => publicationEntry(pub, lang)).join("\n        ")}
      </ul>
    </section>

    <section>
      <h2>${t.patents}</h2>
      <p class="note">${t.patNote}</p>
      <ul class="patents">
        ${patents.map((patent) => `<li><p class="pub-title">${esc(patent.title)}</p><p class="pub-venue">${esc(patent.publicationNumber)} · ${esc(patent.publicationDate)}</p></li>`).join("\n        ")}
      </ul>
    </section>

    <section>
      <h2>${t.projects}</h2>
      ${managed.projects.map((project) => {
        const item = project[lang];
        return `<div class="proj">
          <div class="proj-head"><strong>${esc(item.name)}</strong><span class="role-chip">${esc(item.role)}</span></div>
          <p class="meta">${esc(item.meta)}</p>
          <p>${esc(item.summary)}</p>
        </div>`;
      }).join("\n      ")}
    </section>

    <section>
      <h2>${t.awards}</h2>
      <ul>
        ${managed.awards.map((award) => `<li class="award"><span class="year">${esc(award.year)}</span><span>${esc(lang === "zh" ? award.zh : award.en)}<span class="org">${esc(lang === "zh" ? award.orgZh : award.org)}</span></span></li>`).join("\n        ")}
      </ul>
    </section>

    <footer>
      <span>${esc(name[lang])} · Curriculum Vitae</span>
      <span>${t.updated}</span>
    </footer>
  </div>
</body>
</html>
`;
}

const distCv = resolve(projectRoot, "dist/cv");
await mkdir(distCv, { recursive: true });
await writeFile(resolve(distCv, "index.html"), render("en"));
await mkdir(resolve(distCv, "zh"), { recursive: true });
await writeFile(resolve(distCv, "zh/index.html"), render("zh"));
console.log("cv pages generated: dist/cv/index.html, dist/cv/zh/index.html");
