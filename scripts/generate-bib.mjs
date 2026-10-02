import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { publicContent } from "../content/public-policy.mjs";

// Post-build step: export the full publication list as a BibTeX file at
// /assets/junjie-xu-publications.bib, linked from the homepage publications
// section. Entry types are heuristic (journal-looking venues → @article,
// conference-looking → @inproceedings, everything else → @misc).
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteBase = "https://andrejjxu.github.io";

const published = publicContent(JSON.parse(await readFile(resolve(projectRoot, "content/published.json"), "utf8")));
const publications = Array.isArray(published.publications) ? published.publications : [];

const venueYear = (venue) => {
  const m = /(19|20)\d{2}/.exec(String(venue || ""));
  return m ? m[0] : "";
};

const JOURNAL_HINTS = /(journal|transaction|survey|processing|management|acm tallip|ipm|csur|tnnls|tcsvt|expert|applied|letters|review|magazine)/i;
const CONFERENCE_HINTS = /(conference|ijcnn|acl|emnlp|naacl|cvpr|iccv|eccv|aaai|ijcai|neurips|icml|iclr|sigir|kdd|www|mm |multimedia|workshop|symposium|finding)/i;

const bibAuthors = (authors) =>
  String(authors || "")
    .split(/,\s*|\s+and\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (/^(et al\.?|and collaborators|others)$/i.test(part)) return "others";
      const pieces = part.split(/\s+/);
      if (pieces.length === 1) return pieces[0];
      const last = pieces[pieces.length - 1];
      const given = pieces.slice(0, -1).join(" ");
      return `${last}, ${given}`;
    })
    .join(" and ");

const keyFor = (pub, index) => {
  const year = venueYear(pub.venue) || "nd";
  const word = String(pub.title || "pub")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(the|for|and|with|from)$/i.test(w))[0] || "work";
  return `xu${year}${word.toLowerCase()}${index > 0 ? String(index).padStart(2, "0") : ""}`;
};

const entries = publications.map((pub, index) => {
  const year = venueYear(pub.venue) || "n.d.";
  const type = CONFERENCE_HINTS.test(pub.venue || "")
    ? "inproceedings"
    : JOURNAL_HINTS.test(pub.venue || "")
      ? "article"
      : "misc";
  const fields = [
    `  title       = {${String(pub.title || "").replace(/[{}]/g, "")}}`,
    `  author      = {${bibAuthors(pub.authors)}}`,
    type === "article"
      ? `  journal     = {${pub.venue}}`
      : type === "inproceedings"
        ? `  booktitle   = {${pub.venue}}`
        : `  howpublished = {${pub.venue}}`,
    `  year        = {${year}}`,
  ];
  if (pub.url && /^https?:\/\//.test(pub.url)) fields.push(`  url         = {${pub.url}}`);
  if (Number.isFinite(pub.citations) && pub.citations > 0) {
    fields.push(`  note        = {${pub.citations} citations (at export time)}`);
  }
  return `@${type}{${keyFor(pub, index)},\n${fields.join(",\n")}\n}`;
});

const file = `% Junjie Xu — complete publication list
% Generated from content/published.json at build time.
% ${siteBase}/#publications

${entries.join("\n\n")}
`;

const outDir = resolve(projectRoot, "dist/assets");
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, "junjie-xu-publications.bib"), file, "utf8");
console.log(`bib generated: dist/assets/junjie-xu-publications.bib (${entries.length} entries)`);
