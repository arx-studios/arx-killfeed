import { notFound } from "next/navigation";
import DetailHero from "../../../components/film/DetailHero";
import NextUp from "../../../components/film/NextUp";
import MapExplorer from "../../../components/MapExplorer";
import { findMap, mapList } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => mapList().map((m) => ({ map: m.slug }));

type P = { params: Promise<{ map: string }> };
export async function generateMetadata({ params }: P) {
  return { title: findMap((await params).map)?.name };
}

export default async function MapPage({ params }: P) {
  const m = findMap((await params).map);
  if (!m) notFound();
  const s = m.stats ?? {};
  const callouts = s.callouts ?? [];
  const canPlot = m.images.displayicon && callouts.length > 0 && s.xMultiplier;
  const list = mapList().filter((x) => x.images.splash);
  const next = list[(list.findIndex((x) => x.slug === m.slug) + 1) % list.length];
  const regions = new Set(callouts.map((c: any) => c.superRegionName)).size;

  return (
    <>
      <DetailHero
        variant="map"
        name={m.name}
        eyebrow={s.tacticalDescription ?? "Map"}
        image={m.images.splash ?? m.images.listviewicon}
        back={{ href: "/maps", label: "All maps" }}
        facts={[
          ...(s.tacticalDescription ? [{ label: "Layout", value: s.tacticalDescription }] : []),
          ...(callouts.length ? [{ label: "Callouts", value: String(callouts.length) }] : []),
          ...(regions ? [{ label: "Regions", value: String(regions) }] : []),
        ]}
      />
      <section className="wrap" style={{ paddingTop: "10vh" }}>
        {canPlot ? (
          <>
            <div className="eyebrow">Hover a pin or open the folder</div>
            <h2 style={{ fontSize: "clamp(3rem, 8vw, 8rem)", marginBottom: "5vh" }}>Callouts</h2>
            <MapExplorer
              image={m.images.displayicon}
              callouts={callouts}
              xMultiplier={s.xMultiplier}
              yMultiplier={s.yMultiplier}
              xScalarToAdd={s.xScalarToAdd}
              yScalarToAdd={s.yScalarToAdd}
            />
          </>
        ) : (
          <p className="lede">No minimap or callout data for this map.</p>
        )}
      </section>
      <NextUp href={`/maps/${next.slug}`} label="Next map" name={next.name} image={next.images.splash} />
    </>
  );
}
