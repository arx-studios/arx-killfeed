"use client";
import { useRef } from "react";
import { Chars, gsap, pad, useFilm } from "./core";

export type LadderRank = { name: string; color: string; tiers: { name: string; icon: string }[] };

/** One full-height row per rank: the name rises in its colour, the divisions climb in from the right. */
export default function RankLadder({ ranks }: { ranks: LadderRank[] }) {
  const root = useRef<HTMLDivElement>(null);
  useFilm(root, (q) => {
    q(".rl-row").forEach((row) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 80%", end: "center center", scrub: 0.6 } });
      tl.from(row.querySelectorAll(".rl-name .ch"), { yPercent: 130, stagger: 0.04, ease: "expo.out" }, 0)
        .from(row.querySelectorAll(".rl-tier"), { xPercent: 60, yPercent: 30, opacity: 0, rotate: 8, stagger: 0.12, ease: "expo.out" }, 0.1)
        .from(row.querySelector(".rl-glow"), { scale: 0.3, opacity: 0, ease: "none" }, 0);
    });
  });
  return (
    <div ref={root} className="rank-ladder" data-fx-off>
      {ranks.map((r, i) => (
        <section key={r.name} className="rl-row" style={{ ["--c" as any]: r.color }}>
          <div className="rl-glow" aria-hidden />
          <div className="wrap rl-inner">
            <div className="rl-left">
              <span className="rl-index">{pad(i)}</span>
              <h2 className="rl-name"><Chars text={r.name} /></h2>
            </div>
            <div className="rl-tiers">
              {r.tiers.map((t) => (
                <div key={t.name} className="rl-tier">
                  <img src={t.icon} alt="" />
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
