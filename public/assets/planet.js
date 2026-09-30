/*
 * Dark-theme planet backdrop — a real WebGL Earth rendered behind the site.
 *
 * Composition (from real NASA-derived maps, vendored under
 * /assets/vendor/planet/): a MeshPhong surface with normal relief and
 * ocean specular, an additive night-lights shell that fades in on the
 * unlit hemisphere, an independently drifting cloud sphere, and a Fresnel
 * atmosphere rim. The camera and the planet both ease toward the pointer,
 * so the whole system visibly follows the mouse. Shown in dark theme only;
 * renders a single static frame under prefers-reduced-motion.
 *
 * Loaded as a classic deferred script (so both vite-built pages and the
 * post-build generated pages reference the same stable URL); three.js is
 * pulled in with a runtime dynamic import below.
 */
(function () {
  "use strict";

  import("/assets/vendor/three.module.min.js").then(startPlanet).catch(function () {
    /* three.js unavailable — the starfield backdrop remains */
  });

  function startPlanet(THREE) {

  if (window.__sitePlanetLoaded) return;
  window.__sitePlanetLoaded = true;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var probe = document.createElement("canvas");
  if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

  var TEXTURES = "/assets/vendor/planet/";
  var canvas = document.createElement("canvas");
  canvas.className = "planet-canvas";
  canvas.setAttribute("aria-hidden", "true");

  var renderer = null;
  var scene, camera, earth, clouds, atmosphere, lights;
  var sun = new THREE.DirectionalLight(0xfff2e0, 2.6);
  var system = new THREE.Group();
  var clock = new THREE.Clock();
  var rafId = 0;
  var running = false;
  var disposed = false;
  var pointer = { x: 0, y: 0, active: false };
  var eased = { x: 0, y: 0 };
  var spinEased = 0;
  var baseEarthSpin = 0;

  function isDark() {
    return document.documentElement.getAttribute("data-theme") !== "light";
  }

  function buildScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 3.4);

    // Key light: warm sun from the upper left, the classic limb-lit look.
    sun.position.set(-6, 2.2, 3.5);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x24344f, 1.1));

    var loader = new THREE.TextureLoader();
    var dayMap = loader.load(TEXTURES + "earth_atmos_2048.jpg");
    var normalMap = loader.load(TEXTURES + "earth_normal_2048.jpg");
    var specMap = loader.load(TEXTURES + "earth_specular_2048.jpg");
    var lightsMap = loader.load(TEXTURES + "earth_lights_2048.jpg");
    var cloudsMap = loader.load(TEXTURES + "earth_clouds_1024.png");
    [dayMap, lightsMap, cloudsMap].forEach(function (t) { t.colorSpace = THREE.SRGBColorSpace; });

    var surfaceGeo = new THREE.SphereGeometry(1, 96, 96);

    earth = new THREE.Mesh(
      surfaceGeo,
      new THREE.MeshPhongMaterial({
        map: dayMap,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.85, 0.85),
        specularMap: specMap,
        specular: new THREE.Color(0x8fa6c4),
        shininess: 16,
      })
    );
    system.add(earth);

    // Night-side city lights: additive shell, revealed where the sun is not.
    lights = new THREE.Mesh(
      new THREE.SphereGeometry(1.002, 96, 96),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: {
          uLights: { value: lightsMap },
          uSunDirection: { value: sun.position.clone().normalize() },
        },
        vertexShader: [
          "varying vec2 vUv;",
          "varying vec3 vWorldNormal;",
          "void main() {",
          "  vUv = uv;",
          "  vWorldNormal = normalize(mat3(modelMatrix) * normal);",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
          "}",
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D uLights;",
          "uniform vec3 uSunDirection;",
          "varying vec2 vUv;",
          "varying vec3 vWorldNormal;",
          "void main() {",
          "  float lit = dot(normalize(vWorldNormal), normalize(uSunDirection));",
          "  float night = smoothstep(0.12, -0.28, lit);",
          "  vec3 city = texture2D(uLights, vUv).rgb;",
          "  gl_FragColor = vec4(city * night * 1.55, 1.0);",
          "}",
        ].join("\n"),
      })
    );
    system.add(lights);

    // Cloud deck: slightly larger sphere, lit by the same sun, drifting
    // a touch faster than the surface.
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 96, 96),
      new THREE.MeshLambertMaterial({ map: cloudsMap, transparent: true, depthWrite: false, opacity: 0.9 })
    );
    system.add(clouds);

    // Atmosphere: back-side Fresnel shell around the whole planet.
    atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.16, 64, 64),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(0x6fb3ff) } },
        vertexShader: [
          "varying vec3 vNormal;",
          "varying vec3 vViewDir;",
          "void main() {",
          "  vNormal = normalize(normalMatrix * normal);",
          "  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);",
          "  vViewDir = normalize(-viewPos.xyz);",
          "  gl_Position = projectionMatrix * viewPos;",
          "}",
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 uColor;",
          "varying vec3 vNormal;",
          "varying vec3 vViewDir;",
          "void main() {",
          "  float rim = pow(0.72 + dot(vNormal, vViewDir), 3.2);",
          "  gl_FragColor = vec4(uColor, 1.0) * rim * 0.85;",
          "}",
        ].join("\n"),
      })
    );
    system.add(atmosphere);

    scene.add(system);
    layout();
  }

  // Anchor the planet in screen space: a large, partly cropped sphere on the
  // right for landscape viewports; smaller, upper-right on narrow screens so
  // it never sits behind the main text column on phones.
  function layout() {
    var aspect = Math.max(0.42, window.innerWidth / Math.max(1, window.innerHeight));
    camera.aspect = aspect;
    var visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    var visibleWidth = visibleHeight * aspect;
    var radius, cx, cy;
    if (aspect >= 1.05) {
      radius = visibleHeight * 0.62;
      cx = visibleWidth * 0.36;
      cy = -visibleHeight * 0.2;
    } else {
      radius = visibleHeight * 0.34;
      cx = visibleWidth * 0.3;
      cy = visibleHeight * 0.32;
    }
    system.scale.setScalar(radius);
    system.position.set(cx, cy, 0);
    camera.updateProjectionMatrix();
  }

  function resizeRenderer() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    layout();
    if (!running) frame();
  }

  function onPointerMove(event) {
    pointer.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    pointer.y = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    pointer.active = true;
    start();
  }

  function frame() {
    rafId = 0;
    if (disposed || document.hidden || !isDark()) {
      running = false;
      return;
    }
    running = true;
    var delta = Math.min(clock.getDelta(), 0.05);
    var time = clock.elapsedTime;

    if (!reducedMotion.matches) {
      earth.rotation.y = baseEarthSpin += delta * 0.012;
      clouds.rotation.y += delta * 0.016;

      // Camera parallax toward the pointer (eased) + a slow idle drift so the
      // scene breathes even without input.
      eased.x += (pointer.x - eased.x) * 0.045;
      eased.y += (pointer.y - eased.y) * 0.045;
      spinEased += ((pointer.active ? pointer.x : 0) - spinEased) * 0.03;
      camera.position.x = eased.x * 0.42 + Math.sin(time * 0.05) * 0.05;
      camera.position.y = -eased.y * 0.26 + Math.cos(time * 0.04) * 0.04;
      camera.lookAt(system.position.x * 0.25, system.position.y * 0.25, 0);
      system.rotation.y = spinEased * 0.1;
      system.rotation.z = Math.sin(time * 0.03) * 0.012;
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (!rafId && !reducedMotion.matches) rafId = requestAnimationFrame(frame);
  }

  function onThemeChange() {
    if (isDark()) {
      canvas.style.display = "";
      clock.getDelta();
      start();
      if (reducedMotion.matches) frame();
    } else {
      canvas.style.display = "none";
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
        running = false;
      }
    }
  }

  function onVisibility() {
    if (!document.hidden && isDark()) {
      clock.getDelta();
      start();
    }
  }

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  buildScene();
  document.body.appendChild(canvas);
  resizeRenderer();

  if (isDark() && reducedMotion.matches) frame(); // one static, pointer-free frame

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", resizeRenderer);
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("themechange", onThemeChange);
  if (isDark()) start();
  }
})();
