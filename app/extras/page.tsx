import Chapter from "../../components/film/Chapter";
import PageIntro from "../../components/film/PageIntro";
import Reel from "../../components/film/Reel";
import Stage from "../../components/film/Stage";
import { section } from "../../lib/data";

export const metadata = { title: "Extras" };

export default function Extras() {
  const tiers = [...section("Content_Tiers")].sort((a, b) => (a.stats?.rank ?? 0) - (b.stats?.rank ?? 0));
  const currencies = section("Currencies");
  const gear = section("Gear");
  const levels = [...section("Level_Borders")].sort((a, b) => (a.stats?.startingLevel ?? 0) - (b.stats?.startingLevel ?? 0));
  const seasons = [...section("Season_Borders")].sort((a, b) => (a.stats?.level ?? 0) - (b.stats?.level ?? 0));
  const num = (s?: string) => parseInt((s ?? "").replace(/\D/g, ""), 10) || 0;

  return (
    <>
      <PageIntro
        eyebrow="Everything else"
        title="Extras"
        sub="Shields, skin tiers, currencies and the borders you earn along the way."
        image={gear[0]?.images.displayicon}
        chapters={[
          { id: "gear", label: "Gear" },
          { id: "tiers", label: "Skin tiers" },
          { id: "currencies", label: "Currencies" },
          { id: "borders", label: "Borders" },
        ]}
      />

      <Chapter id="gear" index={1} eyebrow="Buy phase" title="Gear" text="Shields soak damage before your health does. Pick one every round you can afford it." accent={["shields", "health"]} />
      <Stage
        eyebrow="Shields"
        ghost="Armor"
        items={gear.map((g) => {
          const d = Object.fromEntries((g.stats?.details ?? []).map((x: any) => [x.name, x.value]));
          return {
            href: "/extras",
            name: g.name,
            image: g.images.displayicon,
            note: g.stats?.description,
            stats: [
              { label: "Cost", value: g.stats?.shopData?.cost ?? 0, max: 1000, unit: "" },
              { label: "Absorbs", value: num(d["DAMAGE ABSORBED"] ?? d["DAMAGE REDUCTION"]), max: 100, unit: "%" },
            ],
          };
        })}
      />

      <Chapter id="tiers" index={2} eyebrow="Store" title="Skin tiers" text="Every skin sits in one of five editions, from Select up to Ultra." accent={["five", "ultra"]} />
      <Reel
        variant="icon"
        label="Editions"
        items={tiers.map((t) => ({
          href: "/extras",
          title: t.name,
          meta: `Rank ${t.stats?.rank}`,
          sub: `${t.stats?.juiceValue} juice value · ${t.stats?.juiceCost} to upgrade`,
          image: t.images.displayicon,
        }))}
      />

      <Chapter id="currencies" index={3} eyebrow="Wallet" title="Currencies" />
      <Reel
        variant="icon"
        label="Wallet"
        items={currencies.map((c) => ({ href: "/extras", title: c.name, meta: c.stats?.displayNameSingular, image: c.images.largeicon ?? c.images.displayicon }))}
      />

      <Chapter id="borders" index={4} eyebrow="Progression" title="Borders" text="Level borders unlock as your account grows. Act borders reward the wins you put in each act." accent={["level", "act"]} />
      <Reel
        variant="icon"
        label="Level borders"
        items={levels.map((l) => ({ href: "/extras", title: `Level ${l.stats?.startingLevel}`, meta: "Level border", image: l.images.smallplayercardappearance ?? l.images.levelnumberappearance }))}
      />
      <Reel
        variant="icon"
        label="Act borders"
        items={seasons.map((s) => ({ href: "/extras", title: `${s.stats?.winsRequired} wins`, meta: `Tier ${s.stats?.level}`, image: s.images.displayicon }))}
      />
      <div style={{ height: "10vh" }} />
    </>
  );
}
