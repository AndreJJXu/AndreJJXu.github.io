import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  define: {
    __PUBLIC_BUILD__: "true",
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        zh: resolve(projectRoot, "zh/index.html"),
        works: resolve(projectRoot, "works/index.html"),
        works_zh: resolve(projectRoot, "works/zh/index.html"),
        work_ebs: resolve(projectRoot, "works/evidence-before-severity/index.html"),
        work_ebs_zh: resolve(projectRoot, "works/zh/evidence-before-severity/index.html"),
        work_evidial: resolve(projectRoot, "works/evidial/index.html"),
        work_evidial_zh: resolve(projectRoot, "works/zh/evidial/index.html"),
        work_cef: resolve(projectRoot, "works/counterfactual-evidence-fidelity/index.html"),
        work_cef_zh: resolve(projectRoot, "works/zh/counterfactual-evidence-fidelity/index.html"),
        work_ani: resolve(projectRoot, "works/affective-non-interference/index.html"),
        work_ani_zh: resolve(projectRoot, "works/zh/affective-non-interference/index.html"),
      },
    },
  },
});
