import { readFile, writeFile, mkdir } from "node:fs/promises";
import { readdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { header, footer } from "./build-portfolio.mjs";

// Post-build step: emit permalink pages for the work blog. Reads the articles
// in content/published.json (bilingual: title/titleEn, bodyMarkdown variants)
// and writes into dist/writing/ — an index plus one page per article per
// locale, following the build-cv pattern (generated after the vite build).
// The homepage writing section links here (see script.js articleHref).
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteBase = "https://andrejjxu.github.io";
const distRoot = resolve(projectRoot, "dist");

const published = JSON.parse(await readFile(resolve(projectRoot, "content/published.json"), "utf8"));
const articles = Array.isArray(published.articles) ? published.articles : [];

// Generated pages are written straight into dist/ after the vite build, so
// they cannot reference vite's hashed asset names. Publish two stable paths —
// /styles.css (a copy of the built stylesheet, with its rewritten font URLs)
// and /assets/favicon.svg — for post-build generators to link against.
const distAssets = resolve(distRoot, "assets");
await mkdir(distAssets, { recursive: true });
const builtCss = readdirSync(distAssets).find((f) => /^styles-[^/]*\.css$/.test(f));
if (builtCss) copyFileSync(resolve(distAssets, builtCss), resolve(distRoot, "styles.css"));
const portfolioCss = readdirSync(distAssets).find(f => /^portfolio-[^/]*\.css$/.test(f));
if (portfolioCss) copyFileSync(resolve(distAssets, portfolioCss), resolve(distRoot, "portfolio.css"));
const portfolioJs = readdirSync(distAssets).find(f => /^portfolio-[^/]*\.js$/.test(f));
if (portfolioJs) await writeFile(resolve(distRoot, "portfolio.js"), `import "/assets/${portfolioJs}";\n`);
copyFileSync(resolve(projectRoot, "assets/favicon.svg"), resolve(distAssets, "favicon.svg"));
copyFileSync(resolve(projectRoot, "assets/junjie-xu-portrait-web.jpg"), resolve(distAssets, "junjie-xu-portrait-web.jpg"));

// giscus comments: disabled until the giscus GitHub App is installed on the
// repo (https://github.com/apps/giscus) and a discussion category exists.
// Flip giscus.enabled in content/site.json after that one-time setup.
const site = JSON.parse(await readFile(resolve(projectRoot, "content/site.json"), "utf8"));
const giscus = site.giscus || { enabled: false };

const esc = (value) =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const themeInit = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem("theme")==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

const pick = (article, lang) =>
  lang === "zh"
    ? { title: article.title, summary: article.summary, markdown: article.bodyMarkdown ?? arrayBody(article.body) }
    : {
        title: article.titleEn || article.title,
        summary: article.summaryEn || article.summary,
        markdown: article.bodyMarkdownEn ?? article.bodyMarkdown ?? arrayBody(article.bodyEn || article.body),
      };

const arrayBody = (body) => (Array.isArray(body) ? body.map((p) => `${p}\n`).join("\n") : "");

const css = `      .writing-page { padding: 84px 0 40px; font-family: var(--hero-font-body); }
      .writing-top { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 76px; }
      .writing-top a { color: var(--wk-muted); font-size: 12.5px; font-weight: 600; }
      .writing-top a:hover { color: var(--wk-blue); }
      .writing-kicker { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 26px; color: var(--wk-muted); font-size: 11px; font-weight: 650; text-transform: uppercase; }
      .writing-kicker .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--wk-green); }
      .writing-title { margin: 0; color: var(--hero-ink); font-family: var(--hero-font-display); font-size: clamp(32px, 4.8vw, 54px); font-weight: 640; line-height: 1.12; letter-spacing: -0.012em; text-wrap: balance; }
      .writing-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
      .meta-chip { display: inline-flex; align-items: center; padding: 6px 13px; border: 1px solid var(--wk-line); border-radius: 999px; color: var(--wk-muted); font-size: 12.5px; font-weight: 570; }
      .writing-prose { max-width: 760px; margin-top: 56px; color: var(--wk-body); font-size: 16px; line-height: 1.95; }
      .writing-prose p { margin: 0 0 16px; }
      .writing-prose h2, .writing-prose h3 { color: var(--hero-ink); font-family: var(--hero-font-display); letter-spacing: -0.01em; }
      .writing-prose h2 { margin: 38px 0 14px; font-size: 24px; font-weight: 640; }
      .writing-prose h3 { margin: 30px 0 12px; font-size: 19px; font-weight: 630; }
      .writing-prose strong { color: var(--hero-ink); font-weight: 620; }
      .writing-prose a { color: var(--wk-blue); text-underline-offset: 4px; }
      .writing-prose blockquote { margin: 18px 0; padding-left: 18px; border-left: 2px solid var(--wk-line); color: var(--wk-muted); }
      .writing-prose code { padding: 2px 6px; border-radius: 6px; background: var(--wk-card); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13.5px; }
      .writing-prose pre { margin: 18px 0; padding: 16px 18px; border: 1px solid var(--wk-line); border-radius: 12px; background: var(--wk-card); overflow-x: auto; }
      .writing-prose pre code { padding: 0; background: transparent; }
      .writing-prose img { max-width: 100%; border-radius: 10px; }
      .writing-list { margin-top: 48px; }
      .writing-item { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 26px; padding: 26px 0; border-top: 1px solid var(--wk-line); }
      .writing-item-date { color: var(--wk-muted); font-size: 12.5px; font-variant-numeric: tabular-nums; }
      .writing-item h2 { margin: 0; font-family: var(--hero-font-display); font-size: 22px; font-weight: 640; letter-spacing: -0.01em; }
      .writing-item h2 a { color: var(--hero-ink); text-decoration: none; }
      .writing-item h2 a:hover { color: var(--wk-blue); }
      .writing-item p { margin: 8px 0 0; color: var(--wk-muted); font-size: 14px; line-height: 1.7; }
      .writing-item .meta-chip { margin-top: 12px; }
      .writing-footer { display: flex; justify-content: space-between; gap: 16px; margin-top: 90px; padding-top: 24px; border-top: 1px solid var(--wk-line); color: var(--wk-muted); font-size: 12.5px; }
      .writing-footer a { color: var(--wk-blue); }
      .giscus-holder { max-width: 760px; margin-top: 72px; }
      @media (max-width: 760px) { .writing-item { grid-template-columns: minmax(0, 1fr); gap: 8px; } }
`;

function shell({ lang, title, description, canonical, active, body, jsonLd }) {
  const zh = lang === "zh";
  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#07111f" />
    <meta name="description" content="${esc(description)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${siteBase}/assets/junjie-xu-portrait-web.jpg" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${siteBase}/assets/junjie-xu-portrait-web.jpg" />
    <title>${esc(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
    <script>${themeInit}</script>
    <link rel="stylesheet" href="/styles.css" /><link rel="stylesheet" href="/portfolio.css" />
${jsonLd ? `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` : ""}    <style>
${css}</style>
  </head>
  <body class="portfolio-page" data-view="research-detail" data-page="public" data-locale="${zh ? "zh" : "en"}">
    <a class="skip-link" href="#main">${zh ? "跳转到正文" : "Skip to content"}</a>
    <div class="page-shell">
${header(zh, zh ? "/writing/" : "/writing/zh/", active)}

      <main id="main">
${body}
      </main>
    </div>

    ${footer(zh)}
    <script type="module" src="/portfolio.js"></script>
  </body>
</html>
`;
}

const giscusBlockFor = (lang, term) =>
  giscus.enabled
    ? `        <div class="giscus-holder">
          <script src="https://giscus.app/client.js"
            data-repo="${giscus.repo}"
            data-repo-id="${giscus.repoId}"
            data-category="${giscus.category}"
            data-category-id="${giscus.categoryId}"
            data-mapping="specific"
            data-term="${term}"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="preferred_color_scheme"
            data-lang="${lang === "zh" ? "zh-CN" : "en"}"
            crossorigin="anonymous"
            async></script>
        </div>`
    : "";

let pageCount = 0;
const byDate = [...articles].sort((a, b) => String(b.date).localeCompare(String(a.date)));

for (const lang of ["en", "zh"]) {
  const zh = lang === "zh";
  const prefix = zh ? "writing/zh" : "writing";
  const outDir = resolve(distRoot, prefix);
  await mkdir(outDir, { recursive: true });

  // Index page
  const items = byDate
    .map((article) => {
      const L = pick(article, lang);
      const href = `/${prefix}/${article.id}/`;
      const tags = (article.tags || []).map((t) => `<span class="meta-chip">${esc(t)}</span>`).join(" ");
      return `        <article class="writing-item">
          <p class="writing-item-date">${esc(article.date)}<br />${esc(article.readTime || "")}</p>
          <div>
            <h2><a href="${href}">${esc(L.title)}</a></h2>
            <p>${esc(L.summary)}</p>
            <div class="writing-meta">${tags}</div>
          </div>
        </article>`;
    })
    .join("\n");
  const indexBody = `        <div class="writing-page">
          <div class="writing-top">
            <a href="${zh ? "/zh/#writing" : "/#writing"}">← ${zh ? "返回主页" : "Back to home"}</a>
            <a href="${zh ? "/writing/" : "/writing/zh/"}" lang="${zh ? "en" : "zh-CN"}">${zh ? "English" : "中文"}</a>
          </div>
          <p class="writing-kicker"><span class="dot"></span> ${zh ? "工作记录" : "Work blog"} · ${articles.length} ${zh ? "篇" : "posts"}</p>
          <h1 class="writing-title">${zh ? "记录工作，持续思考。" : "Work notes, kept in motion."}</h1>
          <div class="writing-list">
${items}
          </div>
          <footer class="writing-footer">
            <span>${zh ? "工作记录 — " : "Work blog — "}<a href="${zh ? "/zh/" : "/"}">junjiexu.github.io</a></span>
            <span>${zh ? "订阅" : "Subscribe"} <a href="${zh ? "/zh/feed.xml" : "/feed.xml"}">RSS ↗</a></span>
          </footer>
        </div>`;
  await writeFile(
    resolve(outDir, "index.html"),
    shell({
      lang,
      title: zh ? "工作记录 | 许俊杰" : "Work Blog | Junjie Xu",
      description: zh
        ? "关于项目推进、研究实践与人机协作的工作记录。"
        : "Notes on project progress, research practice, and human-AI collaboration.",
      canonical: `${siteBase}/${prefix}/`,
      active: "writing",
      body: indexBody,
    }),
    "utf8",
  );
  pageCount++;

  // Article pages
  for (const article of byDate) {
    const L = pick(article, lang);
    const bodyHtml = marked.parse(String(L.markdown || ""), { mangle: false, headerIds: false });
    const tags = (article.tags || []).map((t) => `<span class="meta-chip">${esc(t)}</span>`).join(" ");
    const articleBody = `        <article class="writing-page">
          <div class="writing-top">
            <a href="${zh ? "/writing/zh/" : "/writing/"}">← ${zh ? "全部记录" : "All posts"}</a>
            <a href="${zh ? `/writing/${article.id}/` : `/writing/zh/${article.id}/`}" lang="${zh ? "en" : "zh-CN"}">${zh ? "English" : "中文"}</a>
          </div>
          <p class="writing-kicker"><span class="dot"></span> ${esc(article.date)} · ${esc(article.readTime || "")}</p>
          <h1 class="writing-title">${esc(L.title)}</h1>
          <div class="writing-meta">${tags}</div>
          <div class="writing-prose">
          ${bodyHtml}
          </div>
${giscusBlockFor(lang, article.id)}
          <footer class="writing-footer">
            <span><a href="${zh ? "/writing/zh/" : "/writing/"}">${zh ? "全部记录" : "All posts"}</a> · <a href="${zh ? "/zh/" : "/"}">junjiexu.github.io</a></span>
            <span>${zh ? "订阅" : "Subscribe"} <a href="${zh ? "/zh/feed.xml" : "/feed.xml"}">RSS ↗</a></span>
          </footer>
        </article>`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: L.title,
      description: L.summary,
      datePublished: `${String(article.date || "").replace(".", "-")}-01`,
      inLanguage: zh ? "zh-CN" : "en",
      author: { "@type": "Person", name: zh ? "许俊杰" : "Junjie Xu", url: siteBase },
      mainEntityOfPage: `${siteBase}/${prefix}/${article.id}/`,
    };
    await mkdir(resolve(outDir, article.id), { recursive: true });
    await writeFile(
      resolve(outDir, `${article.id}/index.html`),
      shell({
        lang,
        title: `${L.title} | ${zh ? "许俊杰" : "Junjie Xu"}`,
        description: L.summary || (zh ? "工作记录。" : "A work note."),
        canonical: `${siteBase}/${prefix}/${article.id}/`,
        active: "writing",
        body: articleBody,
        jsonLd,
      }),
      "utf8",
    );
    pageCount++;
  }
}

console.log(`writing pages generated: ${pageCount} pages under dist/writing/ (giscus ${giscus.enabled ? "on" : "off"})`);
