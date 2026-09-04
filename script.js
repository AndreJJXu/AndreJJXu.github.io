import { createBlogStore, renderMarkdown } from "./blog-import.js";
import { createResearchStore } from "./research-now.js";
import publishedContent from "./content/published.json";

const siteData = {
  contact: {
    email: "jjxu_dr@stu.ecnu.edu.cn",
    cvUrl: "",
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
  articles: [
    {
      id: "music-to-image-project-log",
      featured: true,
      title: "从情绪意图到画面决策：音乐图像生成的工作记录",
      titleEn: "From affective intent to visual decisions: Notes on music-to-image generation",
      date: "2026.08",
      readTime: "7 min read",
      tags: ["Project Log", "Music-to-Image", "Affective Computing"],
      summary:
        "情感可控音乐图像生成不是把音乐标签换成图像标签；真正要解决的是，如何让节奏、音色与人类意图共同影响画面的构图、风格和情绪强度。",
      summaryEn:
        "Affective music-to-image generation is not a matter of replacing music labels with image labels. The real question is how rhythm, timbre, and human intention can jointly shape composition, style, and emotional intensity.",
      body: [
        "在“人机混合智能下情感可控的音乐图像生成研究”中，我关心的不是得到一张看起来与音乐有关的图，而是让生成过程能够回应人的主观意图。音乐中可被模型捕捉的节拍、频谱和语义线索，和人对画面情绪、张力、留白的判断，并不处在同一个层级。",
        "这让项目更像一次持续的协商：模型提供跨模态候选，人以反馈修正情绪方向，系统再把这些反馈转化为可控的视觉决策。工作中最重要的不是把控制变量堆得更多，而是找出哪些反馈真的改变了体验，哪些只是表面上的偏好。",
      ],
      bodyEn: [
        "In the project on affective music-to-image generation with human-AI hybrid intelligence, I am less interested in producing an image that merely looks related to music than in making generation respond to a person's subjective intent. Beat, spectral, and semantic cues that a model can capture do not sit at the same level as a person's judgment about mood, tension, and visual breathing room.",
        "The project therefore feels like an ongoing negotiation: the model proposes cross-modal candidates, a person redirects the affective trajectory through feedback, and the system turns that feedback into controllable visual decisions. The important task is not to add more control variables, but to find which kinds of feedback genuinely change the experience.",
      ],
    },
    {
      id: "digital-therapeutics-project-log",
      title: "数字疗法项目里，先把“支持”说清楚",
      titleEn: "In digital therapeutics, define what support means first",
      date: "2026.07",
      readTime: "5 min read",
      tags: ["Project Log", "Digital Therapeutics", "Human-AI Collaboration"],
      summary:
        "多模态数字药物的研究不应只追求生成质量。系统若要成为一种支持，需要从使用场景、情绪负荷和人的自主性重新定义有效性。",
      summaryEn:
        "Multimodal digital therapeutics should not optimize for generation quality alone. A system becomes supportive only when effectiveness is reconsidered through context, emotional load, and human autonomy.",
      body: [
        "在“人机混合下基于多模态的数字药物研究”中，技术问题常常比真正的问题更容易被写下来。我们可以衡量模型是否识别出情绪、是否生成了合适的内容，却很难仅凭这些指标回答：它是否在合适的时刻给到了恰当的支持。",
        "我的工作重点是把这类模糊的体验拆成可以观察、讨论和迭代的维度。人机混合的价值不在于把人变成模型的标注补丁，而在于让系统保留人的判断、犹豫与边界。",
      ],
      bodyEn: [
        "In the multimodal digital therapeutics project, technical questions are often easier to write down than the real question. We can measure whether a model recognizes emotion or generates appropriate content, but those metrics alone cannot answer whether it offered the right support at the right moment.",
        "My focus is to break this ambiguous experience into dimensions that can be observed, discussed, and iterated on. The value of human-AI hybrid work is not turning people into annotation patches for a model, but preserving human judgment, hesitation, and boundaries inside the system.",
      ],
    },
    {
      id: "educhat-r1-open-source-log",
      title: "参与 EduChat-R1：开源协作如何让研究落到真实场景",
      titleEn: "Working on EduChat-R1: How open collaboration reaches real settings",
      date: "2026.06",
      readTime: "4 min read",
      tags: ["Project Log", "Open Source", "Education AI"],
      summary:
        "参与 EduChat-R1 的过程让我重新理解开源研究：模型能力、工程协作和实际使用者的需求，必须在同一个反馈回路里被持续校准。",
      summaryEn:
        "EduChat-R1 clarified how open research works for me: model capability, engineering collaboration, and the needs of real users must be calibrated in the same feedback loop.",
      body: [
        "开源教育推理模型的工作并不只是在发布一个结果。它要求研究者把抽象的能力目标转化为能被他人复现、使用和反馈的系统边界，也要求我们承认真实教育场景中的问题并不总能被单一基准衡量。",
        "我从中获得的一个判断是：当研究走向开放协作，最重要的产出往往不止模型本身，还包括一套让不同角色能够继续对话、继续修正的工作方式。",
      ],
      bodyEn: [
        "Work on an open education reasoning model is not only about releasing a result. It asks researchers to turn abstract capability goals into system boundaries that others can reproduce, use, and critique, while acknowledging that real educational problems are not always captured by a single benchmark.",
        "One conclusion I take from the project is that open research produces more than a model. It also produces a way of working that lets different roles keep talking, testing, and correcting together.",
      ],
    },
    {
      id: "aesthetic-alignment",
      title: "对齐，不只是让模型听懂音乐",
      titleEn: "Alignment is more than making a model understand music",
      date: "2026.08",
      readTime: "6 min read",
      tags: ["Multimodal AI", "Music-to-Image"],
      summary:
        "音乐驱动图像生成的难题并不只是跨模态映射，而是如何把节奏、张力与情感质地转换成稳定、可感知的视觉决策。",
      summaryEn:
        "Music-driven image generation is not only a cross-modal mapping problem. It is also about turning rhythm, tension, and affective texture into stable visual decisions that people can perceive.",
      body: [
        "当我们说“音乐和图像对齐”时，通常想到的是语义上的对应：欢快的音乐对应明亮的画面，低沉的旋律对应冷色的构图。但真正值得研究的部分，往往发生在更细微的层级。节奏的推进、音色的颗粒感、情绪的转折，都会改变人如何看待一张图。",
        "我更愿意把对齐理解为一种可被审视的审美协商。模型需要保留声音带来的方向感，也要为图像自身的构图和风格留出空间。好的生成结果不是逐元素翻译，而是让两个模态在同一段体验里彼此成立。",
      ],
      bodyEn: [
        "When we say that music and images are aligned, we often mean a semantic correspondence: cheerful music maps to a bright image, while a low melody maps to a cool composition. The more interesting work happens at a finer level. Rhythmic movement, the grain of a timbre, and an emotional turn can all change how a person sees an image.",
        "I prefer to think of alignment as an aesthetic negotiation that can be examined. The model should preserve the direction carried by sound while leaving room for the image's own composition and style. A good result is not an element-by-element translation, but a moment in which both modalities make sense together.",
      ],
    },
    {
      id: "comfort-benchmark",
      title: "为什么“舒适感”值得成为生成模型的评价维度",
      titleEn: "Why comfort deserves a place in generative model evaluation",
      date: "2026.07",
      readTime: "5 min read",
      tags: ["Digital Therapeutics", "Affective Computing"],
      summary:
        "如果一张图被用于陪伴、舒缓或干预，只评价它是否真实或美观远远不够。我们还需要理解它是否给人留出了呼吸的空间。",
      summaryEn:
        "When an image is used for companionship, relief, or intervention, realism and beauty are not enough. We also need to ask whether it leaves a person room to breathe.",
      body: [
        "生成模型的评价经常围绕清晰度、语义一致性或人类偏好展开。但在数字疗法的语境里，这些指标并不能完整描述使用者的体验。一个技术上优秀的画面，仍可能因为情绪强度、视觉负荷或联想路径不合适而令人不安。",
        "把心理舒适感变成可研究的问题，并不意味着把人的感受压缩为单一分数。更有价值的做法是建立细粒度的观察维度，让不同的人、不同的情境和不同的使用目标都能被认真对待。",
      ],
      bodyEn: [
        "Generative model evaluation often centers on clarity, semantic consistency, or human preference. In a digital therapeutics context, those metrics do not fully describe the user's experience. A technically excellent image can still be unsettling because its emotional intensity, visual load, or associations are wrong for the moment.",
        "Making psychological comfort a research question does not mean compressing human experience into a single score. A more useful approach is to establish fine-grained dimensions of observation that take different people, contexts, and goals seriously.",
      ],
    },
    {
      id: "human-in-loop",
      title: "人类反馈不应只是训练数据的最后一列",
      titleEn: "Human feedback should not be the final column in a training set",
      date: "2026.06",
      readTime: "4 min read",
      tags: ["Human-AI Collaboration", "Affective Computing"],
      summary:
        "在人机协作系统中，人不只是给模型打分的标注者，也是在定义何为有效、何为合适、何为值得继续探索的人。",
      summaryEn:
        "In human-AI systems, people are not only annotators who score model outputs. They also define what is effective, appropriate, and worth exploring next.",
      body: [
        "把人放进学习回路，并不等于在训练末端增加一个偏好标签。人类反馈携带的是目标、语境、犹豫和价值判断，它决定了系统应该朝哪个方向试探，而不仅仅是哪个答案更高分。",
        "这也是我对人机混合智能感兴趣的原因：它把“谁拥有判断权”这个问题带回到系统设计中。真正有意义的协作，不是让人替模型补漏洞，而是让模型能够参与人的思考，同时不抹去人的主动性。",
      ],
      bodyEn: [
        "Putting people in the learning loop does not mean adding a preference label at the end of training. Human feedback carries goals, context, hesitation, and values. It tells a system which direction to explore, not only which answer scored higher.",
        "This is why human-AI hybrid intelligence interests me: it brings the question of who owns judgment back into system design. Meaningful collaboration is not asking people to patch a model's weaknesses, but allowing a model to participate in human thinking without erasing human agency.",
      ],
    },
    {
      id: "research-rhythm",
      title: "给研究留一点慢下来的节奏",
      titleEn: "Leave research room to slow down",
      date: "2026.05",
      readTime: "3 min read",
      tags: ["Research Notes"],
      summary:
        "在不断追逐指标和截止日期的研究里，慢下来不是降低效率，而是给真正的问题留下出现的机会。",
      summaryEn:
        "In research shaped by metrics and deadlines, slowing down is not a loss of efficiency. It gives the real questions room to appear.",
      body: [
        "有些研究问题并不是在实验第一次跑通时出现的，而是在你愿意回头看那些“不够好”的结果时才变得清楚。它们可能暴露了数据里的偏差，也可能提醒我们，原本设定的目标并不足够贴近人的体验。",
        "我希望保留这样的工作节奏：快速验证想法，但不快速放弃疑问。因为许多最有价值的线索，恰好藏在看似偏离预期的地方。",
      ],
      bodyEn: [
        "Some research questions do not appear when an experiment first works. They become clear when you are willing to revisit the results that were not good enough. Those results may expose a bias in the data or show that the original goal was not close enough to human experience.",
        "I want to keep this rhythm in my work: validate ideas quickly, but do not abandon questions quickly. Many of the most valuable clues are hidden in results that seem to miss the expected path.",
      ],
    },
  ],
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
    .map((publication) => {
      const href = safeUrl(publication.url);
      const rawStatus = locale === "zh" ? publication.statusZh || publication.status : publication.status;
      const status = localizeStatus(rawStatus);
      return `
        <li class="publication">
          <div>
            <h3 class="publication-title">${href ? `<a href="${escapeHTML(href)}"${linkAttributes(href)}>${escapeHTML(publication.title)} <span aria-hidden="true">↗</span></a>` : escapeHTML(publication.title)}</h3>
            <p class="publication-authors">${escapeHTML(publication.authors)}</p>
          </div>
          <p class="publication-meta">${escapeHTML(publication.venue)}${status ? ` <span class="record-status record-status--${statusClass(rawStatus)}">${escapeHTML(status)}</span>` : ""}${optionalLink(href, ui.readPaper)}</p>
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
        <li class="patent">
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
  const body = article.bodyHtml || article.body.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
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
  const links = [...document.querySelectorAll(".section-nav a")];
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
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
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
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

  const note = document.querySelector(".private-studio-note p");
  if (note) {
    note.textContent =
      locale === "zh"
        ? "新的工作记录正在本地整理，准备就绪后会发布在这里。"
        : "New work notes are prepared locally and will be shared here when ready.";
  }
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
setupSectionReveal();
setupPublicBuildAdjustments();
setupHeroAtmosphere();
setupBlogImport();
setupResearchEditor();
setupStudioPublishing();
