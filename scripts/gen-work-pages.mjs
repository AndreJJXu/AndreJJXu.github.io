import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Data-driven generator for work project pages. Reads content/works/{slug}.json
// (one file per work, both locales) and writes works/{slug}/index.html and
// works/zh/{slug}/index.html.
//
// Legacy note: the 13 paper pages built before this generator exist as frozen
// hand-authored HTML and have no JSON here — the generator only writes pages
// for the JSON files present, so they are never touched. New works get a JSON
// file; `npm run gen:works` regenerates their HTML.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = resolve(projectRoot, "content/works");

const BASE = "https://andrejjxu.github.io";

const esc = (value) =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const css = (lang) => `      .work-page { padding: 84px 0 40px; font-family: var(--hero-font-body); }
      .work-top { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 76px; }
      .work-hero-right { display: inline-flex; gap: 20px; align-items: center; }
      .work-top a { color: var(--wk-muted); font-size: 12.5px; font-weight: 600; }
      .work-top a:hover { color: var(--wk-blue); }
      .work-kicker { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 26px; color: var(--wk-muted); font-size: 11px; font-weight: 650; text-transform: uppercase; }
      .work-kicker .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--wk-green); }
      .work-title { margin: 0; color: var(--hero-ink); font-family: var(--hero-font-display); font-size: ${lang === "zh" ? "clamp(32px, 4.8vw, 52px)" : "clamp(34px, 5.4vw, 58px)"}; font-weight: 640; line-height: ${lang === "zh" ? "1.14" : "1.06"}; letter-spacing: ${lang === "zh" ? "-0.01em" : "-0.015em"};${lang === "zh" ? " text-wrap: balance;" : ""} }
      .work-title em { font-style: normal; color: var(--wk-blue); }
      .work-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
      .meta-chip { display: inline-flex; align-items: center; padding: 6px 13px; border: 1px solid var(--wk-line); border-radius: 999px; color: var(--wk-muted); font-size: 12.5px; font-weight: 570; }
      .meta-chip.is-accent { border-color: rgba(117, 183, 255, 0.4); background: rgba(117, 183, 255, 0.1); color: var(--wk-blue); }
      .work-authors { margin: 26px 0 0; color: var(--wk-muted); font-size: 14px; line-height: 1.7; }
      .work-authors strong { color: var(--hero-ink); font-weight: 600; }
      .work-tldr { max-width: 760px; margin: 48px 0 0; color: var(--wk-tldr); font-size: ${lang === "zh" ? "19px" : "19.5px"}; line-height: ${lang === "zh" ? "1.9" : "1.8"};${lang === "zh" ? "" : " letter-spacing: 0.002em;"} }
      .work-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 64px; }
      .work-stat { padding: 22px 22px 20px; border: 1px solid var(--wk-line); border-radius: 16px; background: var(--wk-card); }
      .work-stat b { display: block; color: var(--hero-ink); font-family: var(--hero-font-display); font-size: clamp(22px, 2.4vw, 30px); font-weight: 650; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
      .work-stat span { display: block; margin-top: 7px; color: var(--wk-muted); font-size: 12px; line-height: 1.45; }
      .work-section { margin-top: 88px; }
      .work-heading { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 28px; align-items: baseline; margin-bottom: 26px; }
      .work-heading .num { color: var(--wk-blue); font-family: var(--font-serif); font-size: 17px; }
      .work-heading h2 { margin: 0; color: var(--hero-ink); font-family: var(--hero-font-display); font-size: clamp(25px, 3vw, 33px); font-weight: 630; letter-spacing: -0.01em; line-height: 1.15; }
      .work-prose { max-width: 820px; color: var(--wk-body); font-size: 15px; line-height: ${lang === "zh" ? "2" : "1.95"}; }
      .work-prose p { margin: 0 0 14px; }
      .work-prose strong { color: var(--hero-ink); font-weight: 620; }
      .work-figure { margin: 30px 0 0; padding: 22px; border: 1px solid var(--wk-line); border-radius: 18px; background: linear-gradient(180deg, var(--wk-fig-a), var(--wk-fig-b)); }
      .work-figure img { display: block; width: 100%; height: auto; border-radius: 8px; background: #fff; }
      .work-figcaption { display: flex; gap: 14px; margin-top: 18px; color: var(--wk-muted); font-size: 12.5px; line-height: 1.6; }
      .work-figcaption b { flex: 0 0 auto; color: var(--wk-blue); font-family: var(--font-serif); font-weight: 500; }
      .boundary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 30px; }
      .boundary-card { padding: 24px 26px; border-radius: 18px; font-size: 13.5px; line-height: ${lang === "zh" ? "1.85" : "1.8"}; }
      .boundary-card h3 { margin: 0 0 12px; font-family: var(--hero-font-display); font-size: 16px; font-weight: 640; }
      .boundary-card ul { margin: 0; padding-left: 18px; }
      .boundary-card li { margin: 6px 0; }
      .boundary-card.is-yes { border: 1px solid rgba(105, 221, 181, 0.3); background: rgba(105, 221, 181, 0.05); color: var(--wk-yes-ink); }
      .boundary-card.is-yes h3 { color: var(--wk-green); }
      .boundary-card.is-no { border: 1px solid rgba(255, 139, 114, 0.28); background: rgba(255, 139, 114, 0.045); color: var(--wk-no-ink); }
      .boundary-card.is-no h3 { color: var(--wk-red); }
      .work-cite { position: relative; margin-top: 30px; padding: 24px 26px; border: 1px solid var(--wk-line); border-radius: 18px; background: var(--wk-cite-bg); }
      .work-cite pre { margin: 0; overflow-x: auto; color: var(--wk-cite-code); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.7; }
      .copy-btn { position: absolute; top: 16px; right: 16px; padding: 7px 14px; border: 1px solid var(--wk-line); border-radius: 999px; background: transparent; color: var(--wk-muted); font-size: 11.5px; font-weight: 620; cursor: pointer; transition: color 160ms ease, border-color 160ms ease; }
      .copy-btn:hover { color: var(--wk-blue); border-color: rgba(117, 183, 255, 0.5); }
      .work-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
      .work-links a { display: inline-flex; padding: 8px 15px; border: 1px solid var(--wk-line); border-radius: 999px; color: var(--wk-blue); font-size: 12.5px; font-weight: 620; text-decoration: none; transition: border-color 160ms ease, background 160ms ease; }
      .work-links a:hover { border-color: rgba(117, 183, 255, 0.5); background: rgba(117, 183, 255, 0.08); }
      .work-footer { display: flex; justify-content: space-between; gap: 16px; margin-top: 90px; padding-top: 24px; border-top: 1px solid var(--wk-line); color: var(--wk-muted); font-size: 12.5px; }
      .work-footer a { color: var(--wk-blue); }
      .reveal { opacity: 0; transform: translateY(20px); transition: opacity 620ms ease, transform 620ms cubic-bezier(0.22, 1, 0.36, 1); }
      .reveal.is-in { opacity: 1; transform: none; }
      @media (max-width: 860px) {
        .work-stats, .boundary-grid { grid-template-columns: minmax(0, 1fr); }
        .work-heading { grid-template-columns: minmax(0, 1fr); gap: 8px; }
        .work-figure { padding: 12px; }
      }
      @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
`;

