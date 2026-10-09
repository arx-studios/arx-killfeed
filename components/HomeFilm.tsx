"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountUp from "./rb/CountUp";
import Stage from "./film/Stage";
import { orderedRefresh } from "./film/core";
import { introDelay } from "./Transitions";
import "./film.css";

gsap.registerPlugin(ScrollTrigger);

export type FilmAgent = { name: string; slug: string; role: string; portrait: string; background?: string; icon: string };
export type FilmWeapon = { name: string; slug: string; cls: string; image: string; fireRate: number; magazine: number; run: number; reload: number; head: number };
export type FilmMap = { name: string; slug: string; splash: string; layout: string; callouts: number };
export type FilmRank = { name: string; icon: string; color: string };
export type FilmProps = {
  agents: FilmAgent[];
  weapons: FilmWeapon[];
  maps: FilmMap[];
  ranks: FilmRank[];
  counts: { label: string; value: number }[];
  hero: string;
  version?: string;
  previews: Record<string, string>;
};

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* Splits text into masked chars/words for the hero and manifesto. */
const Chars = ({ text, className = "" }: { text: string; className?: string }) => (
  <span className={className} aria-label={text}>
    {text.split("").map((c, i) => (
      <span key={i} className="mask" aria-hidden="true">
        <span className="ch">{c === " " ? " " : c}</span>
      </span>
    ))}
  </span>
);

