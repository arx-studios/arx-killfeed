"use client";
import Link from "next/link";
import { useRef } from "react";
import { Chars, gsap, useFilm } from "./core";

/** End card: the next item's name scales up out of the floor; the image reveals on hover. */
export default function NextUp({ href, label, name, image, fit = "cover" }: { href: string; label: string; name: string; image?: string; fit?: "cover" | "contain" }) {
  const root = useRef<HTMLElement>(null);
  useFilm(root, (q) => {
    gsap
      .timeline({ scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 25%", scrub: 0.6 } })
      .from(q(".nu-name .ch"), { yPercent: 120, stagger: 0.04, ease: "expo.out" }, 0)
      .from(q(".nu-rule"), { scaleX: 0, transformOrigin: "0 50%", ease: "none" }, 0);
  });
  return (
    <section ref={root} className="next-up" data-fx-off>
      <Link href={href} className="wrap nu-link" data-cursor="Next">
        <div className="nu-rule" />
        <div className="nu-top">
          <span className="eyebrow">{label}</span>
          <span className="nu-arrow" aria-hidden>→</span>
        </div>
        <div className="nu-name">
          <Chars text={name} />
        </div>
        {image && (
          <div className={`nu-img nu-img--${fit}`} aria-hidden>
            <img src={image} alt="" />
          </div>
        )}
      </Link>
    </section>
  );
}
