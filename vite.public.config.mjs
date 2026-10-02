import { resolve } from "node:path";
import { readFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

// Double-blind hold: slugs whose project pages are excluded from the public
// build while their papers are under review. Controlled by content/site.json
// (reviewHold) — remove a slug there to restore its pages; no code edits.
const site = JSON.parse(
  readFileSync(resolve(projectRoot, "content/site.json"), "utf8"),
);
const hold = new Set(Array.isArray(site.reviewHold) ? site.reviewHold : []);

// New research needs an explicit decision to publish.
const workSlugs = Array.isArray(site.publicWorks)
  ? site.publicWorks.filter((slug) => !hold.has(slug))
  : [];

const input = {
  main: resolve(projectRoot, "index.html"),
  zh: resolve(projectRoot, "zh/index.html"),
  works: resolve(projectRoot, "works/index.html"),
  works_zh: resolve(projectRoot, "works/zh/index.html"),
};

for (const slug of workSlugs) {
  if (hold.has(slug)) continue;
  const key = slug.replace(/-/g, "_");
  input[`work_${key}`] = resolve(projectRoot, `works/${slug}/index.html`);
  input[`work_${key}_zh`] = resolve(projectRoot, `works/zh/${slug}/index.html`);
}

export default defineConfig({
  appType: "mpa",
  plugins: [
    {
      name: "public-research-boundary",
      writeBundle(options) {
        const assets = resolve(options.dir || "dist", "assets/works");
        if (!existsSync(assets)) return;
        for (const entry of readdirSync(assets)) {
          if (!workSlugs.includes(entry))
            rmSync(resolve(assets, entry), { recursive: true, force: true });
        }
      },
    },
  ],
  define: {
    __PUBLIC_BUILD__: "true",
  },
  build: {
    rollupOptions: {
      input,
    },
  },
});
