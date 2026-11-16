import { useLayoutEffect } from "react";
import { smoothScrollTo } from "./smoothScroll.js";

// 3D scroll journey for the landing page.
//
// The .journey section is taller than the screen and its .journey-stage is sticky, so the stage stays put while
// the page scrolls. Scroll position drives a camera that flies forward through .journey-world: every .scene sits
// GAP px deeper than the previous one, arrives out of the distance, rests on the screen plane, then passes the camera.
// A canvas star field and floating .debris chips share the same camera, which is what sells the depth.
//
// Layout and look live in styles/home-fx.css. Without this script (or with reduced motion) the scenes are
// ordinary stacked sections.
//
// Performance notes: every per-frame write is a transform or opacity (compositor-only), written only when it
// changed; positions are never rounded (whole-pixel steps read as judder at slow speeds); the star field is drawn
// in a few dozen batched paths; and while nothing is moving the ambient layers update at half rate.

const PERSPECTIVE = 1100; // px — keep in sync with the perspective on .journey-stage in home-fx.css
const GAP = 2000; // world distance between two scenes
const TRAVEL = 0.8; // scroll, in stage heights, to fly from one scene to the next
const HOLD = 0.18; // scroll a scene rests for
const FIRST_HOLD = 0.06;
const RING_HOLD = 1.05; // the channel ring turns through its cards while it rests
const RING_STEP = 40; // degrees between two ring cards
// Seconds. The camera follows its scroll-mapped position through this lag, so its speed never changes in a single
// frame — not where a flight starts or stops at a scene, and not on touch or keyboard scrolls without inertia.
const CAMERA_LAG = 0.12;

// Per scene: where the camera stops (x, y at a 1440px-wide stage) and how the scene is tilted while still far away.
const ROUTE = [
  { x: 0, y: 0, rx: 0, ry: 0 },
  { x: 0, y: 0, rx: 34, ry: 0 },
  { x: -700, y: 140, rx: 6, ry: 32 },
  { x: 700, y: -140, rx: -6, ry: -32 },
  { x: -520, y: 160, rx: 8, ry: 26 },
  { x: 0, y: 0, rx: 18, ry: 0 }
];

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Flight between two scenes, and the ring turning from one card to the next: settles gently at both ends but never
// stops outright, so every bit of scroll still moves something (a full smoothstep leaves dead zones that feel stuck).
const glide = (t) => lerp(t, t * t * (3 - 2 * t), 0.65);
const wrap = (v, half) => ((((v + half) % (half * 2)) + half * 2) % (half * 2)) - half;
const num = (v, digits = 2) => v.toFixed(digits);

function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- Star field ---------- */
const STAR_DEPTH = 3200;
const STAR_NEAR = 700; // stars keep flying this far past the screen plane before they respawn in the distance
const STAR_FIELDS = 5; // x, y, depth, size, colour index
const ALPHA_BINS = 5; // stars are batched by colour and brightness: one fill + one stroke per batch
const TAU = Math.PI * 2;

function createStars(count) {
  const rand = seeded(11);
  const stars = new Float32Array(count * STAR_FIELDS);
  for (let i = 0; i < count; i++) {
    const o = i * STAR_FIELDS;
    stars[o] = rand() * 2 - 1;
    stars[o + 1] = rand() * 2 - 1;
    stars[o + 2] = rand() * STAR_DEPTH;
    stars[o + 3] = 0.6 + rand() * 1.1;
    stars[o + 4] = rand() < 0.86 ? 0 : 1 + Math.floor(rand() * 3);
  }
  return stars;
}

