import fs from "node:fs";
import path from "node:path";

// The pipeline writes everything under ../images; public/images is a junction to it locally
// and a real (committed) folder on hosts like Vercel, so read through public/ first.
const pick = (...ps: string[]) => ps.find((p) => fs.existsSync(p)) ?? ps[0];
const IMAGES = pick(path.join(process.cwd(), "public", "images"), path.join(process.cwd(), "..", "images"));
const VERSION = pick(path.join(process.cwd(), "public", "version.json"), path.join(process.cwd(), "..", "version.json"));

export type Node = {
  name: string;
  key: string;
  slug: string;
  images: Record<string, string>;
  stats: any;
  children: Node[];
};

const label = (f: string) => f.replace(/^\d\d_/, "").replace(/_/g, " ");
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Same folder-name rule as pipeline.py */
export const safe = (s: string) =>
  (s || "").replace(/[<>:"/\|?*']/g, "").trim().replace(/\s+/g, "_").replace(/^[. ]+|[. ]+$/g, "");

function read(dir: string, rel: string): Node {
  const key = path.basename(dir);
  const n: Node = { name: label(key), key, slug: slug(label(key)), images: {}, stats: null, children: [] };
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) n.children.push(read(full, `${rel}/${e.name}`));
    else if (e.name === "stats.json") n.stats = JSON.parse(fs.readFileSync(full, "utf8"));
    else n.images[path.parse(e.name).name] = `/images/${rel.split("/").map(encodeURIComponent).join("/")}/${encodeURIComponent(e.name)}`;
  }
  return n;
}

let cache: Record<string, Node[]> | null = null;
function all() {
  if (cache) return cache;
  cache = {};
  for (const d of fs.readdirSync(IMAGES, { withFileTypes: true })) {
    if (d.isDirectory()) cache[d.name] = read(path.join(IMAGES, d.name), d.name).children;
  }
  return cache;
}

export const section = (name: string): Node[] => all()[name] ?? [];

export function version(): any {
  try {
    return JSON.parse(fs.readFileSync(VERSION, "utf8")).data;
  } catch {
    return {};
  }
}

// ---- agents -----------------------------------------------------------------
export const roles = () => section("Agents"); // role nodes, agents as children
export const agentList = () => roles().flatMap((r) => r.children.map((a) => ({ ...a, role: r })));
export const findAgent = (s: string) => agentList().find((a) => a.slug === s);

/** Ability nodes in the same order as the agent's stats.abilities (slot order). */
export function abilitiesOf(agent: Node) {
  const folder = agent.children.find((c) => c.key === "abilities");
  const byKey = new Map((folder?.children ?? []).map((c) => [c.key, c]));
  return (agent.stats?.abilities ?? []).map((a: any) => ({ ...a, node: byKey.get(safe(a.displayName)) ?? null }));
}

// ---- weapons ----------------------------------------------------------------
export const weaponClasses = () => section("Weapons"); // class nodes, weapons as children
export const weaponList = () => weaponClasses().flatMap((c) => c.children.map((w) => ({ ...w, cls: c })));
export const findWeapon = (s: string) => weaponList().find((w) => w.slug === s);

export function weaponMax() {
  const max = { fireRate: 0, magazineSize: 0, runSpeedMultiplier: 0, equipTimeSeconds: 0, reloadTimeSeconds: 0 };
  for (const w of weaponList()) {
    if (!w.stats) continue;
    for (const k of Object.keys(max)) max[k] = Math.max(max[k], w.stats[k] ?? 0);
  }
  return max;
}

// ---- maps -------------------------------------------------------------------
export const mapList = () => section("Maps");
export const findMap = (s: string) => mapList().find((m) => m.slug === s);

// ---- ranks ------------------------------------------------------------------
export const rankList = () => section("Competitive_Tiers");

export const hexColor = (c?: string) => (c ? `#${c.slice(0, 6)}` : "#ece8e1");

export const clean = (s?: string) => (s ?? "").replace(/^E[A-Za-z]+::/, "").replace(/([a-z])([A-Z])/g, "$1 $2");
