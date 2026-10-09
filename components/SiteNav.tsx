"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useSound } from "./Sound";

const links = [
  { label: "Agents", href: "/agents" },
  { label: "Weapons", href: "/weapons" },
  { label: "Maps", href: "/maps" },
  { label: "Ranks", href: "/ranks" },
  { label: "Modes", href: "/modes" },
  { label: "Extras", href: "/extras" },
];

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The wordmark: KILL / FEED with a lime slash. */
export function Logo() {
  return (
    <span className="logo" aria-label="Killfeed">
      KILL<i aria-hidden>/</i>FEED
    </span>
  );
}

export default function SiteNav({ version, previews }: { version?: string; previews: Record<string, string> }) {
  const path = usePathname() || "/";
  const active = links.findIndex((l) => path === l.href || path.startsWith(l.href + "/"));
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const sound = useSound();

  // sliding indicator under the hovered (or current) link
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);
  useIso(() => {
    const target = linkRefs.current[hover ?? active];
    if (!bar.current) return;
    if (!target) {
      gsap.to(bar.current, { scaleX: 0, duration: 0.4, ease: "expo.out" });
      return;
    }
    gsap.to(bar.current, { x: target.offsetLeft, width: target.offsetWidth, scaleX: 1, duration: 0.6, ease: "expo.out" });
  }, [hover, active]);

  // hide on the way down, return on the way up
  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 320 && y > last && !open);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // full-screen menu: two panels drop, then the links rise; built fresh each time so it never drifts
  const overlay = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const first = useRef(true);
  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    if (first.current) {
      first.current = false;
      gsap.set(el, { autoAlpha: 0 });
      if (!open) return;
    }
    tl.current?.kill();
    if (open) {
      window.__lenis?.stop();
      tl.current = gsap
        .timeline()
        .set(el, { autoAlpha: 1 })
        .fromTo(q(".mo-layer"), { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: "expo.inOut", stagger: 0.08 })
        .fromTo(q(".mo-word"), { yPercent: 120 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.05 }, "-=0.35")
        .fromTo(q(".mo-foot > *, .mo-link small, .mo-preview"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04 }, "-=0.6");
    } else {
      window.__lenis?.start();
      tl.current = gsap
        .timeline()
        .to(q(".mo-word"), { yPercent: -120, duration: 0.45, ease: "expo.in", stagger: 0.03 })
        .to(q(".mo-foot > *, .mo-link small"), { opacity: 0, duration: 0.3 }, 0)
        .to(q(".mo-layer"), { yPercent: 100, duration: 0.7, ease: "expo.inOut", stagger: -0.08 }, "-=0.15")
        .set(el, { autoAlpha: 0 });
    }
  }, [open]);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  return (
    <>
      <header className={`nav${hidden ? " is-hidden" : ""}${solid ? " is-solid" : ""}${open ? " is-open" : ""}`}>
        <div className="wrap nav-row">
          <Link href="/" className="nav-logo" data-cursor="Home" onMouseEnter={() => sound.tick()}>
            <Logo />
          </Link>

          <nav className="nav-links" onMouseLeave={() => setHover(null)} aria-label="Primary">
            <span ref={bar} className="nav-bar" aria-hidden />
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                className={`roll${i === active ? " is-active" : ""}`}
                onMouseEnter={() => {
                  setHover(i);
                  sound.tick();
                }}
              >
                <sup>{String(i + 1).padStart(2, "0")}</sup>
                <span className="roll-text">
                  <span data-text={l.label}>{l.label}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="nav-right">
            {version && (
              <span className="nav-patch">
                <i />
                Patch {version}
              </span>
            )}
            <button className={`nav-sound${sound.on ? " on" : ""}`} onClick={sound.toggle} aria-label={sound.on ? "Mute sounds" : "Turn sounds on"} data-cursor={sound.on ? "Mute" : "Sound"}>
              {[0, 1, 2, 3].map((k) => (
                <i key={k} style={{ animationDelay: `${k * 0.12}s` }} />
              ))}
            </button>
            <button
              className="nav-menu"
              onClick={() => {
                setOpen((o) => !o);
                sound.click();
              }}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span className="roll-text"><span data-text={open ? "Close" : "Menu"}>{open ? "Close" : "Menu"}</span></span>
              <span className="nav-burger" aria-hidden>
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div ref={overlay} className="menu-overlay" aria-hidden={!open}>
        <div className="mo-layer mo-layer--accent" />
        <div className="mo-layer mo-layer--dark">
          <div className="wrap mo-grid">
            <nav className="mo-links">
              {links.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`mo-link${i === active ? " is-active" : ""}`}
                  onMouseEnter={() => {
                    setPreview(previews[l.label] ?? null);
                    sound.tick();
                  }}
                  onMouseLeave={() => setPreview(null)}
                  tabIndex={open ? 0 : -1}
                >
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  <span className="mo-mask">
                    <span className="mo-word">{l.label}</span>
                  </span>
                </Link>
              ))}
            </nav>
            <div className={`mo-preview${preview ? " on" : ""}`}>{preview && <img src={preview} alt="" />}</div>
            <div className="mo-foot">
              <span>Killfeed — a Valorant field manual</span>
              <span>Data · valorant-api.com</span>
              {version && <span>Patch {version}</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
