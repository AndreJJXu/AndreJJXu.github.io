import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run content:import -- <reviewed-package.json>");
  process.exit(1);
}

const sourcePath = resolve(inputPath);
const targetPath = resolve("content/published.json");
let payload;

try {
  payload = JSON.parse(await readFile(sourcePath, "utf8"));
} catch (error) {
  console.error(`Unable to read content package: ${error.message}`);
  process.exit(1);
}

const arrayFields = ["profiles", "projects", "publications", "patents", "awards", "articles", "researchNotes"];
if (!payload || typeof payload !== "object" || payload.version !== 1) {
  console.error("Content package must be an object with version 1.");
  process.exit(1);
}

for (const field of arrayFields) {
  if (!Array.isArray(payload[field])) {
    console.error(`Content package field '${field}' must be an array.`);
    process.exit(1);
  }
}

const output = {
  version: 1,
  publishedAt: new Date().toISOString(),
  profiles: payload.profiles,
  contact: payload.contact && typeof payload.contact === "object" ? payload.contact : { email: "", cvUrl: "" },
  projects: payload.projects,
  publications: payload.publications,
  patents: payload.patents,
  awards: payload.awards,
  articles: payload.articles,
  researchNotes: payload.researchNotes,
};

await writeFile(targetPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Published content written to ${targetPath}`);