export default function HomeFilm(p: FilmProps) {
  const root = useRef<HTMLDivElement>(null);

  useIso(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      /* ── 01 HERO: title rises letter by letter after the curtain, then the shot pushes in on scroll */
      const intro = gsap.timeline({ delay: introDelay() + 0.1 });
      intro
        .from(q(".hero-title .ch"), { yPercent: 130, duration: 1.3, ease: "expo.out", stagger: 0.045 })
        .from(q(".hero-portrait"), { clipPath: "inset(100% 0% 0% 0%)", duration: 1.5, ease: "expo.out" }, 0.1)
        .from(q(".hero-portrait img"), { scale: 1.25, duration: 2, ease: "expo.out" }, 0.1)
        .from(q(".hero-meta > *, .hero-side > *"), { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.5)
        .from(q(".hero-ticker"), { yPercent: 100, duration: 1, ease: "expo.out" }, 0.7);

      gsap.timeline({ scrollTrigger: { trigger: q(".s-hero")[0], start: "top top", end: "+=90%", scrub: true, pin: true } })
        .to(q(".hero-title"), { yPercent: -18, scale: 0.86, transformOrigin: "0% 100%", ease: "none" }, 0)
        .to(q(".hero-portrait img"), { scale: 1.18, yPercent: -6, ease: "none" }, 0)
        .fromTo(q(".hero-portrait"), { filter: "brightness(1)" }, { filter: "brightness(0.35)", ease: "none" }, 0)
        .to(q(".hero-side"), { y: -80, opacity: 0, ease: "none" }, 0);

      /* ── 02 MANIFESTO: words light up as you read */
      gsap.timeline({ scrollTrigger: { trigger: q(".s-manifesto")[0], start: "top top", end: "+=160%", scrub: 0.6, pin: true } })
        .fromTo(q(".manifesto .w"), { opacity: 0.12 }, { opacity: 1, stagger: 0.12, ease: "none" });

      /* ── 03 ROSTER: horizontal track */
      const track = q(".roster-track")[0] as HTMLElement;
      const dist = () => track.scrollWidth - window.innerWidth + 80;
      const rosterTl = gsap.timeline({
        scrollTrigger: {
          trigger: q(".s-roster")[0],
          start: "top top",
          end: () => "+=" + dist(),
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            const n = q(".roster-count b")[0];
            if (n) n.textContent = String(Math.min(p.agents.length, Math.floor(s.progress * p.agents.length) + 1)).padStart(2, "0");
          },
        },
      });
      rosterTl.to(track, { x: () => -dist(), ease: "none" }, 0).to(q(".roster-bar i"), { scaleX: 1, ease: "none" }, 0);
      q(".agent-panel").forEach((panel: HTMLElement) => {
        gsap.fromTo(
          panel.querySelector(".ap-portrait"),
          { xPercent: 18 },
          { xPercent: -18, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: rosterTl, start: "left right", end: "right left", scrub: true } }
        );
        gsap.fromTo(
          panel.querySelector(".ap-name"),
          { xPercent: -10 },
          { xPercent: 10, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: rosterTl, start: "left right", end: "right left", scrub: true } }
        );
      });

      /* ── 05 MAPS: sticky stack, each card sinks as the next one covers it */
      // measured live from the next card's position: ScrollTrigger mis-measures sticky triggers
      const cards = q(".map-card") as HTMLElement[];
      const sink = () => {
        const vh = window.innerHeight;
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const k = gsap.utils.clamp(0, 1, (vh - next.getBoundingClientRect().top) / (vh * 0.85));
          gsap.set(card.querySelector(".mc-inner"), { scale: 1 - 0.08 * k, y: -28 * k, filter: `brightness(${1 - 0.75 * k})` });
        });
      };
      ScrollTrigger.create({ trigger: q(".map-stack")[0], start: "top bottom", end: "bottom top", onUpdate: sink, onRefresh: sink });
      q(".map-card .mc-img").forEach((img: HTMLElement) =>
        gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img.closest(".map-card"), start: "top bottom", end: "bottom top", scrub: true } })
      );

      /* ── 06 NUMBERS: rule lines draw across, labels rise */
      gsap.from(q(".num"), {
        y: 60, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: q(".s-numbers")[0], start: "top 75%", once: true },
      });
      gsap.from(q(".num-rule"), {
        scaleX: 0, transformOrigin: "0 50%", duration: 1.4, ease: "expo.inOut",
        scrollTrigger: { trigger: q(".s-numbers")[0], start: "top 80%", once: true },
      });

      /* ── 07 RANKS: climb the stairs */
      const climb = gsap.timeline({ scrollTrigger: { trigger: q(".s-ranks")[0], start: "top top", end: "+=180%", scrub: 0.6, pin: true } });
      climb.from(q(".step"), { yPercent: 60, opacity: 0, scale: 0.7, ease: "expo.out", stagger: 1, duration: 1 }, 0);
      // the line reaches each step as it lands: steps start 1 apart, so draw n-1 units from 0.5
      climb.fromTo(q(".stairs-svg"), { clipPath: "inset(-10% 100% -10% 0%)" }, { clipPath: "inset(-10% 0% -10% 0%)", ease: "none", duration: p.ranks.length - 1 }, 0.5);

      /* ── shared: section titles rise through their masks */
      q(".film-title").forEach((t: HTMLElement) =>
        gsap.from(t.querySelectorAll(".ch"), {
          yPercent: 130, duration: 1.2, ease: "expo.out", stagger: 0.025,
          scrollTrigger: { trigger: t, start: "top 85%", once: true },
        })
      );

      /* ── 08 OUTRO marquee speed follows scroll velocity */
      const marquee = q(".outro-marquee .mq-row");
      gsap.to(marquee, { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
    }, root);

    const r = setTimeout(orderedRefresh, 600);
    return () => {
      clearTimeout(r);
      ctx.revert();
    };
  }, []);

  /* outro rows: floating preview that follows the pointer */
  const preview = useRef<HTMLDivElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "expo.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // the stair line is drawn in real pixels so its stroke and dash stay true
  const stairsRef = useRef<HTMLDivElement>(null);
  const [stairs, setStairs] = useState({ w: 1000, h: 400 });
  useEffect(() => {
    const el = stairsRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStairs({ w: el.clientWidth || 1000, h: el.clientHeight || 400 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const manifesto =
    `${p.counts[0].value} agents. ${p.counts[2].value} weapons. ${p.counts[3].value} maps. Every ability, every stat and every callout, pulled from the game data and laid out like a field manual.`.split(" ");
  const accentWords = new Set(["agents.", "weapons.", "maps.", "field", "manual."]);

  return (
    <div ref={root} className="film" data-fx-off>
      {/* 01 HERO */}
      <section className="s-hero">
        <div className="hero-portrait">
          <img src={p.hero} alt="" data-distort />
        </div>
        <div className="wrap hero-grid">
          <div className="hero-meta">
            <span>Valorant field manual</span>
            <span>{p.version ? `Patch ${p.version.split(".").slice(0, 2).join(".")}` : "Live data"}</span>
            <span>Scroll</span>
          </div>
          <div className="hero-side">
            <p>Agents, weapons, maps and ranks. Every number straight from the game files, rebuilt as one fast reference.</p>
            <Link href="/agents" className="btn" data-cursor="Go">
              Open the roster <span aria-hidden>→</span>
            </Link>
          </div>
          <h1 className="hero-title">
            <Chars text="Valorant" className="ht-line ht-small" />
            <Chars text="Killfeed" className="ht-line" />
          </h1>
        </div>
        <div className="hero-ticker" aria-hidden="true">
          <div className="mq-row">
            {[0, 1].map((k) => (
              <span key={k}>
                {p.agents.map((a) => (
                  <em key={a.slug + k}>{a.name}</em>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 02 MANIFESTO */}
      <section className="s-manifesto">
        <div className="wrap">
          <div className="eyebrow">01 / What this is</div>
          <p className="manifesto">
            {manifesto.map((word, i) => (
              <span key={i} className={`w${accentWords.has(word) ? " hl" : ""}`}>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 03 ROSTER */}
      <section className="s-roster">
        <div className="wrap roster-head">
          <div>
            <div className="eyebrow">02 / The roster</div>
            <h2 className="film-title"><Chars text="Meet the agents" /></h2>
          </div>
          <div className="roster-count">
            <b>01</b> / {String(p.agents.length).padStart(2, "0")}
            <div className="roster-bar"><i /></div>
          </div>
        </div>
        <div className="roster-track">
          {p.agents.map((a, i) => (
            <Link key={a.slug} href={`/agents/${a.slug}`} className="agent-panel" data-cursor="View">
              {a.background && <img className="ap-bg" src={a.background} alt="" />}
              <img className="ap-portrait" src={a.portrait} alt={a.name} data-distort />
              <div className="ap-meta">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{a.role}</span>
              </div>
              <div className="ap-name">{a.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 04 ARSENAL */}
      <Stage
        eyebrow="03 / The arsenal"
        items={p.weapons.map((x) => ({
          href: `/weapons/${x.slug}`,
          name: x.name,
          image: x.image,
          tag: x.cls,
          stats: [
            { label: "Fire rate", value: +x.fireRate.toFixed(2), max: 16, unit: "/s" },
            { label: "Magazine", value: x.magazine, max: 100 },
            { label: "Run speed", value: x.run, max: 1.15, unit: "×" },
            { label: "Reload", value: x.reload, max: 5, unit: "s" },
            { label: "Headshot", value: x.head, max: 260 },
          ],
        }))}
      />

      {/* 05 MAPS */}
      <section className="s-maps">
        <div className="wrap">
          <div className="eyebrow">04 / The battlegrounds</div>
          <h2 className="film-title"><Chars text="Know every corner" /></h2>
        </div>
        <div className="map-stack">
          {p.maps.map((m, i) => (
            <Link key={m.slug} href={`/maps/${m.slug}`} className="map-card" style={{ top: "9vh" }} data-cursor="Explore">
              <div className="mc-inner">
                <img className="mc-img" src={m.splash} alt="" data-distort />
                <div className="mc-info">
                  <span>{String(i + 1).padStart(2, "0")} · {m.layout}</span>
                  <h3>{m.name}</h3>
                  <span>{m.callouts} callouts mapped</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 06 NUMBERS */}
      <section className="s-numbers">
        <div className="wrap">
          <div className="num-rule" />
          <div className="nums">
            {p.counts.map((c) => (
              <div key={c.label} className="num">
                <b><CountUp to={c.value} duration={2} /></b>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="num-rule" />
        </div>
      </section>

      {/* 07 RANKS */}
      <section className="s-ranks">
        <div className="wrap">
          <div className="eyebrow">05 / Competitive</div>
          <h2 className="film-title"><Chars text="Iron to Radiant" /></h2>
          <div className="stairs" ref={stairsRef}>
            <svg className="stairs-svg" viewBox={`0 0 ${stairs.w} ${stairs.h}`} aria-hidden="true">
              <path
                className="stair-line"
                d={p.ranks
                  .map((_, i) => {
                    const x = (i / (p.ranks.length - 1)) * stairs.w;
                    const y = stairs.h - (i / (p.ranks.length - 1)) * 0.8 * stairs.h;
                    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(" ")}
              />
            </svg>
            {p.ranks.map((r, i) => (
              <Link
                key={r.name}
                href="/ranks"
                className="step"
                style={{ left: `${(i / (p.ranks.length - 1)) * 100}%`, top: `${100 - (i / (p.ranks.length - 1)) * 80}%` }}
              >
                <img src={r.icon} alt="" />
                <span>{r.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 08 OUTRO */}
      <section className="s-outro">
        <div className="outro-marquee" aria-hidden="true">
          <div className="mq-row">
            <span>Read the feed — Read the feed — </span>
            <span>Read the feed — Read the feed — </span>
          </div>
        </div>
        <div className="wrap outro-rows">
          {[
            ["Agents", "/agents", "Roles, abilities and kits"],
            ["Weapons", "/weapons", "Stats, damage and handling"],
            ["Maps", "/maps", "Minimaps and callouts"],
            ["Ranks", "/ranks", "The competitive ladder"],
            ["Modes", "/modes", "Every way to play"],
            ["Extras", "/extras", "Gear, tiers and borders"],
          ].map(([name, href, sub], i) => (
            <Link
              key={href}
              href={href}
              className="outro-row"
              onMouseEnter={() => setPreviewSrc(p.previews[name] ?? null)}
              onMouseLeave={() => setPreviewSrc(null)}
              data-cursor="Open"
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              <span className="or-name">{name}</span>
              <span className="or-sub">{sub}</span>
              <span className="or-arrow">↗</span>
            </Link>
          ))}
        </div>
        <div ref={preview} className={`outro-preview${previewSrc ? " on" : ""}`} aria-hidden="true">
          {previewSrc && <img src={previewSrc} alt="" />}
        </div>
      </section>
    </div>
  );
}
