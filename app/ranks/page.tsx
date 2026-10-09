import PageIntro from "../../components/film/PageIntro";
import RankLadder from "../../components/film/RankLadder";
import WordsLight from "../../components/film/WordsLight";
import { hexColor, rankList } from "../../lib/data";

export const metadata = { title: "Ranks" };

export default function Ranks() {
  const ranks = rankList();
  const divisions = ranks.reduce((n, r) => n + Math.max(1, r.children.length), 0);
  return (
    <>
      <PageIntro
        eyebrow="Competitive"
        title="Ranks"
        sub="The ladder from Unranked to Radiant, with every division badge."
        count={divisions}
        countLabel="Tiers"
        image={ranks[ranks.length - 1]?.images.largeicon}
      />
      <WordsLight
        eyebrow="How it works"
        text="Win games to climb. Each rank has three divisions, from Iron through Immortal. Radiant sits alone at the top."
        accent={["climb", "three", "radiant"]}
      />
      <RankLadder
        ranks={ranks.map((r) => {
          const tiers = r.children.length ? r.children : [r];
          return {
            name: r.name,
            color: hexColor((r.children[0] ?? r).stats?.color),
            tiers: tiers.map((t) => ({ name: t.name, icon: t.images.largeicon ?? t.images.smallicon })),
          };
        })}
      />
    </>
  );
}
