// The public runtime never imports the private/local authoring content.
const zh = document.documentElement.lang === "zh-CN";
const themeButton = document.querySelector("[data-theme-toggle]");
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeButton?.setAttribute("aria-pressed", String(dark));
  themeButton?.setAttribute(
    "aria-label",
    zh
      ? dark
        ? "切换浅色模式"
        : "切换深色模式"
      : dark
        ? "Switch to light mode"
        : "Switch to dark mode",
  );
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#20211e" : "#faf9f5");
}
themeButton?.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* Theme still works for this visit. */
  }
  syncThemeButton();
});
syncThemeButton();

const rows = [
  ...document.querySelectorAll("[data-publication-list] .paper-row"),
];
const filters = [...document.querySelectorAll("[data-publication-filter]")];
filters.forEach((button) =>
  button.addEventListener("click", () => {
    const first = button.dataset.publicationFilter === "first";
    let count = 0;
    rows.forEach((row) => {
      row.hidden = first && row.dataset.firstAuthor !== "true";
      if (!row.hidden) count++;
    });
    filters.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("is-active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    const status = document.querySelector("[data-filter-status]");
    if (status) status.textContent = zh ? `${count} 篇论文` : `${count} papers`;
  }),
);

// Anchor links into collapsed credentials also work from legacy research pages.
function revealAnchor() {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target instanceof HTMLDetailsElement) target.open = true;
}
window.addEventListener("hashchange", revealAnchor);
revealAnchor();
