# Junjie Xu — Research Portfolio

A bilingual, static academic portfolio. The public site highlights multimodal alignment, affective understanding, controllable generation, selected published work and prospective research directions.

## Local preview

```sh
npm install
npm run dev
```

English: http://localhost:4173/ · Chinese: http://localhost:4173/zh/

The local authoring studio is still available at `/studio/`. It is excluded from production builds. Private notes in the studio stay in the current browser.

For a production preview:

```sh
npm run build
PORT=4174 npm run preview
```

Both `build` and `build:public` use the same public-only pipeline. No production build includes the local studio.

## Edit the public site

- `content/published.json`: reviewed public publication records, profile/contact information, patent metadata, awards and bilingual writing. `featured: true` selects homepage publications.
- `scripts/build-portfolio.mjs`: the shared bilingual homepage, research index and navigation templates.
- `portfolio.css`: warm light and dark themes, typography, rounded cards and responsive layouts.
- `portfolio.js`: theme preference, publication filters and accessible expansion of anchored credentials.
- `content/site.json` → `publicWorks`: the explicit allowlist for detailed research pages and figures. A new slug is never automatically published. `reviewHold` overrides the allowlist.

`npm run gen:portfolio` regenerates the English/Chinese homepage and research index. Development and production commands run this automatically; edit the generator rather than the generated HTML.

The existing published detail pages are under `works/{slug}/` and `works/zh/{slug}/`. They use the shared portfolio stylesheet. Writing, CV, citations, feeds and the sitemap are generated after Vite builds.

## Private research boundary

`private-research/` contains local originals of unpublished project pages, figures, project-source JSON and the pre-redesign publication metadata. It is ignored by Git and never copied to `dist/`. Do not place private manuscripts, experimental results, figures or archives under `public/`.

Only records explicitly marked `Published` or `Accepted` may remain in `content/published.json`. Unknown stages are private by default. Homepage, research index, CV and BibTeX exports use the shared policy in `content/public-policy.mjs`.

Detailed pages and figures require the additional `publicWorks` allowlist. Before adding a paper, review its publication status, both locale pages, all associated assets and any links to other research. Adding a public preprint or restoring an unpublished page requires a deliberate change to this disclosure policy.

The public build strips unapproved research asset directories and checks the finished artifact for restricted URLs, unapproved figures, draft links and material downloads. Only generated EN/ZH CV PDFs are permitted as downloadable PDFs. The same checks run in GitHub Actions before deployment.

Moving materials out of the current source tree does not erase earlier public Git commits, external preprints, cached copies or prior downloads. No repository-history rewrite is performed.

## Validation and deployment

```sh
npm run check
npm run build:public
npm run check:site
node scripts/test-public-boundary.mjs
```

The checks validate content, EN/ZH structure, internal links and research privacy. The boundary test exercises rejected artifacts and the asset allowlist.

The existing `.github/workflows/deploy-pages.yml` deploys `dist/` to GitHub Pages when changes reach `main`. Building or previewing locally does not update the live website.

The token-authenticated editor at `/admin/` continues to support reviewed bilingual posts through GitHub. It stores authentication locally and commits content changes through GitHub's API. Review content before saving; a save to the deployment branch can trigger publication.
