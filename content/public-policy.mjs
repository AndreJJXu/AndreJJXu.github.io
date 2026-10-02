// Shared by the browser and build generators. Unknown publication stages
// remain private until the author explicitly marks them published/accepted.
export function isPublicPublication(publication) {
  return ["published", "accepted"].includes(
    String(publication?.status || "").toLowerCase(),
  );
}

export function publicContent(content) {
  return {
    ...content,
    publications: (content.publications || []).filter(isPublicPublication),
    researchNotes: [],
  };
}
