"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createLiquid } from "../webgl";
import { ScrollTrigger, gsap, pad, useFilm } from "./core";

export type StageStat = { label: string; value: number; max: number; unit?: string };
export type StageItem = { href: string; name: string; image: string; tag?: string; stats: StageStat[]; note?: string };

/** Pinned stage: scrolling steps through items; the image wipes across and the stats re-draw. */
export default function Stage({ items, eyebrow, ghost }: { items: StageItem[]; eyebrow?: string; ghost?: string }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  useFilm(root, () => {
    if (items.length < 2) return;
    ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: `+=${items.length * 55}%`,
      pin: true,
      onUpdate: (s) => setI(Math.min(items.length - 1, Math.floor(s.progress * items.length))),
    });
  });
  // liquid dissolve between weapons (falls back to the CSS wipe without WebGL)
  const canvas = useRef<HTMLCanvasElement>(null);
  const liquid = useRef<ReturnType<typeof createLiquid>>(null);
  const shown = useRef(0);
  const [gl, setGl] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    const lq = createLiquid(canvas.current, items.map((x) => x.image));
    if (!lq) return;
    liquid.current = lq;
    setGl(true);
    const paint = () => lq.draw(shown.current, shown.current, 1, 1);
    lq.onLoad(paint);
    paint();
    window.addEventListener("resize", paint);
    return () => {
      window.removeEventListener("resize", paint);
      lq.destroy();
      liquid.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const lq = liquid.current;
    if (!lq || i === shown.current) return;
    const from = shown.current;
    shown.current = i;
    const st = { p: 0 };
    const tw = gsap.to(st, { p: 1, duration: 1.1, ease: "power2.inOut", onUpdate: () => lq.draw(from, i, st.p, i > from ? 1 : -1) });
    return () => {
      tw.kill();
      lq.draw(i, i, 1, 1);
    };
  }, [i]);

  const it = items[i];
  return (
    <section ref={root} className="stage" data-fx-off>
      <div className="wrap stage-grid">
        <div className="stage-list">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          {items.map((x, k) => (
            <Link key={`${x.href}-${k}`} href={x.href} className={k === i ? "on" : ""} data-cursor="Open">
              <small>{pad(k + 1)}</small>
              {x.name}
            </Link>
          ))}
        </div>
        <div className={`stage-view${gl ? " gl-on" : ""}`}>
          <canvas ref={canvas} className="stage-canvas" aria-hidden="true" />
          <div className="stage-ghost" aria-hidden="true">{ghost ?? it.tag}</div>
          {items.map((x, k) => (
            <img key={`${x.href}-${k}`} src={x.image} alt={x.name} className={k === i ? "on" : k < i ? "past" : ""} />
          ))}
          {it.note && <div className="stage-note">{it.note}</div>}
        </div>
        <div className="stage-stats">
          {it.stats.map((s) => (
            <div key={s.label} className="ss-row">
              <span>{s.label}</span>
              <b>
                {s.value}
                {s.unit}
              </b>
              <i style={{ transform: `scaleX(${Math.min(1, s.value / s.max)})` }} />
            </div>
          ))}
          <Link href={it.href} className="btn ghost" data-cursor="Open">
            Full breakdown <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
