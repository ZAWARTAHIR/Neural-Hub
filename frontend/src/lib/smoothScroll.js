import { useEffect } from "react";

// Inertia scrolling for mouse wheels and trackpads on desktop (the effect sites usually get from Lenis).
// A wheel "click" jumps the page ~100px at once; here each wheel event moves a target instead, and the page
// eases towards it every frame. Touch screens keep their native momentum scrolling, and keyboard, scrollbar
// and find-in-page jumps stay native — the scroller simply picks up from wherever they leave the page.

const EASE_TIME = 0.1; // seconds; larger is floatier

let active = null; // the running scroller, so other modules can glide to a position

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Let a wheel event scroll an inner scrollable box (a menu, a code block) instead of the page.
function scrollsInside(node, deltaY) {
  for (let el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.scrollHeight <= el.clientHeight + 1) continue;
    const overflow = getComputedStyle(el).overflowY;
    if (overflow !== "auto" && overflow !== "scroll") continue;
    if (deltaY < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
  }
  return false;
}

/** Glide to a page offset: eased when inertia scrolling is running, native smooth scroll otherwise. */
export function smoothScrollTo(top) {
  if (active) active.to(top);
  else window.scrollTo({ top, behavior: "smooth" });
}

export function useSmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || touch) return undefined;

    let target = window.scrollY;
    let current = target;
    let written = target;
    let frame = 0;
    let last = 0;

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Something else moved the page mid-glide (scrollbar drag, keyboard): hand control back to it.
      if (Math.abs(window.scrollY - written) > 3) {
        target = current = window.scrollY;
        frame = 0;
        return;
      }

      current += (target - current) * (1 - Math.exp(-dt / EASE_TIME));
      if (Math.abs(target - current) < 0.3) current = target;
      // "instant": the site sets scroll-behavior: smooth, which would otherwise turn every frame into its own animation.
      window.scrollTo({ top: current, behavior: "instant" });
      written = window.scrollY;
      frame = current === target ? 0 : requestAnimationFrame(tick);
    }

    function glide(to) {
      target = clamp(to, 0, maxScroll());
      if (!frame) {
        current = written = window.scrollY;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    function onWheel(event) {
      if (event.ctrlKey || event.defaultPrevented) return; // ctrl + wheel is browser zoom
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (scrollsInside(event.target, event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1;
      const from = frame ? target : window.scrollY;
      glide(from + event.deltaY * unit);
    }

    active = { to: glide };
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      active = null;
    };
  }, []);
}
