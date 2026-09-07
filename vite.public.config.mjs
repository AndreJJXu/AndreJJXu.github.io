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
        work_ebs: resolve(projectRoot, "works/evidence-before-severity/index.html"),
      },
    },
  },
});
