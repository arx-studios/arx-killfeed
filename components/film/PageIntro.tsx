"use client";
import { useRef } from "react";
import { Chars, gsap, pad, useFilm } from "./core";
import { introDelay } from "../Transitions";

type Props = {
  eyebrow: string;
  title: string;
  sub?: string;
  count?: number;
  countLabel?: string;
  image?: string;
  chapters?: { id: string; label: string }[];
};

/** Smooth-scrolls to a section id (Lenis when present). */
export function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/** Opening shot of a list page: the title rises after the curtain, then the shot pushes away on scroll. */
export default function PageIntro({ eyebrow, title, sub, count, countLabel, image, chapters }: Props) {
  const root = useRef<HTMLElement>(null);
  useFilm(root, (q) => {
    gsap
      .timeline({ delay: introDelay() })
      .from(q(".pi-title .ch"), { yPercent: 130, duration: 1.3, ease: "expo.out", stagger: 0.05 })
      .from(q(".pi-bg"), { scale: 1.25, opacity: 0, duration: 2.2, ease: "expo.out" }, 0)
      .from(q(".pi-meta > *, .pi-chapters a"), { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06 }, 0.35);

    gsap
      .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
      .to(q(".pi-title"), { yPercent: -35, scale: 0.88, transformOrigin: "0% 100%", ease: "none" }, 0)
      .to(q(".pi-bg"), { yPercent: 20, opacity: 0.1, ease: "none" }, 0)
      .to(q(".pi-meta, .pi-chapters"), { y: -60, opacity: 0, ease: "none" }, 0);
  });

  return (
    <section ref={root} className="page-intro" data-fx-off>
      {image && <img className="pi-bg" src={image} alt="" />}
      <div className="wrap pi-inner">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="pi-title">
          <Chars text={title} />
        </h1>
        <div className="pi-meta">
          {sub && <p>{sub}</p>}
          {count != null && (
            <div className="pi-count">
              <b>{pad(count)}</b>
              <span>{countLabel}</span>
            </div>
          )}
        </div>
        {chapters && (
          <nav className="pi-chapters" aria-label="Chapters">
            {chapters.map((c, i) => (
              <a key={c.id} href={`#${c.id}`} data-cursor="Jump" onClick={(e) => { e.preventDefault(); jump(c.id); }}>
                <small>{pad(i + 1)}</small>
                <span>{c.label}</span>
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
