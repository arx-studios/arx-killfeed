import { notFound } from "next/navigation";
import DamageChart from "../../../components/film/DamageChart";
import DetailHero from "../../../components/film/DetailHero";
import NextUp from "../../../components/film/NextUp";
import StatRow from "../../../components/StatRow";
import { clean, findWeapon, weaponList, weaponMax } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => weaponList().map((w) => ({ weapon: w.slug }));

type P = { params: Promise<{ weapon: string }> };
export async function generateMetadata({ params }: P) {
  return { title: findWeapon((await params).weapon)?.name };
}

export default async function Weapon({ params }: P) {
  const w = findWeapon((await params).weapon);
  if (!w) notFound();
  const s = w.stats;
  const max = weaponMax();
  const list = weaponList();
  const next = list[(list.findIndex((x) => x.slug === w.slug) + 1) % list.length];

  return (
    <>
      <DetailHero
        variant="weapon"
        name={w.name}
        eyebrow={w.cls.name}
        image={(w.images.icon_hires ?? w.images.displayicon)}
        back={{ href: "/weapons", label: "All weapons" }}
        facts={
          s
            ? [
                { label: "Class", value: w.cls.name },
                { label: "Fire rate", value: `${+s.fireRate.toFixed(2)}/s` },
                { label: "Magazine", value: String(s.magazineSize) },
                { label: "Penetration", value: clean(s.wallPenetration) },
              ]
            : [{ label: "Class", value: w.cls.name }]
        }
      />
      {!s ? (
        <section className="wrap" style={{ padding: "10vh var(--gutter)" }}>
          <p className="lede">No combat stats exist for this weapon in the game data.</p>
        </section>
      ) : (
        <section className="wrap weapon-body">
          <div className="eyebrow">Damage falloff</div>
          <h2 style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}>Damage by range</h2>
          <DamageChart ranges={s.damageRanges} />
          <div className="two" style={{ marginTop: "8vh" }}>
            <div className="panel">
              <h3>Handling</h3>
              <div style={{ marginTop: 12 }}>
                <StatRow label="Fire rate" value={+s.fireRate.toFixed(2)} max={max.fireRate} unit="/s" />
                <StatRow label="Magazine" value={s.magazineSize} max={max.magazineSize} />
                <StatRow label="Run speed" value={s.runSpeedMultiplier} max={max.runSpeedMultiplier} unit="×" />
                <StatRow label="Equip time" value={s.equipTimeSeconds} max={max.equipTimeSeconds} unit="s" />
                <StatRow label="Reload time" value={s.reloadTimeSeconds} max={max.reloadTimeSeconds} unit="s" />
                <StatRow label="First bullet" value={s.firstBulletAccuracy} max={Math.max(s.firstBulletAccuracy, 3)} unit="°" />
              </div>
            </div>
            <div className="panel">
              <h3>Details</h3>
              <div className="kv">
                <div><small>Wall penetration</small><b>{clean(s.wallPenetration)}</b></div>
                <div><small>Alt fire</small><b>{clean(s.altFireType) || "None"}</b></div>
                <div><small>Pellets</small><b>{s.shotgunPelletCount}</b></div>
                {s.fireMode && <div><small>Fire mode</small><b>{clean(s.fireMode)}</b></div>}
                {s.feature && <div><small>Feature</small><b>{clean(s.feature)}</b></div>}
              </div>
              {s.adsStats && (
                <>
                  <h3 style={{ marginTop: 28 }}>Aiming down sights</h3>
                  <div className="kv">
                    <div><small>Zoom</small><b>{s.adsStats.zoomMultiplier}×</b></div>
                    <div><small>Fire rate</small><b>{s.adsStats.fireRate}/s</b></div>
                    <div><small>Run speed</small><b>{s.adsStats.runSpeedMultiplier}×</b></div>
                    <div><small>First bullet</small><b>{s.adsStats.firstBulletAccuracy}°</b></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      <NextUp href={`/weapons/${next.slug}`} label="Next weapon" name={next.name} image={(next.images.icon_hires ?? next.images.displayicon)} fit="contain" />
    </>
  );
}
