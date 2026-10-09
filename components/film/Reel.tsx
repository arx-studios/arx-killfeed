"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, pad, useFilm } from "./core";

export type ReelItem = { href: string; title: string; meta?: string; sub?: string; image: string; bg?: string };

/** Pinned horizontal reel. variant: "portrait" (agents), "wide" (weapons), "icon" (modes/tiers). */
export default function Reel({ items, variant = "portrait", label }: { items: ReelItem[]; variant?: "portrait" | "wide" | "icon"; label?: string }) {
  const root = useRef<HTMLElement>(null);
  useFilm(root, (q) => {
    const track = q(".reel-track")[0];
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 60);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current,
        start: "top top",
        end: () => "+=" + Math.max(dist(), window.innerHeight * 0.4),
        scrub: 0.8,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (s) => {
          const n = q(".reel-count b")[0];
          if (n) n.textContent = pad(Math.min(items.length, Math.floor(s.progress * items.length) + 1));
        },
      },
    });
    tl.to(track, { x: () => -dist(), ease: "none" }, 0).to(q(".reel-bar i"), { scaleX: 1, ease: "none" }, 0);
    q(".reel-card").forEach((card) => {
      const img = card.querySelector(".rc-img");
      if (img)
        gsap.fromTo(
          img,
          { xPercent: variant === "portrait" ? 14 : 6 },
          { xPercent: variant === "portrait" ? -14 : -6, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tl, start: "left right", end: "right left", scrub: true } }
        );
    });
    gsap.from(q(".reel-card"), { yPercent: 18, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.07, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
  });

  return (
    <section ref={root} className={`reel reel--${variant}`} data-fx-off>
      <div className="wrap reel-head">
        <div className="eyebrow">{label ?? "Drag the page"}</div>
        <div className="reel-count">
          <b>01</b> / {pad(items.length)}
          <div className="reel-bar"><i /></div>
        </div>
      </div>
      <div className="reel-track">
        {items.map((it, i) => (
          <Link key={`${it.href}-${i}`} href={it.href} className="reel-card" data-cursor="View">
            {it.bg && <img className="rc-bg" src={it.bg} alt="" />}
            <img className="rc-img" src={it.image} alt={it.title} data-distort />
            <div className="rc-meta">
              <span>{pad(i + 1)}</span>
              {it.meta && <span>{it.meta}</span>}
            </div>
            <div className="rc-foot">
              <div className="rc-title" style={{ ["--fit" as any]: Math.min(1, (variant === "icon" ? 12 : 7) / Math.max(1, it.title.length)) }}>{it.title}</div>
              {it.sub && <p>{it.sub}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
