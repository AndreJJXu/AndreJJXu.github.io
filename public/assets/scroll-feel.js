/*
 * Lenis inertial smooth scroll — the "sliding" scroll feel ported from the
 * claude.com scroll vocabulary (ScrollTrigger + Lenis, no pinning/scrubbing).
 * Self-hosted vendor build lives at /assets/vendor/lenis.min.js.
 *
 * Deliberately inert on touch/coarse pointers and under
 * prefers-reduced-motion, so native scrolling stays untouched there.
 */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  if (typeof window.Lenis === "undefined") return;

  var lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 1 });
  window.__lenis = lenis;
  document.documentElement.classList.add("scroll-feel-active");

  // Manual rAF loop (not autoRaf) so the behavior survives Lenis upgrades.
  function raf(time) {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  }
  window.requestAnimationFrame(raf);

  // Same-page anchors glide instead of jumping. Modified clicks
  // (ctrl/meta/shift/alt), new-tab links and missing targets stay native.
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    var link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute("target") === "_blank") return;
    var hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    var target = null;
    try {
      target = document.querySelector(hash);
    } catch (error) {
      return;
    }
    if (!target) return;
    event.preventDefault();
    try {
      lenis.scrollTo(hash, { duration: 1.1 });
    } catch (error) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
})();
