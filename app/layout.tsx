import type { Metadata } from "next";
import { Big_Shoulders, Inter_Tight } from "next/font/google";
import { MotionRoot } from "../components/Motion";
import SiteNav from "../components/SiteNav";
import { ExitCover, Loader } from "../components/Transitions";
import { agentList, mapList, rankList, section, version, weaponList } from "../lib/data";
import "./globals.css";
import "./nav.css";

const display = Big_Shoulders({ weight: ["700", "800", "900"], subsets: ["latin"], variable: "--font-display" });
const body = Inter_Tight({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "Killfeed — Valorant field manual", template: "%s · Killfeed" },
  description: "Agents, weapons, maps, ranks and modes, built from the Valorant game data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const v = version();
  const patch = v.version ? v.version.split(".").slice(0, 2).join(".") : undefined;
  const ranks = rankList();
  const previews: Record<string, string> = {
    Agents: agentList().find((a) => a.slug === "reyna")?.images.fullportrait,
    Weapons: weaponList().find((w) => w.slug === "vandal")?.images.icon_hires,
    Maps: mapList().find((m) => m.slug === "ascent")?.images.splash,
    Ranks: ranks[ranks.length - 1]?.images.largeicon,
    Modes: section("Game_Modes").find((m) => m.images.listviewicontall)?.images.listviewicontall,
    Extras: section("Gear")[0]?.images.displayicon,
  };
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SiteNav version={patch} previews={previews} />
        <main>{children}</main>
        <footer>
          <div className="wrap foot-row">
            <span className="logo">KILL<i>/</i>FEED</span>
            <span>
              Fan project, not affiliated with or endorsed by Riot Games. VALORANT and all related assets are property of Riot
              Games. Data from valorant-api.com{v.version ? ` · game version ${v.version}` : ""}.
            </span>
          </div>
        </footer>
        <ExitCover />
        <Loader />
        <MotionRoot />
      </body>
    </html>
  );
}