function drawStars(ctx, stars, view, cam, look) {
  const { w, h } = view;
  const cx = w / 2;
  const cy = h / 2;
  const spreadX = Math.max(w, 900) * 1.25;
  const spreadY = Math.max(h, 600) * 1.25;
  // At speed each star is drawn as a line back to where it was a moment ago.
  const streak = clamp(cam.vel * 2.4, -420, 420);
  const streaking = Math.abs(streak) > 6;
  const groups = look.colors.length * ALPHA_BINS;
  const dotPaths = new Array(groups);
  const linePaths = new Array(groups);

  for (let o = 0; o < stars.length; o += STAR_FIELDS) {
    const d = (((stars[o + 2] - cam.z) % STAR_DEPTH) + STAR_DEPTH) % STAR_DEPTH;
    const fade = Math.min(1, d / 260) * (1 - smooth(STAR_DEPTH * 0.5, STAR_DEPTH, d));
    if (fade < 0.04) continue;
    const scale = PERSPECTIVE / (PERSPECTIVE - STAR_NEAR + d);
    const x = wrap(stars[o] * spreadX - cam.x, spreadX);
    const y = wrap(stars[o + 1] * spreadY - cam.y, spreadY);
    const sx = cx + x * scale;
    const sy = cy + y * scale;
    if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue;

    const g = stars[o + 4] * ALPHA_BINS + Math.min(ALPHA_BINS - 1, Math.floor(fade * ALPHA_BINS));
    const tail = d + streak;
    if (streaking && tail > 0 && tail < STAR_DEPTH) {
      const tailScale = PERSPECTIVE / (PERSPECTIVE - STAR_NEAR + tail);
      const path = linePaths[g] || (linePaths[g] = new Path2D());
      path.moveTo(cx + x * tailScale, cy + y * tailScale);
      path.lineTo(sx, sy);
    } else {
      const r = Math.min(3.2, stars[o + 3] * scale);
      const path = dotPaths[g] || (dotPaths[g] = new Path2D());
      path.moveTo(sx + r, sy);
      path.arc(sx, sy, r, 0, TAU);
    }
  }

  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round";
  ctx.lineWidth = 1.5;
  for (let g = 0; g < groups; g++) {
    if (!dotPaths[g] && !linePaths[g]) continue;
    const c = Math.floor(g / ALPHA_BINS);
    const strength = c === 0 ? look.alpha : 0.9;
    ctx.globalAlpha = strength * ((g % ALPHA_BINS) + 0.5) / ALPHA_BINS;
    ctx.fillStyle = look.colors[c];
    ctx.strokeStyle = look.colors[c];
    if (dotPaths[g]) ctx.fill(dotPaths[g]);
    if (linePaths[g]) ctx.stroke(linePaths[g]);
  }
  ctx.globalAlpha = 1;
}

