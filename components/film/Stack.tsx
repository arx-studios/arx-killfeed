"use client";
import Link from "next/link";
import { useRef } from "react";
import { ScrollTrigger, gsap, pad, useFilm } from "./core";

export type StackItem = { key: string; href?: string; image?: string; title: string; kicker?: string; sub?: string; body?: string; icon?: string };

/**
 * Sticky stacking cards. variant "image": full-bleed photo cards (maps).
 * variant "panel": text cards with a big icon (abilities).
 */
export default function Stack({ items, variant = "image" }: { items: StackItem[]; variant?: "image" | "panel" }) {
  const root = useRef<HTMLDivElement>(null);
  useFilm(root, (q) => {
    const cards = q(".stack-card");
    // measured live from the next card: ScrollTrigger mis-measures sticky triggers
    const sink = () => {
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const k = gsap.utils.clamp(0, 1, (vh - next.getBoundingClientRect().top) / (vh * 0.85));
        gsap.set(card.querySelector(".sc-inner"), { scale: 1 - 0.07 * k, y: -28 * k, filter: `brightness(${1 - 0.75 * k})` });
      });
    };
    ScrollTrigger.create({ trigger: root.current, start: "top bottom", end: "bottom top", onUpdate: sink, onRefresh: sink });
    q(".sc-img").forEach((img) =>
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img.closest(".stack-card"), start: "top bottom", end: "bottom top", scrub: true } })
    );
    q(".stack-card").forEach((card) =>
      gsap.from(card.querySelectorAll(".sc-title .ch, .sc-anim"), {
        yPercent: 120, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.03,
        scrollTrigger: { trigger: card, start: "top 70%", once: true },
      })
    );
  });

  return (
    <div ref={root} className={`stack stack--${variant}`} data-fx-off>
      {items.map((it, i) => {
        const inner = (
          <div className="sc-inner">
            {it.image && <img className="sc-img" src={it.image} alt="" data-distort />}
            {variant === "panel" &&
              (it.icon ? (
                <img className="sc-icon sc-anim" src={it.icon} alt="" />
              ) : (
                // no icon in the game data (e.g. some passives): keep the column with a big outlined index
                <span className="sc-icon sc-glyph sc-anim" aria-hidden>{pad(i + 1)}</span>
              ))}
            <div className="sc-info">
              <span className="sc-anim sc-kicker">{pad(i + 1)}{it.kicker ? ` · ${it.kicker}` : ""}</span>
              <h3 className="sc-title">
                {it.title.split("").map((c, k) => (
                  <span key={k} className="mask"><span className="ch">{c === " " ? " " : c}</span></span>
                ))}
              </h3>
              {it.body && <p className="sc-anim">{it.body}</p>}
              {it.sub && <span className="sc-anim sc-sub">{it.sub}</span>}
            </div>
          </div>
        );
        const style = { top: variant === "image" ? "9vh" : "14vh" };
        return it.href ? (
          <Link key={it.key} href={it.href} className="stack-card" style={style} data-cursor="Explore">{inner}</Link>
        ) : (
          <div key={it.key} className="stack-card" style={style}>{inner}</div>
        );
      })}
    </div>
  );
}
