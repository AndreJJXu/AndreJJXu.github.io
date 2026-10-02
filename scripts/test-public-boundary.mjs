import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  isPublicPublication,
  publicContent,
} from "../content/public-policy.mjs";
import config from "../vite.public.config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixture = await mkdtemp(resolve(tmpdir(), "portfolio-boundary-"));
try {
  for (const status of [
    "Preprint",
    "Under review",
    "Manuscript",
    "Draft",
    "",
    undefined,
  ]) {
    assert.equal(
      isPublicPublication({ status }),
      false,
      `${status} must remain private`,
    );
  }
  assert.equal(isPublicPublication({ status: "Published" }), true);
  assert.equal(isPublicPublication({ status: "Accepted" }), true);
  const source = {
    publications: [
      { title: "Public", status: "Published" },
      { title: "Private", status: "Preprint" },
    ],
    researchNotes: [{ body: "private" }],
  };
  const publicData = publicContent(source);
  assert.deepEqual(
    publicData.publications.map((p) => p.title),
    ["Public"],
  );
  assert.deepEqual(publicData.researchNotes, []);
  assert.equal(
    source.publications.length,
    2,
    "Public filtering must preserve the author's originals",
  );

  const check = () =>
    spawnSync(
      process.execPath,
      [resolve(root, "scripts/check-privacy.mjs"), fixture],
      { encoding: "utf8" },
    );
  assert.equal(check().status, 0, "Empty fixture has no restricted material");
  const rejected = [
    ["works/garbo/index.html", "draft", "Unapproved research route"],
    [
      "assets/works/new-draft/result.png",
      "fixture",
      "Unapproved research figure",
    ],
    ["assets/draft.pdf", "fixture", "Unapproved material download"],
    [
      "assets/hidden.js",
      'const url="/works/zh/healbench/";',
      "Restricted research URL",
    ],
    [
      "index.html",
      '<a href="https://arxiv.org/abs/1234.5678">draft</a>',
      "Unpublished material link",
    ],
    ["studio/index.html", "local authoring", "Private source shipped"],
  ];
  for (const [path, payload, expected] of rejected) {
    const file = resolve(fixture, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, payload);
    const result = check();
    assert.equal(result.status, 1, `${path} must block publication`);
    assert.ok(result.stderr.includes(expected), result.stderr);
    await rm(file);
  }

  const copiedAssets = resolve(fixture, "copied-public-assets");
  for (const slug of ["mars", "garbo", "new-draft"]) {
    await mkdir(resolve(copiedAssets, "assets/works", slug), {
      recursive: true,
    });
    await writeFile(
      resolve(copiedAssets, "assets/works", slug, "fixture.png"),
      slug,
    );
  }
  config.plugins
    .find((p) => p.name === "public-research-boundary")
    .writeBundle({ dir: copiedAssets });
  assert.equal(
    await readFile(
      resolve(copiedAssets, "assets/works/mars/fixture.png"),
      "utf8",
    ),
    "mars",
  );
  await assert.rejects(
    readFile(resolve(copiedAssets, "assets/works/garbo/fixture.png")),
  );
  await assert.rejects(
    readFile(resolve(copiedAssets, "assets/works/new-draft/fixture.png")),
  );
  console.log(
    "Public boundary tests passed: unknown stages stay private, 6 leaking artifacts are rejected, unapproved copied assets are removed, local originals are preserved.",
  );
} finally {
  await rm(fixture, { recursive: true, force: true });
}
