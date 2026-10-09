"use client";
import { useEffect, useState } from "react";
import CountUp from "./rb/CountUp";

export default function StatRow({ label, value, max, unit = "" }: { label: string; value: number; max: number; unit?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 60); // let the bar grow in after mount
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="stat-row">
      <label>{label}</label>
      <div className="bar"><i style={{ width: `${w}%` }} /></div>
      <b>
        <CountUp to={value} duration={1.2} />
        {unit}
      </b>
    </div>
  );
}
