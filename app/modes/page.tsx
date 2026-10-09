import PageIntro from "../../components/film/PageIntro";
import Stack from "../../components/film/Stack";
import { section } from "../../lib/data";

export const metadata = { title: "Modes" };

export default function Modes() {
  const modes = section("Game_Modes");
  const featured = modes.filter((m) => m.stats?.description);
  return (
    <>
      <PageIntro
        eyebrow="Ways to play"
        title="Modes"
        sub="From the ranked standard to limited-time chaos. Every mode, how long it runs and how it plays."
        count={modes.length}
        countLabel="Game modes"
        image={modes.find((m) => m.images.listviewicontall)?.images.listviewicontall}
      />
      <Stack
        variant="panel"
        items={featured.map((m) => ({
          key: m.key,
          title: m.name,
          kicker: [m.stats.duration, m.stats.roundsPerHalf > 0 ? `${m.stats.roundsPerHalf} rounds a half` : null].filter(Boolean).join(" · ") || "Mode",
          body: m.stats.description,
          icon: m.images.displayicon ?? m.images.listviewicontall,
        }))}
      />
    </>
  );
}