const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

const script = (lang, hasCite) => `      ${hasCite ? "/* stat-count-up */\n      " : ""}document.documentElement.classList.add("js");
      setTimeout(function () { document.documentElement.classList.add("entrance-done"); }, 1500);

      const reveals = [...document.querySelectorAll(".reveal")];
      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion || !("IntersectionObserver" in window)) {
        reveals.forEach((el) => el.classList.add("is-in"));
      } else {
        let revealTimer = 0;
        const checkReveals = () => {
          if (revealTimer) { clearTimeout(revealTimer); revealTimer = 0; }
          const threshold = window.innerHeight * 0.92;
          for (const el of reveals) {
            if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < threshold) el.classList.add("is-in");
          }
        };
        const scheduleReveals = () => { if (!revealTimer) revealTimer = setTimeout(checkReveals, 60); };
        window.addEventListener("scroll", scheduleReveals, { passive: true });
        window.addEventListener("resize", scheduleReveals);
        window.addEventListener("load", scheduleReveals);
        setTimeout(scheduleReveals, 300);
        checkReveals();
      }${hasCite ? `
      document.querySelector("[data-copy-cite]").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        try {
          await navigator.clipboard.writeText(document.getElementById("cite-text").textContent.trim());
          button.textContent = ${lang === "zh" ? '"已复制 ✓"' : '"Copied ✓"'};
        } catch {
          button.textContent = ${lang === "zh" ? '"请按 ⌘C"' : '"Press ⌘C"'};
        }
        setTimeout(() => (button.textContent = ${lang === "zh" ? '"复制"' : '"Copy"'}), 1800);
      });
      /* stat-count-up */` : ";"}
      /* stat-count-up */
      function setupStatCountUp() {
        const stats = document.querySelector(".work-stats");
        if (!stats || stats.dataset.statCountUp) return;
        stats.dataset.statCountUp = "1";
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const items = [...stats.querySelectorAll("b")].flatMap((b) => {
          const m = /^(\\D*)([0-9][0-9,]*(?:\\.[0-9]+)?)(\\D*)$/.exec((b.textContent || "").trim());
          if (!m) return [];
          const dec = m[2].includes(".") ? m[2].length - m[2].indexOf(".") - 1 : 0;
          const grouped = m[2].includes(",");
          const fmt = (v) => m[1] + (grouped
            ? v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })
            : v.toFixed(dec)) + m[3];
          return [{ el: b, target: parseFloat(m[2].replace(/,/g, "")), fmt }];
        });
        if (!items.length) return;
        let start = 0;
        let finished = false;
        const step = (ts) => {
          if (finished) return;
          if (!start) start = ts;
          const p = Math.min((ts - start) / 900, 1);
          const e = 1 - Math.pow(1 - p, 3);
          items.forEach((it) => { it.el.textContent = it.fmt(it.target * e); });
          if (p < 1) requestAnimationFrame(step);
        };
        const run = () => {
          requestAnimationFrame(step);
          setTimeout(() => {
            finished = true;
            items.forEach((it) => { it.el.textContent = it.fmt(it.target); });
          }, 1000);
        };
        if (stats.classList.contains("is-in")) run();
        else {
          const obs = new MutationObserver(() => {
            if (stats.classList.contains("is-in")) { obs.disconnect(); run(); }
          });
          obs.observe(stats, { attributes: true, attributeFilter: ["class"] });
        }
      }
      setupStatCountUp();
`;

