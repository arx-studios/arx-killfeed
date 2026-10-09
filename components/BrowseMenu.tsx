"use client";
import { useRouter } from "next/navigation";
import BranchedMenu from "./rb/BranchedMenu";

type Group = { label: string; children: { value: string; label: string }[] };

/** Tree of groups (roles / weapon classes) -> items; selecting an item navigates to its page. */
export default function BrowseMenu({ groups, current, base }: { groups: Group[]; current: string; base: string }) {
  const router = useRouter();
  const open = Math.max(
    groups.findIndex((g) => g.children.some((c) => c.value === current)),
    0
  );
  return (
    <nav className="browse-menu" aria-label="Browse">
      <BranchedMenu
        items={groups}
        defaultOpen={[open]}
        defaultActive={current}
        onSelect={(value) => router.push(`${base}/${value}`)}
        color="#efece4"
        accentColor="#c6ff3d"
        lineColor="#2a2a2e"
        width={220}
        rowHeight={34}
        fontSize={14}
      />
    </nav>
  );
}
