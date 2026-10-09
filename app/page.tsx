import HomeFilm, { FilmProps } from "../components/HomeFilm";
import { agentList, hexColor, mapList, rankList, section, version, weaponList } from "../lib/data";

export default function Home() {
  const agents = agentList();
  const weapons = weaponList();
  const maps = mapList();
  const modes = section("Game_Modes");
  const ranks = rankList();
  const abilityCount = agents.reduce((n, a) => n + (a.children.find((c) => c.key === "abilities")?.children.length ?? 0), 0);
  const bySlug = <T extends { slug: string }>(list: T[], slugs: string[]) =>
    slugs.map((s) => list.find((x) => x.slug === s)).filter(Boolean) as T[];

  // a mixed-role roster for the horizontal reel
  const roster = bySlug(agents, ["jett", "omen", "sova", "sage", "reyna", "viper", "killjoy", "fade", "raze", "clove", "chamber", "neon"]);
  const arsenal = bySlug(weapons, ["vandal", "phantom", "operator", "sheriff", "odin"]);
  const stage = maps.filter((m) => m.images.splash && m.stats?.callouts?.length && m.stats?.tacticalDescription?.includes("A/B"));
  const featuredMaps = bySlug(stage, ["ascent", "haven", "bind", "lotus", "sunset"]);

  const props: FilmProps = {
    hero: (agents.find((a) => a.slug === "jett") ?? agents[0]).images.fullportrait,
    version: version().version,
    agents: roster.map((a) => ({
      name: a.name,
      slug: a.slug,
      role: a.role.name,
      portrait: a.images.fullportrait ?? a.images.displayicon,
      background: a.images.background,
      icon: a.images.displayicon,
    })),
    weapons: arsenal.map((w) => ({
      name: w.name,
      slug: w.slug,
      cls: w.cls.name,
      image: (w.images.icon_hires ?? w.images.displayicon),
      fireRate: w.stats.fireRate,
      magazine: w.stats.magazineSize,
      run: w.stats.runSpeedMultiplier,
      reload: w.stats.reloadTimeSeconds,
      head: Math.round(w.stats.damageRanges[0].headDamage),
    })),
    maps: (featuredMaps.length >= 3 ? featuredMaps : stage.slice(0, 5)).map((m) => ({
      name: m.name,
      slug: m.slug,
      splash: m.images.splash,
      layout: m.stats.tacticalDescription,
      callouts: m.stats.callouts.length,
    })),
    ranks: ranks
      .filter((r) => r.key !== "00_Unranked")
      .map((r) => {
        const t = r.children[0] ?? r; // first division stands for the rank
        return { name: r.name, icon: t.images.largeicon, color: hexColor(t.stats?.color) };
      }),
    counts: [
      { label: "Agents", value: agents.length },
      { label: "Abilities", value: abilityCount },
      { label: "Weapons", value: weapons.length },
      { label: "Maps", value: maps.length },
      { label: "Game modes", value: modes.length },
    ],
    previews: {
      Agents: (agents.find((a) => a.slug === "reyna") ?? agents[0]).images.fullportrait,
      Weapons: (weapons.find((w) => w.slug === "vandal") ?? weapons[0]).images.icon_hires,
      Maps: (maps.find((m) => m.slug === "ascent") ?? maps[0]).images.splash,
      Ranks: ranks[ranks.length - 1]?.images.largeicon,
      Modes: modes.find((m) => m.images.listviewicontall)?.images.listviewicontall,
      Extras: section("Gear")[0]?.images.displayicon,
    },
  };
  return <HomeFilm {...props} />;
}
