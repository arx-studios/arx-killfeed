import { Fragment } from "react";
import Chapter from "../../components/film/Chapter";
import PageIntro from "../../components/film/PageIntro";
import Reel from "../../components/film/Reel";
import Stage from "../../components/film/Stage";
import { weaponClasses, weaponList } from "../../lib/data";

export const metadata = { title: "Weapons" };

const BLURB: Record<string, string> = {
  Sidearm: "Cheap, light and always on you. The pistol round lives and dies here.",
  SMG: "Run and gun. High fire rate, fast handling, made for close space.",
  Shotgun: "One pump, one room. Devastating up close, useless past it.",
  Rifle: "The backbone of every buy round. Reliable at any range.",
  Sniper: "Hold an angle, take the pick, change the round.",
  Heavy: "Spray through walls and hold a lane with a hundred rounds.",
  Melee: "The knife. The quietest way to end a round.",
};
const ORDER = ["Sidearm", "SMG", "Shotgun", "Rifle", "Sniper", "Heavy", "Melee"];

export default function Weapons() {
  const all = weaponList();
  const classes = [...weaponClasses()].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
  return (
    <>
      <PageIntro
        eyebrow="The arsenal"
        title="Weapons"
        sub="Every gun in the buy menu, grouped by class. Scroll to step through them; the stats redraw as you go."
        count={all.length}
        countLabel="Weapons"
        image={all.find((w) => w.slug === "operator")?.images.icon_hires}
        chapters={classes.map((c) => ({ id: c.slug, label: c.name }))}
      />
      {classes.map((c, i) => {
        const armed = c.children.filter((w) => w.stats);
        return (
          <Fragment key={c.key}>
            <Chapter
              id={c.slug}
              index={i + 1}
              eyebrow={`Class ${String(i + 1).padStart(2, "0")} · ${c.children.length} weapon${c.children.length > 1 ? "s" : ""}`}
              title={c.name}
              text={BLURB[c.key]}
              accent={["pistol", "close", "room", "every", "pick", "walls", "knife"]}
            />
            {armed.length >= 2 ? (
              <Stage
                eyebrow={c.name}
                ghost={c.name}
                items={armed.map((w) => ({
                  href: `/weapons/${w.slug}`,
                  name: w.name,
                  image: (w.images.icon_hires ?? w.images.displayicon),
                  stats: [
                    { label: "Fire rate", value: +w.stats.fireRate.toFixed(2), max: 16, unit: "/s" },
                    { label: "Magazine", value: w.stats.magazineSize, max: 100 },
                    { label: "Run speed", value: w.stats.runSpeedMultiplier, max: 1.15, unit: "×" },
                    { label: "Reload", value: w.stats.reloadTimeSeconds, max: 5, unit: "s" },
                    { label: "Headshot", value: Math.round(w.stats.damageRanges[0].headDamage), max: 260 },
                  ],
                }))}
              />
            ) : (
              <Reel
                variant="wide"
                label={c.name}
                items={c.children.map((w) => ({ href: `/weapons/${w.slug}`, title: w.name, meta: c.name, image: (w.images.icon_hires ?? w.images.displayicon) }))}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
