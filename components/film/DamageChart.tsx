"use client";
import { useRef, useState } from "react";
import { gsap, useFilm } from "./core";

type Range = { rangeStartMeters: number; rangeEndMeters: number; headDamage: number; bodyDamage: number; legDamage: number };

const W = 1000;
const H = 420;
const PAD = { l: 56, r: 110, t: 24, b: 44 };
const SERIES = [
  { key: "headDamage", label: "Head", cls: "dc-head" },
  { key: "bodyDamage", label: "Body", cls: "dc-body" },
  { key: "legDamage", label: "Legs", cls: "dc-leg" },
] as const;

/** Damage falloff as three step lines that draw on scroll, with a hover readout. */
export default function DamageChart({ ranges }: { ranges: Range[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [hx, setHx] = useState<number | null>(null);
  const maxR = Math.max(50, ...ranges.map((r) => r.rangeEndMeters));
  const maxD = Math.ceil(Math.max(...ranges.map((r) => r.headDamage)) / 25) * 25 + 25;
  const x = (m: number) => PAD.l + (m / maxR) * (W - PAD.l - PAD.r);
  const y = (d: number) => H - PAD.b - (d / maxD) * (H - PAD.t - PAD.b);
  const path = (k: (typeof SERIES)[number]["key"]) =>
    ranges.map((r, i) => `${i ? "L" : "M"}${x(r.rangeStartMeters)} ${y(r[k])} L${x(r.rangeEndMeters)} ${y(r[k])}`).join(" ");
  const at = (m: number) => ranges.find((r) => m >= r.rangeStartMeters && m <= r.rangeEndMeters) ?? ranges[ranges.length - 1];

  useFilm(root, (q) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 25%", scrub: 0.6 } });
    tl.fromTo(q(".dc-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.15, ease: "none" }, 0)
      .from(q(".dc-grid line"), { scaleX: 0, transformOrigin: "0 50%", stagger: 0.03, ease: "none" }, 0)
      .from(q(".dc-end"), { opacity: 0, x: -10, stagger: 0.1, ease: "none" }, 0.4);
  });

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const m = ((px - PAD.l) / (W - PAD.l - PAD.r)) * maxR;
    setHx(m < 0 || m > maxR ? null : m);
  };
  const r = hx != null ? at(hx) : null;

  return (
    <div ref={root} className="damage-chart" data-fx-off>
      <svg viewBox={`0 0 ${W} ${H}`} onPointerMove={onMove} onPointerLeave={() => setHx(null)} role="img" aria-label="Damage by range">
        <g className="dc-grid">
          {Array.from({ length: maxD / 25 + 1 }, (_, i) => i * 25).map((d) => (
            <g key={d}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(d)} y2={y(d)} />
              <text x={PAD.l - 12} y={y(d) + 4} textAnchor="end">{d}</text>
            </g>
          ))}
          {Array.from({ length: maxR / 10 + 1 }, (_, i) => i * 10).map((m) => (
            <text key={m} x={x(m)} y={H - PAD.b + 26} textAnchor="middle">{m}m</text>
          ))}
        </g>
        {SERIES.map((s) => (
          <g key={s.key} className={s.cls}>
            <path className="dc-line" d={path(s.key)} pathLength={1} />
            <text className="dc-end" x={W - PAD.r + 14} y={y(ranges[ranges.length - 1][s.key]) + 5}>
              {s.label} {Math.round(ranges[ranges.length - 1][s.key])}
            </text>
          </g>
        ))}
        {r && hx != null && (
          <g className="dc-hover">
            <line x1={x(hx)} x2={x(hx)} y1={PAD.t} y2={H - PAD.b} />
            {SERIES.map((s) => (
              <circle key={s.key} className={s.cls} cx={x(hx)} cy={y(r[s.key])} r={6} />
            ))}
          </g>
        )}
      </svg>
      <div className="dc-readout">
        <span>{hx != null ? `${hx.toFixed(0)} m` : "Hover the chart"}</span>
        {SERIES.map((s) => (
          <span key={s.key} className={s.cls}>
            <i />
            {s.label} <b>{Math.round((r ?? ranges[0])[s.key])}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
