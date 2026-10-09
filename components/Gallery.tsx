"use client";
import AccordionGallery from "./rb/AccordionGallery";

export type GalleryItem = { image: string; label: string; link: string };

/** Valorant-themed wrapper around the React Bits accordion gallery. */
export default function Gallery({ items, contain = false, height = 440, defaultIndex }: { items: GalleryItem[]; contain?: boolean; height?: number; defaultIndex?: number }) {
  return (
    <div className={contain ? "gallery gallery--contain" : "gallery"}>
      <AccordionGallery
        items={items}
        defaultIndex={defaultIndex ?? Math.floor(items.length / 2)}
        accentColor="#c6ff3d"
        overlayColor="#0a0a0b"
        textColor="#efece4"
        height={height}
        radius={4}
        expandRatio={0.5}
        tilt={6}
        trigger="hover"
      />
    </div>
  );
}
