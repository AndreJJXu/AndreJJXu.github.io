import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Refresh citation counts from the Semantic Scholar Graph API. Papers are
// matched by DOI; the map below mirrors the DOIs shown on the works gallery
// cards. Run by .github/workflows/update-citations.yml (weekly, opens a PR).
// When a paper gains a DOI, add it here.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentPath = resolve(projectRoot, "content/published.json");

const DOI_BY_TITLE_PREFIX = {
  "MARS: Multimodal-Assisted Refined Semantic Alignment": "10.1016/j.ipm.2025.104292",
  "Bidirectional Directed Acyclic Graph Neural Network": "10.1145/3716501",
  "Graph Convolution over the Semantic-Syntactic Hybrid Graph":
    "10.1109/IJCNN55064.2022.9892027",
  "Attention Mixture Network for Crowd Counting": "10.1145/3688867.3690172",
};

const data = JSON.parse(readFileSync(contentPath, "utf8"));
const changes = [];

for (const pub of data.publications) {
  const doi = Object.entries(DOI_BY_TITLE_PREFIX).find(([prefix]) =>
    String(pub.title || "").toLowerCase().startsWith(prefix.toLowerCase()),
  )?.[1];
  if (!doi) continue;
  let citationCount;
  for (let attempt = 1; attempt <= 3 && citationCount === undefined; attempt++) {
    try {
      const response = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=citationCount`,
        { headers: { "User-Agent": "portfolio-citation-refresh" } },
      );
      if (response.status === 429) {
        console.warn(`rate-limited on "${pub.title.slice(0, 40)}…" — retry ${attempt}/3 after backoff`);
        await new Promise((r) => setTimeout(r, 8000 * attempt));
        continue;
      }
      if (!response.ok) {
        console.warn(`skip "${pub.title.slice(0, 40)}…": S2 API ${response.status}`);
        break;
      }
      ({ citationCount } = await response.json());
    } catch (error) {
      console.warn(`skip "${pub.title.slice(0, 40)}…": ${error.message}`);
      break;
    }
  }
  if (citationCount === undefined) continue;
  const count = Number.isFinite(citationCount) ? citationCount : 0;
  if (count !== (pub.citations ?? 0)) {
    changes.push(`"${pub.title.slice(0, 60)}${pub.title.length > 60 ? "…" : ""}": ${pub.citations ?? 0} → ${count}`);
    pub.citations = count;
  }
  await new Promise((r) => setTimeout(r, 3000)); // stay well under the public rate limit
}

if (changes.length) {
  writeFileSync(contentPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`citations updated (${changes.length}):`);
  for (const change of changes) console.log(`  - ${change}`);
} else {
  console.log("citations already current — no changes.");
}