/* ---------- Journey ---------- */
function initJourney(section) {
  const root = document.documentElement;
  const stage = section.querySelector(".journey-stage");
  const world = section.querySelector(".journey-world");
  const canvas = section.querySelector(".journey-canvas");
  const ctx = canvas.getContext("2d");
  const hint = section.querySelector(".journey-hint");
  const meter = section.querySelector(".ring-meter-fill");
  const glows = [...section.querySelectorAll(".journey-glow span")];
  const dots = [...section.querySelectorAll(".journey-dot")];
  const scenes = [...section.querySelectorAll(".scene")].map((el) => ({
    el,
    inner: el.querySelector(".scene-inner"),
    ring: el.querySelector(".ring"),
    cards: [...el.querySelectorAll(".ring-card")].map((card) => ({ el: card, front: null })),
    visible: null,
    active: null
  }));
  const debris = [...section.querySelectorAll(".debris")].map((el) => ({ el, z: 0, close: false, visible: null }));
  const count = scenes.length;
  const ringIndex = scenes.findIndex((sc) => sc.ring);
  const navH = parseFloat(getComputedStyle(root).getPropertyValue("--nav-height")) || 0;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const stars = createStars(coarse ? 260 : 560);
  const written = new WeakMap();

  const view = { w: 0, h: 0 };
  const look = { colors: [], alpha: 0.5 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let k = 1; // route scale: lateral camera moves shrink on narrow screens
  let stops = [];
  let total = 0;
  let top = 0;
  let ringR = 0;
  let scrollNow = 0;
  const cam = { pos: 0, turn: 0 };
  let lastZ = null;
  let vel = 0;
  let lastTime = 0;
  let activeDot = -1;
  let frame = 0;
  let idleFrames = 0;

  // Skip DOM writes when the value has not changed.
  function put(el, prop, value) {
    let seen = written.get(el);
    if (!seen) written.set(el, (seen = {}));
    if (seen[prop] !== value) {
      seen[prop] = value;
      el.style[prop] = value;
    }
  }

  // Hidden things also stop their CSS animations (see .is-hidden in home-fx.css).
  function setVisible(item, visible) {
    if (visible === item.visible) return;
    item.visible = visible;
    item.el.classList.toggle("is-hidden", !visible);
  }

  const routeAt = (pos) => {
    const i = clamp(Math.floor(pos), 0, count - 1);
    const a = ROUTE[i % ROUTE.length];
    const b = ROUTE[Math.min(count - 1, i + 1) % ROUTE.length];
    const f = clamp(pos - i);
    return { x: lerp(a.x, b.x, f) * k, y: lerp(a.y, b.y, f) * k };
  };

  function readTheme() {
    const styles = getComputedStyle(root);
    const bg = styles.getPropertyValue("--bg").trim();
    const dark = parseInt(bg.slice(1, 3), 16) < 128;
    look.colors = [styles.getPropertyValue("--ink").trim() || "#1a1919", "#ff6666", "#00b398", "#d9963b"];
    look.alpha = dark ? 0.6 : 0.34;
  }

  function measure() {
    view.w = stage.clientWidth;
    view.h = stage.clientHeight;
    k = Math.min(1, view.w / 1440);

    // Scroll timeline: fly to a scene, rest on it, fly to the next.
    let s = 0;
    stops = scenes.map((sc, i) => {
      if (i) s += TRAVEL * view.h;
      const start = s;
      s += (i === 0 ? FIRST_HOLD : sc.ring ? RING_HOLD : HOLD) * view.h;
      return { start, end: s };
    });
    total = s;
    section.style.height = `${Math.round(total + view.h)}px`;
    top = section.getBoundingClientRect().top + window.scrollY - navH;

    // Shrink any scene that is taller or wider than the stage.
    for (const sc of scenes) {
      const fit = Math.min(1, (view.h - 24) / sc.inner.offsetHeight, view.w / sc.inner.offsetWidth);
      sc.inner.style.setProperty("--fit", fit.toFixed(4));
    }

    // Ring radius: just large enough that a neighbouring card clears the one facing the viewer.
    if (ringIndex >= 0) {
      const sc = scenes[ringIndex];
      const step = (RING_STEP * Math.PI) / 180;
      ringR = Math.round(((sc.ring.offsetWidth / 2) * (1 + Math.cos(step)) + 28) / Math.sin(step));
      sc.cards.forEach((card, i) => {
        card.el.style.transform = `rotateY(${i * RING_STEP}deg) translateZ(${ringR}px)`;
      });
    }

    // Two kinds of debris share the route. Every third piece flanks it far out to the side and is visible from a
    // distance. The rest sit between two scenes, closer to the centre line: they stay in the fog until the camera
    // is nearly on them, then sweep past it. Keeping those out of the scene planes means they never cover content.
    const rand = seeded(7);
    const maxZ = (count - 1) * GAP + 900;
    const gaps = Math.max(1, count - 1);
    debris.forEach((item, j) => {
      item.close = j % 3 !== 0;
      item.z = item.close
        ? (j % gaps) * GAP + GAP * (0.4 + rand() * 0.45)
        : 520 + ((j + rand() * 2) / debris.length) * (maxZ - 520);
      const centre = routeAt(item.z / GAP);
      // Pieces in sight of the first scene stay wide and in its upper half, clear of the headline and the marquee.
      const nearHero = item.z < GAP;
      const reach = item.close ? (nearHero ? 0.5 : 0.3) + rand() * 0.45 : 0.62 + rand() * 0.5;
      const x = centre.x + (j % 2 ? 1 : -1) * reach * Math.max(view.w, 640);
      const y = centre.y + (nearHero ? -0.04 - rand() * 0.36 : (rand() * 2 - 1) * 0.38) * view.h;
      item.el.style.transform = `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,${(-item.z).toFixed(0)}px)`;
    });

    // The star field is soft points of light: 1.5x pixel density is indistinguishable from 2–3x and fills far fewer pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    canvas.width = Math.round(view.w * dpr);
    canvas.height = Math.round(view.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // How far the channel ring has turned (0 = first card facing the viewer, 1 = last) while the camera rests on
  // scene i, `hold` of the way through that rest.
  const ringTurn = (i, hold) => (i < ringIndex ? 0 : i > ringIndex ? 1 : clamp((hold - 0.03) / 0.92));

  // Scroll offset -> camera position, as a fractional scene index (2.5 = halfway between scenes 2 and 3), plus the
  // ring's turn. The turn is worked out here from the scroll, not later from the lagging camera: the lagged position
  // only reaches the ring exactly once scrolling stops, so gating on it froze the ring on the way down.
  function cameraAt(y) {
    for (let i = 0; i < count; i++) {
      const stop = stops[i];
      if (y > stop.end && i < count - 1) continue;
      if (y >= stop.start) return { pos: i, turn: ringTurn(i, clamp((y - stop.start) / (stop.end - stop.start))) };
      const prev = stops[i - 1];
      return { pos: i - 1 + glide(clamp((y - prev.end) / (stop.start - prev.end))), turn: ringTurn(i - 1, 1) };
    }
    return { pos: 0, turn: 0 };
  }

  function render(now, dt, ambient) {
    const z = cam.pos * GAP;
    const centre = routeAt(cam.pos);
    const camX = centre.x - pointer.x * 18;
    const camY = centre.y - pointer.y * 12;

    put(world, "transform", `translate3d(${num(-camX)}px,${num(-camY)}px,${num(z)}px)`);

    scenes.forEach((sc, i) => {
      const zc = z - i * GAP; // 0 = on the screen plane, negative = still ahead, positive = already passed
      // Passed scenes fade out quickly: a plane blown up past ~1.5x costs a lot of GPU fill for little effect.
      const opacity = zc <= 0 ? smooth(-GAP * 0.95, -GAP * 0.4, zc) : 1 - smooth(40, 400, zc);
      setVisible(sc, opacity > 0.003);
      if (!sc.visible) return;

      const route = ROUTE[i % ROUTE.length];
      const far = clamp(-zc / GAP);
      put(
        sc.el,
        "transform",
        `translate3d(${num(route.x * k)}px,${num(route.y * k)}px,${-i * GAP}px) ` +
          `rotateX(${num(route.rx * far)}deg) rotateY(${num(route.ry * far)}deg)`
      );
      put(sc.el, "opacity", num(opacity, 3));

      const active = Math.abs(zc) < 30;
      if (active !== sc.active) {
        sc.active = active;
        sc.el.classList.toggle("is-active", active);
        sc.el.inert = !active;
        if (active) sc.el.classList.add("is-in");
      }
    });

    if (ringIndex >= 0 && scenes[ringIndex].visible) {
      const sc = scenes[ringIndex];
      const turn = cam.turn;
      const u = turn * (sc.cards.length - 1);
      const whole = clamp(Math.floor(u), 0, Math.max(0, sc.cards.length - 2));
      const angle = (whole + glide(u - whole)) * RING_STEP;
      const spin = (1 - glide(clamp(cam.pos - (ringIndex - 1)))) * 70; // swings into place while flying in
      put(sc.ring, "transform", `translateZ(${-ringR}px) rotateY(${num(spin - angle)}deg)`);
      sc.cards.forEach((card, i) => {
        const off = Math.abs(i * RING_STEP + spin - angle);
        put(card.el, "opacity", num(1 - 0.7 * clamp(off / (RING_STEP * 1.4)), 3));
        const front = off < RING_STEP / 2;
        if (front !== card.front) {
          card.front = front;
          card.el.classList.toggle("is-front", front);
        }
      });
      if (meter) put(meter, "transform", `scaleX(${num(turn, 4)})`);
    }

    debris.forEach((item) => {
      const zc = z - item.z;
      const fadeIn = item.close ? smooth(-1100, -350, zc) : smooth(-2100, -700, zc);
      const opacity = zc <= 0 ? fadeIn : 1 - smooth(150, 520, zc);
      setVisible(item, opacity > 0.003);
      if (item.visible) put(item.el, "opacity", num(opacity, 3));
    });

    const nearest = Math.round(cam.pos);
    if (nearest !== activeDot) {
      activeDot = nearest;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === nearest));
    }
    if (hint) put(hint, "opacity", num(1 - clamp(scrollNow / (view.h * 0.12)), 3));

    // Camera speed, smoothed so the star streaks grow and shrink instead of flickering frame to frame.
    const instant = lastZ === null || !dt ? 0 : (z - lastZ) / (dt * 60);
    lastZ = z;
    vel += (instant - vel) * (1 - Math.exp(-(dt || 0.016) / 0.08));
    if (Math.abs(vel) < 0.05) vel = 0;

    if (!ambient) return;
    const t = now / 1000;
    glows.forEach((glow, i) => {
      const a = cam.pos * 0.9 + i * 2.1 + t * 0.05;
      const gx = Math.cos(a) * view.w * 0.24 - pointer.x * (i + 1) * 14;
      const gy = Math.sin(a * 1.3) * view.h * 0.2 - pointer.y * (i + 1) * 10;
      put(glow, "transform", `translate3d(${num(gx, 1)}px,${num(gy, 1)}px,0)`);
    });
    // Stars drift slowly even when the page is still, and streak with the camera's speed.
    drawStars(ctx, stars, view, { x: camX, y: camY, z: z + t * 20, vel }, look);
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    scrollNow = clamp(window.scrollY - top, 0, total);
    const target = cameraAt(scrollNow);
    const follow = 1 - Math.exp(-dt / CAMERA_LAG);
    cam.pos += (target.pos - cam.pos) * follow;
    cam.turn += (target.turn - cam.turn) * follow;
    const settled = Math.abs(target.pos - cam.pos) < 0.0003 && Math.abs(target.turn - cam.turn) < 0.0003;
    if (settled) {
      cam.pos = target.pos;
      cam.turn = target.turn;
    }
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt / 0.25));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt / 0.25));

    // At rest only the slow ambient drift is moving; refresh it every other frame to save power.
    const moving =
      !settled ||
      vel !== 0 ||
      Math.abs(pointer.tx - pointer.x) > 0.002 ||
      Math.abs(pointer.ty - pointer.y) > 0.002;
    idleFrames = moving ? 0 : idleFrames + 1;
    render(now, dt, idleFrames % 2 === 0);
  }

  function start() {
    if (frame) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function refresh() {
    measure();
    scrollNow = clamp(window.scrollY - top, 0, total);
    Object.assign(cam, cameraAt(scrollNow));
    render(performance.now(), 0, true);
  }

  // Phones fire resize whenever the address bar slides in or out. The stage is sized in svh and does not change
  // then, so only rebuild when the stage really changed size.
  function onResize() {
    if (stage.clientWidth === view.w && stage.clientHeight === view.h) return;
    refresh();
  }

  function onPointerMove(event) {
    if (event.pointerType !== "mouse") return;
    pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  function onDotClick(event) {
    const i = dots.indexOf(event.currentTarget);
    const stopAt = stops[i];
    const y = scenes[i].ring ? stopAt.start + 1 : (stopAt.start + stopAt.end) / 2;
    smoothScrollTo(top + y);
  }

  section.classList.add("is-3d");
  readTheme();
  refresh();

  const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
  visibility.observe(section);
  const themeAttr = new MutationObserver(readTheme);
  themeAttr.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", readTheme);
  window.addEventListener("resize", onResize);
  window.addEventListener("load", refresh);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  dots.forEach((dot) => dot.addEventListener("click", onDotClick));
  document.fonts?.ready.then(refresh);

  return () => {
    stop();
    visibility.disconnect();
    themeAttr.disconnect();
    scheme.removeEventListener("change", readTheme);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("load", refresh);
    window.removeEventListener("pointermove", onPointerMove);
    dots.forEach((dot) => {
      dot.removeEventListener("click", onDotClick);
      dot.classList.remove("is-active");
    });
    section.classList.remove("is-3d");
    const touched = [section, world, hint, meter, ...glows];
    for (const item of debris) {
      item.el.classList.remove("is-hidden");
      touched.push(item.el);
    }
    for (const sc of scenes) {
      sc.el.inert = false;
      sc.el.classList.remove("is-active", "is-in", "is-hidden");
      sc.cards.forEach((card) => {
        card.el.classList.remove("is-front");
        touched.push(card.el);
      });
      touched.push(sc.el, sc.inner, sc.ring);
    }
    touched.filter(Boolean).forEach((el) => el.removeAttribute("style"));
  };
}

export function useJourney(ref) {
  // Layout effect: the stage must switch to 3D before the first paint, or the stacked fallback flashes.
  useLayoutEffect(() => {
    const section = ref.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    return initJourney(section);
  }, [ref]);
}
