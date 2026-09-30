# Junjie Xu - Research Portfolio

This is a static academic portfolio with a bilingual public site and a local-first content studio. The public pages are read-only; unfinished research notes and imported Markdown posts stay in the current browser until you explicitly export and publish a reviewed package.

## Start from the terminal

Install the small frontend dependency set once, then start the local site:

```bash
cd /Users/xjj/Documents/Self_CV
npm install
npm run dev
```

Then open [http://localhost:4173](http://localhost:4173) for the English public site. The other entry points are [中文主页](http://localhost:4173/zh/) and [local studio](http://localhost:4173/studio/).

`npm start` is an equivalent command. To use a different port:

```bash
PORT=8080 npm run dev
```

The original shell entry point is also kept available:

```bash
./start.sh 4173
```

For a production-style check, build and preview the bundled site:

```bash
npm run build
npm run preview
```

For a public deployment, use the public-only build so the local Studio is not included:

```bash
npm run build:public
```

## Publish reviewed content

1. Open `/studio/` and create or import content. Research notes and imported posts are stored in this browser only.
2. Review the result and click `Export reviewed package` to download a versioned JSON package.
3. Import that package into the project, then build the public site:

```bash
npm run content:import -- ./path/to/junjie-xu-content-YYYY-MM-DD.json
npm run build
```

The build reads `content/published.json`. The checked-in seed content remains available until a published package supplies a non-empty collection. Contact and CV values are intentionally blank until verified information is provided.

For stable, source-controlled edits, update `content/published.json` — it is the single content source the whole site reads:

- `profiles`: academic profile links (Scholar, GitHub, ORCID)
- `projects`: selected research projects (supports `url` to a project page)
- `publications`: papers with publication-stage labels and citation counts
- `patents`: patent applications where Junjie Xu is listed as a co-inventor
- `articles`: work blog posts (bilingual fields; rendered on the homepage and as permalink pages under `/writing/`)
- `awards`: recognition and awards (bilingual fields)
- `news`: the compact latest-updates strip on the homepages

The defaults inside `script.js` are only a no-JSON fallback; the JSON wins whenever a collection is non-empty.

## Build pipeline and site config

`npm run build:public` runs, in order:

1. `vite build --config vite.public.config.mjs` — the multipage build. Its work-page inputs are filtered by `content/site.json` → `reviewHold`: slugs listed there are excluded from the public build while their papers are under double-blind review (remove a slug to restore its pages).
2. `scripts/build-cv.mjs` — generates `/cv/` and `/cv/zh/` (self-contained HTML).
3. `scripts/build-writing.mjs` — generates `/writing/` permalink pages (one per article per locale) from `published.json`, and publishes two stable asset paths (`/styles.css`, `/assets/favicon.svg`) for post-build generators.
4. `scripts/generate-sitemap.mjs` — sitemap.xml from `dist/` (noindex paths excluded).
5. `scripts/generate-feed.mjs` — Atom feed at `/feed.xml`, one entry per article linking its permalink.
6. `scripts/generate-bib.mjs` — `/assets/junjie-xu-publications.bib` from the publication list.
7. `scripts/export-cv-pdf.mjs` — prints the CV pages to A4 PDFs (`/assets/cv/…`) with headless Chrome. PDFs are build outputs, never committed binaries.

Quality gates (also enforced in CI after every build):

- `npm run check` — validates `published.json` structure.
- `node scripts/check-parity.mjs` — fails when the EN/ZH mirrors drift (missing pages, scene/card count mismatches, tile sequence).
- `node scripts/check-links.mjs` — fails when any internal link in `dist/` does not resolve.

Adding a new work page: create `content/works/<slug>.json` (see `affective-dynamics.json` for the schema, both locales in one file), run `npm run gen:works`, add figures under `public/assets/works/<slug>/`, and list the slug in `vite.public.config.mjs`. The 13 legacy paper pages predate the generator and live as hand-authored HTML — the generator only writes pages that have a JSON file.

Weekly automation: `.github/workflows/update-citations.yml` refreshes `publications[].citations` from the Semantic Scholar Graph API (DOI map inside `scripts/update-citations.mjs`) and opens a PR — review the diffs before merging; Semantic Scholar counts can differ from Google Scholar.

Comments (giscus): Discussions are enabled with an `Announcements` category. To turn comments on, install the giscus app on this repo (https://github.com/apps/giscus), then set `giscus.enabled = true` in `content/site.json` — the writing pages pick it up on the next build.

## Edit local research notes

Open the `Research Now` section in `/studio/` to manage work that is still in progress. `New note` opens an in-browser Markdown editor with Write/Preview modes; you can update the title, stage, tags, summary, and body, then save or delete the note without touching project files.

Research notes are stored under a separate versioned LocalStorage key from imported Work Blog posts. They persist for this browser and origin (for example, `localhost:4173`); another browser, device, or port has its own content. If browser storage is unavailable, the page keeps edits for the current session and reports that limitation.

## Import Markdown work posts in the studio

Open the `Work Blog` section in `/studio/` and choose `Import Markdown`. You can select one or more `.md` or `.markdown` files. Imported posts are saved only in this browser, so the project files are never changed and the posts remain available after a refresh.

Use optional YAML front matter at the top of a file to control the card metadata:

```markdown
---
id: affective-feedback-loop
title: 把反馈变成研究方法
date: 2026-08-30
tags:
  - Research Notes
  - Human-AI Collaboration
summary: 一段会影响下一轮实验设计的工作记录。
featured: true
---

## 正文

把你的 Markdown 正文写在这里。
```

The same `id` updates an existing imported post instead of creating a duplicate. `Manage` opens the local post list so you can delete individual imports or clear them all. See `examples/work-blog-post.md` for a ready-to-copy example.

The public site intentionally renders Email and Download CV links only when verified values are present in the published content package. This prevents placeholder or private contact information from leaking into the public page.

## Add project demo sub-pages

The site is published as a GitHub Pages user site, so every folder pushed to the repo becomes a sub-page under `https://andrejjxu.github.io/` — no extra domain needed.

**Static demos (HTML/CSS/JS):** drop the files into `public/demos/<demo-name>/`. Vite copies the `public/` folder verbatim into every build, so `public/demos/elysianmv/index.html` is served at `/demos/elysianmv/` right after the next push. Reference assets with absolute paths (for example, `/demos/elysianmv/figure.png`).

**Bundled demos (React/Vite projects):** keep each demo in its own repository and enable GitHub Pages there as a project site. It is then served at `https://andrejjxu.github.io/<repo-name>/`; remember to set the Vite `base` option to `/<repo-name>/` in that repo so assets resolve.

Link new demos from the main page (for example, a project card `url` in `content/published.json`, or a dedicated Demos nav entry) once they are deployed.

## Online admin workbench (write and publish from anywhere)

The site ships with a token-authenticated admin page that turns GitHub into the backend: login, edit articles in `content/published.json`, save, and the deploy workflow publishes automatically (~1 minute).

1. Open `https://andrejjxu.github.io/admin/`.
2. Create a fine-grained personal access token at https://github.com/settings/personal-access-tokens/new — restrict it to this repository only, with **Contents: Read and write**.
3. Log in with your GitHub username and the token (it acts as the password). The token is kept only in this browser's storage and is sent only to `api.github.com`.

Features: create/edit/delete bilingual posts (Chinese/English title, summary, body), tags, featured flag, conflict detection (409) when the file changed elsewhere, Cmd/Ctrl+S to save. Every deploy runs `npm run check` first, so malformed content fails the build instead of breaking the live site.

**Rich content:** the admin editor accepts Markdown (headings, bold, links, lists, code, quotes). Images can be added three ways — the `图片` toolbar button, pasting a screenshot with `⌘V`, or dragging an image file into the body. Files are compressed client-side (large ones downscaled to 1600px JPEG), committed to `public/assets/posts/<article-id>/`, and referenced as `/assets/posts/...`, so they ship with the site itself. A preview pane renders the Markdown before saving.
