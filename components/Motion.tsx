"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { attachDistort, webglOK } from "./webgl";
import { orderedRefresh } from "./film/core";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Split a heading's text into masked words. Skips anything with element children. */
function splitWords(el: HTMLElement) {
  if (el.dataset.split === "done" || el.children.length) return null;
  const words = (el.textContent ?? "").trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="mask"><span>${w}</span></span>`).join(" ");
  el.dataset.split = "done";
  return el.querySelectorAll<HTMLElement>(".mask > span");
}

const BLOCKS = [
  ".card", ".item", ".ability", ".mode", ".div", ".agent-card", ".tile", ".panel", ".kv > div",
  ".stat-row", ".group-head p", ".lede", ".eyebrow", ".chips", ".role-line", ".plot", ".folder-slot",
  ".legend", ".region", "tbody tr", ".side-index", ".browse-menu", ".gallery",
].map((s) => `main ${s}:not([data-fx-off] *)`).join(",");

/** Smooth scroll + scroll-driven reveals, re-applied on every route. */
export function MotionRoot() {
  const path = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // one Lenis for the app, driven by GSAP's ticker so ScrollTrigger stays in sync
  useEffect(() => {
    // reduced motion: native scrolling, triggers still work
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 });
    lenisRef.current = lenis;
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const bar = document.querySelector<HTMLElement>(".progress");
    const st = bar
      ? ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }) })
      : null;
    return () => {
      st?.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // per-route reveals
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    const main = document.querySelector("main");
    if (!main) return;
    const ctx = gsap.context(() => {
      // display type: masked word rise
      main.querySelectorAll<HTMLElement>("h1, h2").forEach((h) => {
        if (h.closest("[data-fx-off]")) return;
        const words = splitWords(h);
        if (!words) return;
        gsap.from(words, {
          yPercent: 140,
          rotate: 3,
          duration: 1.25,
          ease: "expo.out",
          stagger: 0.07,
          delay: h.tagName === "H1" ? 0.55 : 0,
          scrollTrigger: { trigger: h, start: "top 90%", once: true },
        });
      });

      // images: clip open from the bottom while the picture settles
      main.querySelectorAll<HTMLElement>(".card .art, .map-hero, .agent-hero .portrait, .weapon-hero").forEach((el) => {
        if (el.closest("[data-fx-off]")) return;
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } }
        );
      });

      // blocks: rise in batches
      const blocks = gsap.utils.toArray<HTMLElement>(BLOCKS);
      gsap.set(blocks, { y: 50, opacity: 0 });
      ScrollTrigger.batch(blocks, {
        start: "top 94%",
        once: true,
        onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.07, overwrite: true }),
      });

      // parallax
      main.querySelectorAll<HTMLElement>(".map-hero img").forEach((img) =>
        gsap.fromTo(img, { yPercent: -12 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } })
      );
      main.querySelectorAll<HTMLElement>(".agent-hero .portrait img.fg").forEach((img) =>
        gsap.fromTo(img, { yPercent: 4 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } })
      );
      main.querySelectorAll<HTMLElement>(".weapon-hero img").forEach((img) =>
        gsap.fromTo(img, { xPercent: -8, rotate: -2 }, { xPercent: 8, rotate: 1, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } })
      );
    }, main);

    // WebGL hover distortion on marked images (pointer devices only)
    const unhook: (() => void)[] = [];
    if (window.matchMedia("(hover: hover)").matches && webglOK()) {
      main.querySelectorAll<HTMLImageElement>("img[data-distort]").forEach((img) => unhook.push(attachDistort(img)));
    }

    // images arriving late change layout; keep trigger positions honest
    const refresh = orderedRefresh;
    const t1 = setTimeout(refresh, 400);
    const t2 = setTimeout(refresh, 1500);
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
      unhook.forEach((u) => u());
      ctx.revert();
    };
  }, [path]);

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </>
  );
}

/** Difference-blended dot that grows over anything clickable; data-cursor="Label" shows a word. */
function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "expo.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "expo.out" });
    // magnetic pull for buttons: they lean toward the cursor and spring back
    let mag: HTMLElement | null = null;
    const release = (m: HTMLElement) => gsap.to(m, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const t = (e.target as HTMLElement)?.closest?.("a, button, [data-cursor]") as HTMLElement | null;
      el.classList.toggle("is-hover", !!t);
      if (label.current) label.current.textContent = t?.dataset.cursor ?? "";
      const m = (e.target as HTMLElement)?.closest?.(".btn, .nav-menu, .nav-sound, [data-magnetic]") as HTMLElement | null;
      if (mag && mag !== m) release(mag);
      mag = m;
      if (m) {
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.35, y: (e.clientY - (r.top + r.height / 2)) * 0.45, duration: 0.6, ease: "expo.out" });
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <div className="cursor-dot" />
      <span ref={label} className="cursor-label" />
    </div>
  );
}
