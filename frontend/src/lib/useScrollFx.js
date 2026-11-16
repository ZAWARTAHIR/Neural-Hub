import { useEffect } from "react";

// Small scroll helpers for the parts of the landing page outside the 3D journey (see lib/journey.js).
// They only set a class or a CSS variable; the motion itself lives in styles/home-fx.css.
//
//   data-reveal          gains .is-in the first time it scrolls into view.
//   data-scroll="enter"  --p: 0 when the element's top reaches the viewport bottom,
//                        1 when it reaches data-scroll-end (fraction of the viewport, default 0.2).
//
// Nothing runs when the visitor prefers reduced motion; the CSS falls back to the static layout.

const clamp = (v) => Math.min(1, Math.max(0, v));

export function useScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const root = document.documentElement;
    root.classList.add("fx-ready");
    const enterEls = [...document.querySelectorAll('[data-scroll="enter"]')];
    let frame = 0;

    function update() {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of enterEls) {
        const end = vh * parseFloat(el.dataset.scrollEnd || "0.2");
        const p = clamp((vh - el.getBoundingClientRect().top) / (vh - end));
        el.style.setProperty("--p", p.toFixed(4));
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      io.disconnect();
      root.classList.remove("fx-ready");
      enterEls.forEach((el) => el.style.removeProperty("--p"));
    };
  }, []);
}
