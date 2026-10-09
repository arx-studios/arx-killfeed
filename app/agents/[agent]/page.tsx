import { notFound } from "next/navigation";
import DetailHero from "../../../components/film/DetailHero";
import NextUp from "../../../components/film/NextUp";
import Stack from "../../../components/film/Stack";
import WordsLight from "../../../components/film/WordsLight";
import { abilitiesOf, agentList, findAgent } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => agentList().map((a) => ({ agent: a.slug }));

type P = { params: Promise<{ agent: string }> };
export async function generateMetadata({ params }: P) {
  return { title: findAgent((await params).agent)?.name };
}

const SLOT: Record<string, string> = { Ability1: "Basic", Ability2: "Basic", Grenade: "Signature", Passive: "Passive", Ultimate: "Ultimate" };
const ORDER = ["Grenade", "Ability1", "Ability2", "Ultimate", "Passive"];

export default async function Agent({ params }: P) {
  const a = findAgent((await params).agent);
  if (!a) notFound();
  const list = agentList();
  const next = list[(list.findIndex((x) => x.slug === a.slug) + 1) % list.length];
  const s = a.stats ?? {};
  const abilities = abilitiesOf(a).sort((x: any, y: any) => ORDER.indexOf(x.slot) - ORDER.indexOf(y.slot));
  const ult = abilities.find((x: any) => x.slot === "Ultimate");

  return (
    <>
      <DetailHero
        variant="agent"
        name={a.name}
        eyebrow={a.role.name}
        icon={a.role.images.displayicon}
        image={a.images.fullportrait ?? a.images.displayicon}
        bg={a.images.background}
        back={{ href: "/agents", label: "All agents" }}
        facts={[
          { label: "Role", value: a.role.name },
          { label: "Abilities", value: String(abilities.length) },
          ...(ult ? [{ label: "Ultimate", value: ult.displayName }] : []),
          ...((s.characterTags ?? []).length ? [{ label: "Style", value: s.characterTags.join(" / ") }] : []),
        ]}
      />
      {s.description && <WordsLight eyebrow="Dossier" text={s.description} accent={[a.name.toLowerCase()]} />}
      <section className="wrap" style={{ paddingTop: "8vh" }}>
        <div className="eyebrow">The kit · {abilities.length} abilities</div>
        <h2 style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}>Abilities</h2>
      </section>
      <Stack
        variant="panel"
        items={abilities.map((ab: any) => ({
          key: ab.slot,
          title: ab.displayName,
          kicker: SLOT[ab.slot] ?? ab.slot,
          body: ab.description,
          icon: ab.node?.images.displayicon,
        }))}
      />
      <NextUp href={`/agents/${next.slug}`} label="Next agent" name={next.name} image={next.images.fullportrait} />
    </>
  );
}