function renderPage(data, lang) {
  const L = data[lang];
  const zh = lang === "zh";
  const hasCite = Boolean(L.cite);
  const t = {
    skip: zh ? "跳转到正文" : "Skip to content",
    railLabel: zh ? "站点导航" : "Site navigation",
    backHome: zh ? "返回首页" : "Back to home",
    sections: zh ? "页面分区" : "Sections",
    about: zh ? "关于" : "About",
    work: zh ? "研究" : "Work",
    works: zh ? "作品页" : "Works",
    pubs: zh ? "论文" : "Publications",
    patents: zh ? "专利" : "Patents",
    writing: zh ? "工作记录" : "Blog",
    honors: zh ? "荣誉" : "Honors",
    tools: zh ? "页面工具" : "Page tools",
    themeAria: zh ? "切换亮色模式" : "Switch to light mode",
    cv: zh ? "简历" : "CV",
    langSwitch: zh ? "English" : "中文",
    allWorks: zh ? "← 全部作品" : "← All works",
    localeAttr: zh ? "zh-CN" : "en",
    langSwitchTarget: zh ? "en" : "zh-CN",
    citeHeading: zh ? "引用" : "Citation",
    copyBtn: zh ? "复制" : "Copy",
  };
  const enSlugPath = zh ? `/works/${data.slug}/` : `/works/${data.slug}/`;
  const switchHref = zh ? `/works/${data.slug}/` : `/works/zh/${data.slug}/`;
  const canonical = zh ? `${BASE}/works/zh/${data.slug}/` : `${BASE}/works/${data.slug}/`;

  const chips = L.chips
    .map((chip) => (typeof chip === "string" ? { text: chip, accent: false } : chip))
    .map((chip) => `              <span class="meta-chip${chip.accent ? " is-accent" : ""}">${chip.text}</span>`)
    .join("\n");

  const stats = L.stats
    .map((s) => `            <div class="work-stat"><b>${s.value}</b><span>${s.label}</span></div>`)
    .join("\n");

  const sections = L.sections
    .map((section) => {
      const prose = section.paragraphs.join("");
      const figure = section.figure
        ? `
            <figure class="work-figure" aria-labelledby="${section.figure.id}">
              <picture><source type="image/webp" srcset="/assets/works/${data.slug}/${section.figure.file}.webp"><img src="/assets/works/${data.slug}/${section.figure.file}.jpg" alt="${esc(section.figure.alt)}" loading="lazy" /></picture>
              <figcaption class="work-figcaption" id="${section.figure.id}"><b>${section.figure.label}</b><span>${section.figure.caption}</span></figcaption>
            </figure>`
        : "";
      return `
          <section class="work-section reveal" id="${section.id}">
            <div class="work-heading">
              <span class="num">${section.num}</span>
              <h2>${section.heading}</h2>
            </div>
            <div class="work-prose">${prose}</div>${figure}
          </section>`;
    })
    .join("\n");

  const boundary = `
          <section class="work-section reveal" id="boundary">
            <div class="work-heading">
              <span class="num">04</span>
              <h2>${L.boundaryHeading}</h2>
            </div>
            <div class="boundary-grid">
              <div class="boundary-card is-yes">
                <h3>✓ ${L.boundary.yesTitle}</h3>
                <ul>${L.boundary.yes.map((item) => `<li>${item}</li>`).join("")}</ul>
              </div>
              <div class="boundary-card is-no">
                <h3>✗ ${L.boundary.noTitle}</h3>
                <ul>${L.boundary.no.map((item) => `<li>${item}</li>`).join("")}</ul>
              </div>
            </div>
          </section>`;

  const tail = L.cite
    ? `
          <section class="work-section reveal" id="cite">
            <div class="work-heading">
              <span class="num">05</span>
              <h2>${t.citeHeading}</h2>
            </div>
            <div class="work-cite">
              <button class="copy-btn" type="button" data-copy-cite>${t.copyBtn}</button>
              <pre id="cite-text">${L.cite}</pre>
            </div>
          </section>`
    : L.links
      ? `
          <section class="work-section reveal" id="related">
            <div class="work-heading">
              <span class="num">05</span>
              <h2>${L.linksHeading}</h2>
            </div>
            <div class="work-prose"><p>${L.linksIntro}</p></div>
            <div class="work-links">
              ${L.links.map((l) => `<a href="${l.href}">${l.label} ↗</a>`).join("\n              ")}
            </div>
          </section>`
      : "";

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#07111f" />
    <meta name="description" content="${esc(L.description)}" />
    <meta property="og:title" content="${esc(L.ogTitle)}" />
    <meta property="og:description" content="${esc(L.description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:image" content="${BASE}/assets/works/${data.slug}/${L.ogImage}" />
    <title>${esc(L.ogTitle)}</title>
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
    <script>${themeInit}</script>
    <link rel="stylesheet" href="/styles.css" />
    <style>
${css(lang)}</style>
  </head>
  <body class="hero-rail-active" data-page="public" data-locale="${zh ? "zh" : "en"}">
    <a class="skip-link" href="#main">${t.skip}</a>
    <div class="page-shell">
      <aside class="site-rail" aria-label="${t.railLabel}">
        <a class="monogram" href="${zh ? "/zh/" : "/"}#about" aria-label="${t.backHome}">JX</a>
        <nav class="section-nav" aria-label="${t.sections}">
          <a href="${zh ? "/zh/" : "/"}#about">${t.about}</a>
          <a href="${zh ? "/zh/" : "/"}#work">${t.work}</a>
          <a href="${zh ? "/works/zh/" : "/works/"}" class="is-active" aria-current="page">${t.works}</a>
          <a href="${zh ? "/zh/" : "/"}#publications">${t.pubs}</a>
          <a href="${zh ? "/zh/" : "/"}#patents">${t.patents}</a>
          <a href="${zh ? "/zh/" : "/"}#writing">${t.writing}</a>
          <a href="${zh ? "/zh/" : "/"}#honors">${t.honors}</a>
        </nav>
        <div class="rail-meta"><p>ECNU · ${zh ? "上海" : "Shanghai"}</p><p>2019 — 2028</p></div>
        <div class="rail-tools" aria-label="${t.tools}">
          <button class="theme-toggle" type="button" data-theme-toggle aria-label="${t.themeAria}" aria-pressed="false">☀</button>
          <a href="${switchHref}" lang="${t.langSwitchTarget}">${t.langSwitch}</a>
          <a href="${zh ? "/cv/zh/" : "/cv/"}">${t.cv}</a>
        </div>
      </aside>

      <main id="main">
        <article class="work-page">
          <header>
            <div class="work-top">
              <a href="${zh ? "/works/zh/" : "/works/"}">${t.allWorks}</a>
              <span class="work-hero-right"><a href="${switchHref}" lang="${t.langSwitchTarget}">${t.langSwitch}</a></span>
            </div>
            <p class="work-kicker"><span class="dot"></span> ${L.kicker}</p>
            <h1 class="work-title">${L.titleHtml}</h1>
            <p style="max-width: 700px; margin: 18px 0 0; color: var(--wk-muted); font-size: 16.5px; line-height: 1.6;">
              ${L.subtitle}
            </p>
            <div class="work-meta">
${chips}
            </div>
            <p class="work-authors">${L.authors}</p>
            <p class="work-tldr">
              ${L.tldr}
            </p>
          </header>

          <div class="work-stats reveal">
${stats}
          </div>


${sections}
${boundary}
          ${tail.trim()}
          <footer class="work-footer">
            <span>${L.footerTag} — <a href="${zh ? "/works/zh/" : "/works/"}">${zh ? "全部作品" : "all works"}</a></span>
            <span><a href="${zh ? "/zh/" : "/"}">junjiexu.github.io</a> · ${zh ? "更新于" : "updated"} ${data.updated}</span>
          </footer>
        </article>
      </main>
    </div>

    <script defer src="/assets/vendor/lenis.min.js"></script>
    <script defer src="/assets/scroll-feel.js"></script>
    <script defer src="/assets/theme-toggle.js"></script>
    <script>
${script(lang, hasCite)}</script>
  </body>
</html>
`;
}

const files = existsSync(dataDir) ? readdirSync(dataDir).filter((f) => f.endsWith(".json")) : [];
for (const file of files) {
  const data = JSON.parse(readFileSync(resolve(dataDir, file), "utf8"));
  for (const lang of ["en", "zh"]) {
    const dir = resolve(projectRoot, `works${lang === "zh" ? "/zh" : ""}/${data.slug}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "index.html"), renderPage(data, lang), "utf8");
    console.log(`generated works${lang === "zh" ? "/zh" : ""}/${data.slug}/index.html`);
  }
}
if (!files.length) console.log("no data files in content/works/ — nothing generated");
