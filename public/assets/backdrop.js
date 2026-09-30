/*
 * Site backdrop — a quiet sci-fi starfield behind every public page.
 *
 * Three parallax depth layers drift slowly; the pointer eases the layers
 * apart (depth-scaled) so the background follows the mouse; stars near the
 * cursor connect to it with faint constellation lines, and an occasional
 * meteor crosses the field. Theme-aware via --mesh-dot / --hero-signal;
 * fully disabled under prefers-reduced-motion and hidden tabs.
 */
(function () {
  "use strict";

  if (window.__siteBackdropLoaded) return;
  window.__siteBackdropLoaded = true;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return; // site convention: motion layers degrade to nothing
  if (!document.createElement("canvas").getContext) return;

  var body = document.body;
  var canvas = document.createElement("canvas");
  var context = null;

  var LAYERS = [0.16, 0.42, 1.0]; // depth: far → near (drift + parallax scale)
  var stars = [];
  var meteors = [];
  var pointer = { x: 0.5, y: 0.4, active: false }; // normalized 0..1
  var eased = { x: 0.5, y: 0.4 };
  var colors = { accent: [117, 183, 255], signal: [105, 221, 181] };
  var width = 0;
  var height = 0;
  var rafId = 0;
  var running = false;
  var lastMeteorAt = 0;
  var nextMeteorIn = 5000 + Math.random() * 8000;

  canvas.className = "backdrop-canvas";
  canvas.setAttribute("aria-hidden", "true");

  function readThemeColors() {
    var styles = getComputedStyle(document.documentElement);
    var triplet = styles.getPropertyValue("--mesh-dot").trim();
    var match = /^\s*(\d{1,3})\D+(\d{1,3})\D+(\d{1,3})/.exec(triplet);
    if (match) colors.accent = [Number(match[1]), Number(match[2]), Number(match[3])];
    var signal = styles.getPropertyValue("--hero-signal").trim();
    var hex = /^#([0-9a-f]{6})$/i.exec(signal);
    if (hex) {
      colors.signal = [
        parseInt(hex[1].slice(0, 2), 16),
        parseInt(hex[1].slice(2, 4), 16),
        parseInt(hex[1].slice(4, 6), 16),
      ];
    }
  }

  function seedStars() {
    stars = [];
    var count = Math.max(70, Math.min(150, Math.round((width * height) / 11000)));
    for (var i = 0; i < count; i++) {
      var roll = Math.random();
      var layer = roll < 0.58 ? 0 : roll < 0.86 ? 1 : 2; // far majority, near minority
      var depth = LAYERS[layer];
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        depth: depth,
        radius: 0.35 + depth * (0.45 + Math.random() * 0.85),
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.35 + Math.random() * 0.9,
        signal: Math.random() < 0.14, // occasional signal-green star
      });
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
    if (!running) frame(performance.now());
  }

  function onPointerMove(event) {
    pointer.x = event.clientX / Math.max(1, window.innerWidth);
    pointer.y = event.clientY / Math.max(1, window.innerHeight);
    pointer.active = true;
    start();
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  function spawnMeteor(now) {
    var fromLeft = Math.random() < 0.5;
    meteors.push({
      x: fromLeft ? -40 : width + 40,
      y: Math.random() * height * 0.55,
      vx: (fromLeft ? 1 : -1) * (0.55 + Math.random() * 0.35),
      vy: 0.22 + Math.random() * 0.18,
      born: now,
      life: 900 + Math.random() * 500,
    });
  }

  function drawStar(star, offsetX, offsetY, alpha) {
    context.globalAlpha = alpha;
    context.fillStyle = star.signal
      ? "rgb(" + colors.signal.join(",") + ")"
      : "rgb(" + colors.accent.join(",") + ")";
    context.beginPath();
    context.arc(star.x + offsetX, star.y + offsetY, star.radius, 0, Math.PI * 2);
    context.fill();
  }

  function frame(now) {
    rafId = 0;
    if (document.hidden) {
      running = false;
      return;
    }
    running = true;

    // ease pointer for smooth parallax
    eased.x += (pointer.x - eased.x) * 0.055;
    eased.y += (pointer.y - eased.y) * 0.055;

    context.clearRect(0, 0, width, height);

    var time = now / 1000;
    var cursorX = pointer.active ? eased.x * width : -1e4;
    var cursorY = pointer.active ? eased.y * height : -1e4;
    var connected = [];

    for (var i = 0; i < stars.length; i++) {
      var star = stars[i];

      // slow deep-space drift, wrapped
      star.x += 0.014 * star.depth * 16;
      star.y += 0.005 * star.depth * 16;
      if (star.x > width + 8) star.x = -8;
      if (star.y > height + 8) star.y = -8;

      // depth-scaled parallax against the eased pointer
      var nx = (eased.x - 0.5) * 2;
      var ny = (eased.y - 0.5) * 2;
      var offsetX = -nx * 26 * star.depth;
      var offsetY = -ny * 18 * star.depth;
      var sx = star.x + offsetX;
      var sy = star.y + offsetY;

      var twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkle + star.phase);
      var alpha = (0.18 + 0.42 * star.depth) * twinkle;
      drawStar(star, offsetX, offsetY, alpha);

      if (pointer.active) {
        var dx = sx - cursorX;
        var dy = sy - cursorY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) connected.push({ star: star, sx: sx, sy: sy, dist: dist });
      }
    }

    if (pointer.active) {
      // cursor glow
      var glow = context.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, 170);
      glow.addColorStop(0, "rgba(" + colors.accent.join(",") + ", 0.07)");
      glow.addColorStop(1, "rgba(" + colors.accent.join(",") + ", 0)");
      context.globalAlpha = 1;
      context.fillStyle = glow;
      context.fillRect(cursorX - 170, cursorY - 170, 340, 340);

      // constellation: cursor → nearest stars (targeting-reticle feel)
      connected.sort(function (a, b) { return a.dist - b.dist; });
      context.lineWidth = 0.6;
      context.strokeStyle = "rgba(" + colors.accent.join(",") + ", 1)";
      for (var c = 0; c < connected.length && c < 10; c++) {
        var link = connected[c];
        context.globalAlpha = (1 - link.dist / 150) * 0.3;
        context.beginPath();
        context.moveTo(cursorX, cursorY);
        context.lineTo(link.sx, link.sy);
        context.stroke();
      }
    }

    // meteors
    if (now - lastMeteorAt > nextMeteorIn) {
      lastMeteorAt = now;
      nextMeteorIn = 6000 + Math.random() * 9000;
      spawnMeteor(now);
    }
    for (var m = meteors.length - 1; m >= 0; m--) {
      var meteor = meteors[m];
      var age = now - meteor.born;
      if (age > meteor.life) {
        meteors.splice(m, 1);
        continue;
      }
      meteor.x += meteor.vx * 16;
      meteor.y += meteor.vy * 16;
      var fade = Math.sin((age / meteor.life) * Math.PI);
      var tailX = meteor.x - meteor.vx * 130;
      var tailY = meteor.y - meteor.vy * 130;
      var streak = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      streak.addColorStop(0, "rgba(" + colors.signal.join(",") + ", " + 0.5 * fade + ")");
      streak.addColorStop(1, "rgba(" + colors.signal.join(",") + ", 0)");
      context.globalAlpha = 1;
      context.strokeStyle = streak;
      context.lineWidth = 1.1;
      context.beginPath();
      context.moveTo(meteor.x, meteor.y);
      context.lineTo(tailX, tailY);
      context.stroke();
    }

    context.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(frame);
  }

  function onVisibility() {
    if (!document.hidden) start();
  }

  function onThemeChange() {
    readThemeColors();
    if (!running) frame(performance.now());
  }

  context = canvas.getContext("2d");
  if (!context) return;

  readThemeColors();
  resize();
  body.insertBefore(canvas, body.firstChild);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("themechange", onThemeChange);
  window.addEventListener("resize", resize);
  start();
})();
