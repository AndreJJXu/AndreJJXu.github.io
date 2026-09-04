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

For stable, source-controlled edits, update the seed data at the top of `script.js`:

- `projects`: selected research projects
- `publications`: first-author papers with publication-stage labels
- `patents`: patent applications where Junjie Xu is listed as a co-inventor
- `articles`: work blog posts, research notes, and full article text
- `awards`: recognition and awards

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
