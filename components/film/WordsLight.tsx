"use client";
import { useRef } from "react";
import { Words, gsap, useFilm } from "./core";

/** Pinned paragraph whose words light up as you scroll. */
export default function WordsLight({ eyebrow, text, accent }: { eyebrow?: string; text: string; accent?: string[] }) {
  const root = useRef<HTMLElement>(null);
  useFilm(root, (q) => {
    gsap
      .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=110%", scrub: 0.6, pin: true } })
      .fromTo(q(".w"), { opacity: 0.1 }, { opacity: 1, stagger: 0.1, ease: "none" });
  });
  return (
    <section ref={root} className="words-light" data-fx-off>
      <div className="wrap">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <p className="wl-text">
          <Words text={text} accent={accent} />
        </p>
      </div>
    </section>
  );
}
