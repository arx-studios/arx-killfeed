import PageIntro from "../../components/film/PageIntro";
import Reel from "../../components/film/Reel";
import Stack from "../../components/film/Stack";
import { mapList } from "../../lib/data";

export const metadata = { title: "Maps" };

export default function Maps() {
  const maps = mapList();
  const competitive = maps.filter((m) => m.images.splash && m.stats?.callouts?.length && /sites/i.test(m.stats?.tacticalDescription ?? ""));
  const rest = maps.filter((m) => !competitive.includes(m) && (m.images.splash || m.images.listviewicon));
  return (
    <>
      <PageIntro
        eyebrow="The battlegrounds"
        title="Maps"
        sub="Every competitive map with its minimap and callouts, plus the practice and mode maps."
        count={maps.length}
        countLabel="Maps"
        image={maps.find((m) => m.slug === "ascent")?.images.displayicon}
        chapters={[
          { id: "competitive", label: "Competitive" },
          { id: "other", label: "Modes & practice" },
        ]}
      />
      <section id="competitive" className="wrap" style={{ paddingTop: "6vh" }}>
        <div className="eyebrow">{competitive.length} maps in rotation history</div>
        <h2 style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}>Competitive</h2>
      </section>
      <Stack
        variant="image"
        items={competitive.map((m) => ({
          key: m.key,
          href: `/maps/${m.slug}`,
          image: m.images.splash,
          title: m.name,
          kicker: m.stats.tacticalDescription,
          sub: `${m.stats.callouts.length} callouts mapped`,
        }))}
      />
      <div id="other" />
      <Reel
        variant="wide"
        label="Modes & practice"
        items={rest.map((m) => ({
          href: `/maps/${m.slug}`,
          title: m.name,
          meta: m.stats?.tacticalDescription ?? "Mode map",
          image: m.images.splash ?? m.images.listviewicon,
        }))}
      />
    </>
  );
}
