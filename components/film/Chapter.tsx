"use client";
import { useRef } from "react";
import { Chars, Words, gsap, pad, useFilm } from "./core";

type Props = { id?: string; index: number; eyebrow?: string; title: string; text?: string; accent?: string[]; icon?: string; meta?: string };

/** Chapter card between sections: pinned, the title rises, the paragraph lights word by word, a giant index drifts behind. */
export default function Chapter({ id, index, eyebrow, title, text, accent, icon, meta }: Props) {
  const root = useRef<HTMLElement>(null);
  useFilm(root, (q) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: text ? "+=110%" : "+=60%", scrub: 0.6, pin: true } });
    tl.from(q(".ch-title .ch"), { yPercent: 130, stagger: 0.04, duration: 0.6, ease: "expo.out" }, 0)
      .from(q(".ch-icon"), { scale: 0.4, rotate: -40, opacity: 0, duration: 0.6, ease: "expo.out" }, 0)
      .fromTo(q(".ch-index"), { xPercent: 12 }, { xPercent: -12, duration: 2, ease: "none" }, 0);
    if (text) tl.fromTo(q(".ch-text .w"), { opacity: 0.1 }, { opacity: 1, stagger: 0.05, duration: 0.3, ease: "none" }, 0.4);
  });
  return (
    <section ref={root} id={id} className="chapter" data-fx-off>
      <div className="ch-index" aria-hidden="true">{pad(index)}</div>
      <div className="wrap ch-inner">
        <div className="ch-head">
          {icon && <img className="ch-icon" src={icon} alt="" />}
          <div>
            <div className="eyebrow">{eyebrow ?? `Chapter ${pad(index)}`}</div>
            <h2 className="ch-title"><Chars text={title} /></h2>
          </div>
        </div>
        {text && (
          <p className="ch-text">
            <Words text={text} accent={accent} />
          </p>
        )}
        {meta && <div className="ch-meta">{meta}</div>}
      </div>
    </section>
  );
}
