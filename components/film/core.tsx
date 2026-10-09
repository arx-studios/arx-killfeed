"use client";
import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./film2.css";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Re-measure every trigger in document order. Pins push everything below them down, so a pin
 * must be measured after every pin above it; components mount child-first, which breaks that.
 */
let queued = 0;
export function orderedRefresh() {
  if (typeof window === "undefined") return;
  cancelAnimationFrame(queued);
  queued = requestAnimationFrame(() => {
    ScrollTrigger.sort((a, b) => {
      const ea = a.trigger as Element | undefined;
      const eb = b.trigger as Element | undefined;
      if (!ea || !eb) return ea ? 1 : eb ? -1 : 0;
      if (ea === eb) return 0;
      return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    ScrollTrigger.refresh();
  });
}

/** Runs a GSAP setup scoped to `root`, reverted on unmount; refreshes triggers once images settle. */
export function useFilm(root: React.RefObject<HTMLElement | null>, setup: (q: (s: string) => HTMLElement[]) => void, deps: unknown[] = []) {
  useIso(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => setup(gsap.utils.selector(root) as (s: string) => HTMLElement[]), root);
    orderedRefresh();
    const t = setTimeout(orderedRefresh, 700);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Text split into masked characters; animate `.ch`. */
export const Chars = ({ text, className = "" }: { text: string; className?: string }) => (
  <span className={className} aria-label={text}>
    {text.split("").map((c, i) => (
      <span key={i} className="mask" aria-hidden="true">
        <span className="ch">{c === " " ? " " : c}</span>
      </span>
    ))}
  </span>
);

/** Words for scroll-lit paragraphs; animate `.w`. */
export const Words = ({ text, accent = [] }: { text: string; accent?: string[] }) => {
  const hl = new Set(accent.map((a) => a.toLowerCase()));
  return (
    <>
      {text.split(/\s+/).map((w, i) => (
        <span key={i} className={`w${hl.has(w.toLowerCase().replace(/[^a-z0-9]/g, "")) ? " hl" : ""}`}>
          {w}{" "}
        </span>
      ))}
    </>
  );
};

export const pad = (n: number) => String(n).padStart(2, "0");
