export type Sub = "YES" | "NO" | "N/A";

export interface Row {
  id: string;
  name: string;
  clean: string;
  date: string;
  types: string[];
  title: string;
  dur: string;
  durS: number | null;
  link: string;
  alt: string;
  sub: string;
  members: string[];
  units: string[];
  kw: string[];
  tags: string[];
  eras: string[];
  seasons: string[];
  chans: string[];
  ep: string;
  series: string[];
  ssn: number | string | null;
  notes: string;
  yt: string | null;
}

export interface MemberInfo {
  s: string;
  name: string;
  full: string;
  units: string[];
}

export interface DbMeta {
  title: string;
  curator: string;
  entries: number;
  started: string;
  lastUpdated: string;
  url: string;
}

export interface Dataset {
  meta: {
    version: number;
    generatedAt: string;
    source: string;
    importedAt?: string;
    db: DbMeta;
  };
  members: MemberInfo[];
  rows: Row[];
}

export interface Facets {
  types: [string, number][];
  eras: [string, number][];
  seasons: [string, number][];
  years: [string, number][];
  chans: [string, number][];
  memberCounts: Record<string, number>;
  subCounts: Record<string, number>;
}

export const UNIT_NAMES = new Set([
  "ASSEMBLE", "ASSEMBLE24", "ASSEMBLE25", "ASSEMBLE26",
  "LOVElution", "EVOLution", "Acid Angel From Asia", "+(KR)ystal Eyes",
  "Visionary Vision", "NXT", "ARIA", "GLOW", "∞ (Hatchi)", "Hatchi",
  "msnz", "A24 Unit A", "A24 Unit B", "A25 Unit A", "A25 Unit B",
  "moon", "sun", "zenith", "neptune", "Alphie",
]);

export const MEMBER_REGISTRY: [string, string, string][] = [
  ["S1", "Seoyeon", "Yoon Seoyeon"],
  ["S2", "Hyerin", "Jeong Hyerin"],
  ["S3", "Jiwoo", "Lee Jiwoo"],
  ["S4", "Chaeyeon", "Kim Chaeyeon"],
  ["S5", "Yooyeon", "Kim Yooyeon"],
  ["S6", "Soomin", "Kim Soomin"],
  ["S7", "Nakyoung", "Kim Nakyoung"],
  ["S8", "Yubin", "Gong Yubin"],
  ["S9", "Kaede", "Kaede"],
  ["S10", "Dahyun", "Seo Dahyun"],
  ["S11", "Kotone", "Kotone"],
  ["S12", "Yeonji", "Kwak Yeonji"],
  ["S13", "Nien", "Nien"],
  ["S14", "Sohyun", "Park Sohyun"],
  ["S15", "Xinyu", "Xinyu"],
  ["S16", "Mayu", "Mayu"],
  ["S17", "Lynn", "Lynn"],
  ["S18", "Joobin", "Joobin"],
  ["S19", "Hayeon", "Jeong Hayeon"],
  ["S20", "Shion", "Park Shion"],
  ["S21", "Chaewon", "Kim Chaewon"],
  ["S22", "Sullin", "Sullin"],
  ["S23", "Seoah", "Seoah"],
  ["S24", "Jiyeon", "Jiyeon"],
];

export const S_BY_NAME: Record<string, string> = Object.fromEntries(
  MEMBER_REGISTRY.map(([s, n]) => [n, s]),
);
export const NAME_BY_S: Record<string, string> = Object.fromEntries(
  MEMBER_REGISTRY.map(([s, n]) => [s, n]),
);

/** Precomputed lowercase haystack for search. */
export function buildHaystack(r: Row): string {
  return [
    r.clean, r.name, r.title,
    r.members.join(" "), r.units.join(" "),
    r.kw.join(" "), r.tags.join(" "), r.chans.join(" "),
    r.eras.join(" "), r.series.join(" "), r.notes,
  ].join(" ").toLowerCase();
}

export function computeFacets(rows: Row[]): Facets {
  const types: Record<string, number> = {};
  const eras: Record<string, number> = {};
  const seasons: Record<string, number> = {};
  const years: Record<string, number> = {};
  const chans: Record<string, number> = {};
  const memberCounts: Record<string, number> = {};
  const subCounts: Record<string, number> = {};
  const bump = (m: Record<string, number>, k: string) => {
    if (k) m[k] = (m[k] || 0) + 1;
  };
  for (const r of rows) {
    for (const t of r.types) bump(types, t);
    for (const e of r.eras) bump(eras, e);
    for (const s of r.seasons) bump(seasons, s);
    const y = r.date.slice(0, 4);
    if (/^\d{4}$/.test(y)) bump(years, y);
    for (const c of r.chans) bump(chans, c);
    for (const m of r.members) bump(memberCounts, m);
    bump(subCounts, r.sub);
  }
  const sorted = (m: Record<string, number>): [string, number][] =>
    Object.entries(m).sort((a, b) => b[1] - a[1]);
  return {
    types: sorted(types),
    eras: sorted(eras),
    seasons: sorted(seasons),
    years: Object.entries(years).sort((a, b) => a[0].localeCompare(b[0])),
    chans: sorted(chans),
    memberCounts,
    subCounts,
  };
}

export function thumbUrl(r: Row, quality: "mq" | "hq"): string | null {
  if (!r.yt) return null;
  return `https://i.ytimg.com/vi/${r.yt}/${quality === "mq" ? "mqdefault" : "hqdefault"}.jpg`;
}

export function formatDur(durS: number | null, dur: string): string {
  if (dur) return dur;
  if (durS == null) return "—";
  const h = Math.floor(durS / 3600);
  const m = Math.floor((durS % 3600) / 60);
  const s = durS % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export function formatDate(date: string): string {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${y}.${m}.${d}`;
}
