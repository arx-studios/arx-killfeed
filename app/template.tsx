"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Remounts on every navigation: a lime curtain carrying the page name lifts off the new page. */
export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const curtain = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const name = path === "/" ? "Killfeed" : path.split("/").filter(Boolean).pop()!.replace(/-/g, " ");

  useEffect(() => {
    // the first load is covered by the loader instead
    if ((window.__kfLoaderUntil ?? 0) > performance.now()) {
      gsap.set(curtain.current, { clipPath: "inset(0% 0% 100% 0%)" });
      return;
    }
    const tl = gsap.timeline();
    tl.fromTo(word.current, { yPercent: 120 }, { yPercent: 0, duration: 0.5, ease: "expo.out" })
      .to(word.current, { yPercent: -120, duration: 0.4, ease: "expo.in" }, "+=0.1")
      .fromTo(curtain.current, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "expo.inOut" }, "-=0.2");
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <div ref={curtain} className="curtain" aria-hidden="true">
        <div style={{ overflow: "hidden" }}>
          <span ref={word} style={{ display: "inline-block" }}>{name}</span>
        </div>
      </div>
      {children}
    </>
  );
}
