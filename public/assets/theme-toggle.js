/* Light/dark theme toggle. Loaded with `defer` on every page family that
   shows the [data-theme-toggle] button (home, works gallery, work papers).
   The data-theme attribute itself is set before first paint by the tiny
   bootstrap inline in each <head>; this file only flips it on demand,
   persists the choice, and syncs every button on the page. */
(function () {
  "use strict";

  var root = document.documentElement;
  var isZh = (root.lang || "").toLowerCase().indexOf("zh") === 0;
  var LABELS = isZh
    ? { toLight: "切换亮色模式", toDark: "切换暗色模式" }
    : { toLight: "Switch to light mode", toDark: "Switch to dark mode" };

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function persist(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      /* storage unavailable (private mode etc.) — toggle still works live */
    }
  }

  function updateMetaThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f3f6fa" : "#07111f");
  }

  function syncButtons() {
    var theme = currentTheme();
    // Dark shows ☀ ("switch to light"); light shows ☾ ("switch to dark").
    var glyph = theme === "dark" ? "☀" : "☾";
    var label = theme === "dark" ? LABELS.toLight : LABELS.toDark;
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].textContent = glyph;
      buttons[i].setAttribute("aria-label", label);
      buttons[i].setAttribute("title", label);
      // pressed = light mode active (the button's toggle state).
      buttons[i].setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
    updateMetaThemeColor(theme);
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var button = target.closest("[data-theme-toggle]");
    if (!button) return;
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    persist(next);
    syncButtons();
    // Canvas painters (mesh flow in script.js) re-read their theme colors.
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  });

  syncButtons();
})();
