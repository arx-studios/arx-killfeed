"use client";
import LineSidebar from "./rb/LineSidebar";

/** Sticky section index; clicking scrolls to the section with the matching id. */
export default function SideIndex({ items }: { items: { id: string; label: string }[] }) {
  return (
    <aside className="side-index" aria-label="Sections">
      <LineSidebar
        items={items.map((i) => i.label)}
        accentColor="#c6ff3d"
        textColor="#8c8981"
        markerColor="#2a2a2e"
        markerLength={36}
        maxShift={14}
        itemGap={14}
        fontSize={1}
        proximityRadius={80}
        onItemClick={(i) => {
          const el = document.getElementById(items[i].id);
          if (!el) return;
          if (window.__lenis) window.__lenis.scrollTo(el, { offset: -110 });
          else el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </aside>
  );
}
