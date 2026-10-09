"use client";
import { useState } from "react";
import FolderFloat from "./rb/FolderFloat";

type Callout = { regionName: string; superRegionName: string; location: { x: number; y: number } };
type Props = {
  image: string;
  callouts: Callout[];
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
};

const COLORS: Record<string, string> = { A: "#c6ff3d", B: "#efece4", C: "#8c8981", Mid: "#efece4" };

export default function MapExplorer({ image, callouts, xMultiplier, yMultiplier, xScalarToAdd, yScalarToAdd }: Props) {
  const [active, setActive] = useState<number | null>(null);
  // In-game x/y are swapped relative to the minimap image axes.
  const pos = (c: Callout) => ({
    left: `${(c.location.y * xMultiplier + xScalarToAdd) * 100}%`,
    top: `${(c.location.x * yMultiplier + yScalarToAdd) * 100}%`,
  });
  const regions = [...new Set(callouts.map((c) => c.superRegionName))];

  return (
    <div className="explorer">
      <div className="plot cut">
        <img src={image} alt="Minimap" />
        {callouts.map((c, i) => (
          <button
            key={i}
            className={`pin ${c.superRegionName} ${active === i ? "on" : active !== null ? "dim" : ""}`}
            style={pos(c)}
            title={c.regionName}
            aria-label={c.regionName}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
          />
        ))}
        {active !== null && <div className="plot-label">{callouts[active].regionName}</div>}
      </div>
      <div className="explorer-side">
        <div className="folder-slot">
          <FolderFloat
            items={callouts.map((c, i) => ({ label: c.regionName, value: String(i) }))}
            label="Callouts"
            sublabel={`${callouts.length} locations`}
            trigger="click"
            closeOnSelect={false}
            physics
            onSelect={(v: string) => setActive(Number(v))}
            folderColor="#19191c"
            frontColor="#c6ff3d"
            paperColor="#efece4"
            itemColor="#efece4"
            itemTextColor="#0a0a0b"
            labelColor="#0a0a0b"
            width={220}
            height={150}
            radius={6}
            spread={220}
          />
        </div>
        <div className="legend">
          {regions.map((r) => (
            <span key={r}>
              <i style={{ background: COLORS[r] ?? "#efece4" }} />
              {r.length <= 3 ? `${r} site` : r}
            </span>
          ))}
        </div>
        {regions.map((r) => (
          <div key={r} className="region">
            <h3 style={{ color: COLORS[r] ?? "var(--ink)" }}>{r.length <= 3 ? `${r} site` : r}</h3>
            <div className="callouts">
              {callouts.map((c, i) =>
                c.superRegionName === r ? (
                  <button
                    key={i}
                    className={active === i ? "on" : ""}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                  >
                    {c.regionName}
                  </button>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
