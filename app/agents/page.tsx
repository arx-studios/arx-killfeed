import { Fragment } from "react";
import Chapter from "../../components/film/Chapter";
import PageIntro from "../../components/film/PageIntro";
import Reel from "../../components/film/Reel";
import { agentList, roles } from "../../lib/data";

export const metadata = { title: "Agents" };

export default function Agents() {
  const rs = roles();
  const all = agentList();
  const hero = all.find((a) => a.slug === "omen") ?? all[0];
  return (
    <>
      <PageIntro
        eyebrow="The roster"
        title="Agents"
        sub="Four roles, one job each. Scroll through every agent, or jump straight to a role."
        count={all.length}
        countLabel="Agents in the game"
        image={hero.images.fullportrait}
        chapters={rs.map((r) => ({ id: r.slug, label: r.name }))}
      />
      {rs.map((r, i) => {
        const agents = r.children.filter((a) => a.key !== "abilities");
        return (
          <Fragment key={r.key}>
            <Chapter
              id={r.slug}
              index={i + 1}
              eyebrow={`Role ${String(i + 1).padStart(2, "0")} · ${agents.length} agents`}
              title={r.name}
              text={r.stats?.description}
              accent={["experts", "fraggers", "information", "lockdown", "engagements", "territory", "flank", "team"]}
              icon={r.images.displayicon}
            />
            <Reel
              variant="portrait"
              label={`${r.name}s`}
              items={agents.map((a) => ({
                href: `/agents/${a.slug}`,
                title: a.name,
                meta: (a.stats?.characterTags ?? []).join(" · ") || r.name,
                image: a.images.fullportrait ?? a.images.displayicon,
                bg: a.images.background,
              }))}
            />
          </Fragment>
        );
      })}
    </>
  );
}
