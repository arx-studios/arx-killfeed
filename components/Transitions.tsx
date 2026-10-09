"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./SiteNav";
import { sfx } from "./Sound";

declare global {
  interface Window {
    __kfLoaderUntil?: number;
    __kfLeaving?: boolean;
  }
}

const LOADER_MS = 2600;
let loaderWanted = false;
if (typeof window !== "undefined" && !window.__kfLoaderUntil) {
  // first paint of this tab only: page intros wait for the loader to split open
  loaderWanted = true;
  window.__kfLoaderUntil = performance.now() + LOADER_MS + 500;
}

/** Seconds a page's intro should wait: the curtain on navigation, the loader on first load. */
export function introDelay() {
  if (typeof window === "undefined") return 1.05;
  const left = ((window.__kfLoaderUntil ?? 0) - performance.now()) / 1000;
  return Math.max(1.05, left + 0.15);
}

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Opening loader: counts to 100, then the screen splits open. */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(true);
  useIso(() => {
    if (!loaderWanted) {
      setShow(false);
      return;
    }
    const el = root.current!;
    const ctx = gsap.context(() => {
    const q = gsap.utils.selector(el);
    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => setShow(false) });
    tl.from(q(".ld-logo"), { yPercent: 120, duration: 0.8, ease: "expo.out" })
      .to(counter, {
        v: 100,
        duration: LOADER_MS / 1000 - 1,
        ease: "power2.inOut",
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
        },
      }, 0.1)
      .to(q(".ld-bar i"), { scaleX: 1, duration: LOADER_MS / 1000 - 1, ease: "power2.inOut" }, 0.1)
      .to(q(".ld-num, .ld-logo, .ld-meta"), { yPercent: -120, duration: 0.6, ease: "expo.in", stagger: 0.04 })
      .to(q(".ld-half--top"), { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.15")
      .to(q(".ld-half--bottom"), { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<");
    }, el);
    return () => ctx.revert();
  }, []);
  if (!show) return null;
  return (
    <div ref={root} className="loader" aria-hidden="true">
      <div className="ld-half ld-half--top" />
      <div className="ld-half ld-half--bottom" />
      <div className="ld-inner">
        <div className="ld-mask"><div className="ld-logo"><Logo /></div></div>
        <div className="ld-mask ld-meta-wrap"><span className="ld-meta">Loading the field manual</span></div>
        <div className="ld-mask ld-num-wrap"><span ref={num} className="ld-num">000</span></div>
        <div className="ld-bar"><i /></div>
      </div>
    </div>
  );
}

/** Exit transition: internal link clicks cover the page with a lime sweep, then navigate. */
export function ExitCover() {
  const router = useRouter();
  const path = usePathname();
  const cover = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      if (window.__kfLeaving) return;
      window.__kfLeaving = true;
      sfx.whoosh();
      gsap.fromTo(
        cover.current,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.7,
          ease: "expo.inOut",
          onComplete: () => router.push(url.pathname + url.search + url.hash),
        }
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);
  // the incoming page's curtain takes over; drop the cover once it has painted
  useEffect(() => {
    window.__kfLeaving = false;
    const t = setTimeout(() => gsap.set(cover.current, { clipPath: "inset(100% 0% 0% 0%)" }), 120);
    return () => clearTimeout(t);
  }, [path]);
  return <div ref={cover} className="exit-cover" aria-hidden="true" />;
}
