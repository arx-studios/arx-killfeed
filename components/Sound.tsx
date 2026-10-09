"use client";
import { useCallback, useEffect, useState } from "react";

/*
 * Optional interface sounds, synthesised with Web Audio (no files).
 * Off by default; the choice is remembered per browser.
 */
let ctx: AudioContext | null = null;
let enabled = false;
const listeners = new Set<(v: boolean) => void>();

function audio() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function blip(freq: number, dur: number, gain: number, type: OscillatorType = "sine", slide = 0) {
  if (!enabled) return;
  const a = audio();
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  tick: () => blip(2400, 0.035, 0.025, "triangle"),
  click: () => blip(520, 0.09, 0.06, "sine", -260),
  whoosh: () => {
    if (!enabled) return;
    const a = audio();
    const t = a.currentTime;
    const len = 0.45;
    const buf = a.createBuffer(1, a.sampleRate * len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + len);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  },
};

function set(v: boolean) {
  enabled = v;
  try {
    localStorage.setItem("kf-sound", v ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l(v));
}

export function useSound() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      enabled = localStorage.getItem("kf-sound") === "1";
    } catch {}
    setOn(enabled);
    listeners.add(setOn);
    return () => {
      listeners.delete(setOn);
    };
  }, []);
  const toggle = useCallback(() => {
    set(!enabled);
    if (enabled) sfx.click();
  }, []);
  return { on, toggle, tick: sfx.tick, click: sfx.click, whoosh: sfx.whoosh };
}
