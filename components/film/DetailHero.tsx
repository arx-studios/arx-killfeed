"use client";
import Link from "next/link";
import { useRef } from "react";
import { Chars, gsap, useFilm } from "./core";
import { introDelay } from "../Transitions";

type Props = {
  variant: "agent" | "weapon" | "map";
  name: string;
  eyebrow: string;
  image: string;
  bg?: string;
  back: { href: string; label: string };
  facts?: { label: string; value: string }[];
  icon?: string;
};

/** Detail-page opening: giant outlined name behind the subject, the subject rises in, the shot pushes on scroll. */
export default function DetailHero({ variant, name, eyebrow, image, bg, back, facts = [], icon }: Props) {
  const root = useRef<HTMLElement>(null);
  useFilm(root, (q) => {
    const intro = gsap.timeline({ delay: introDelay() });
    intro
      .from(q(".dh-name .ch"), { yPercent: 130, duration: 1.3, ease: "expo.out", stagger: 0.045 })
      .from(q(".dh-ghost"), { opacity: 0, duration: 2, ease: "power2.out" }, 0)
      .from(q(".dh-subject-wrap"), variant === "weapon" ? { xPercent: 40, rotate: -8, opacity: 0, duration: 1.6, ease: "expo.out" } : { yPercent: 12, opacity: 0, scale: 1.08, duration: 1.8, ease: "expo.out" }, 0.1)
      .from(q(".dh-side > *"), { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.07 }, 0.4);

    gsap
      .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=100%", scrub: true, pin: true } })
      .to(q(".dh-ghost"), { xPercent: -25, ease: "none" }, 0)
      .to(q(".dh-subject"), variant === "map" ? { scale: 1.15, ease: "none" } : variant === "weapon" ? { xPercent: -12, rotate: 4, scale: 1.08, ease: "none" } : { yPercent: -8, scale: 1.08, ease: "none" }, 0)
      .to(q(".dh-name"), { yPercent: -20, ease: "none" }, 0)
      .to(q(".dh-side"), { opacity: 0, y: -60, ease: "none" }, 0.3);
  });

  return (
    <section ref={root} className={`detail-hero dh--${variant}`} data-fx-off>
      {bg && <img className="dh-bg" src={bg} alt="" />}
      <div className="dh-ghost" aria-hidden="true">{name}</div>
      <div className="dh-subject-wrap">
        <img className="dh-subject" src={image} alt={name} data-distort />
      </div>
      <div className="wrap dh-inner">
        <Link href={back.href} className="crumb dh-back" data-cursor="Back">← {back.label}</Link>
        <div className="dh-side">
          <div className="eyebrow">
            {icon && <img src={icon} alt="" className="dh-icon" />}
            {eyebrow}
          </div>
          {facts.map((f) => (
            <div key={f.label} className="dh-fact">
              <span>{f.label}</span>
              <b>{f.value}</b>
            </div>
          ))}
        </div>
        <h1 className="dh-name">
          <Chars text={name} />
        </h1>
      </div>
    </section>
  );
}
