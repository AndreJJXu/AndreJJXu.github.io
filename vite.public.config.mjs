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
        work_bts: resolve(projectRoot, "works/before-the-score/index.html"),
        work_bts_zh: resolve(projectRoot, "works/zh/before-the-score/index.html"),
        work_mars: resolve(projectRoot, "works/mars/index.html"),
        work_mars_zh: resolve(projectRoot, "works/zh/mars/index.html"),
        work_bdann: resolve(projectRoot, "works/bdann/index.html"),
        work_bdann_zh: resolve(projectRoot, "works/zh/bdann/index.html"),
        work_aim: resolve(projectRoot, "works/aim/index.html"),
        work_aim_zh: resolve(projectRoot, "works/zh/aim/index.html"),
        work_amn: resolve(projectRoot, "works/amn/index.html"),
        work_amn_zh: resolve(projectRoot, "works/zh/amn/index.html"),
        work_gc: resolve(projectRoot, "works/gc/index.html"),
        work_gc_zh: resolve(projectRoot, "works/zh/gc/index.html"),
        work_cwf: resolve(projectRoot, "works/cwf/index.html"),
        work_cwf_zh: resolve(projectRoot, "works/zh/cwf/index.html"),
        work_coa: resolve(projectRoot, "works/coa/index.html"),
        work_coa_zh: resolve(projectRoot, "works/zh/coa/index.html"),
        work_elysianmv: resolve(projectRoot, "works/elysianmv/index.html"),
        work_elysianmv_zh: resolve(projectRoot, "works/zh/elysianmv/index.html"),
        work_phoenix: resolve(projectRoot, "works/phoenix/index.html"),
        work_phoenix_zh: resolve(projectRoot, "works/zh/phoenix/index.html"),
        work_coffee: resolve(projectRoot, "works/coffee/index.html"),
        work_coffee_zh: resolve(projectRoot, "works/zh/coffee/index.html"),
        work_musepainter: resolve(projectRoot, "works/musepainter/index.html"),
        work_musepainter_zh: resolve(projectRoot, "works/zh/musepainter/index.html"),
        work_garbo: resolve(projectRoot, "works/garbo/index.html"),
        work_garbo_zh: resolve(projectRoot, "works/zh/garbo/index.html"),
        work_healbench: resolve(projectRoot, "works/healbench/index.html"),
        work_healbench_zh: resolve(projectRoot, "works/zh/healbench/index.html"),
      },
    },
  },
});
