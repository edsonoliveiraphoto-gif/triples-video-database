"use client";

import { create } from "zustand";
import type { Dataset, Facets, Row } from "./triples";
import { buildHaystack, computeFacets } from "./triples";

export type ViewMode = "library" | "members" | "stats";
export type Layout = "grid" | "table";
export type SortKey = "new" | "old" | "az" | "dur";

const WATCHLIST_KEY = "tsvdb.watchlist";

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveWatchlist(ids: string[]) {
  try {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
  } catch {
    /* storage full or unavailable — ignore */
  }
}

interface AppState {
  dataset: Dataset | null;
  facets: Facets | null;
  haystacks: Map<string, string>;
  status: "loading" | "ready" | "error";
  source: "builtin" | "imported";

  view: ViewMode;
  layout: Layout;
  sort: SortKey;
  q: string;
  types: string[];
  eras: string[];
  years: string[];
  seasons: string[];
  chans: string[];
  members: string[];
  subs: string[];
  starredOnly: boolean;

  selected: Row | null;
  watchlist: string[];
  importOpen: boolean;

  setDataset: (ds: Dataset, source: "builtin" | "imported") => void;
  setError: () => void;
  setView: (v: ViewMode) => void;
  setLayout: (l: Layout) => void;
  setSort: (s: SortKey) => void;
  setQ: (q: string) => void;
  toggleFilter: (key: "types" | "eras" | "years" | "seasons" | "chans" | "members" | "subs", value: string) => void;
  filterByMember: (name: string) => void;
  clearFilters: () => void;
  setStarredOnly: (v: boolean) => void;
  select: (r: Row | null) => void;
  toggleStar: (id: string) => void;
  isStarred: (id: string) => boolean;
  setImportOpen: (v: boolean) => void;
}

export const useApp = create<AppState>((set, get) => ({
  dataset: null,
  facets: null,
  haystacks: new Map(),
  status: "loading",
  source: "builtin",

  view: "library",
  layout: "grid",
  sort: "new",
  q: "",
  types: [],
  eras: [],
  years: [],
  seasons: [],
  chans: [],
  members: [],
  subs: [],
  starredOnly: false,

  selected: null,
  watchlist: loadWatchlist(),
  importOpen: false,

  setDataset: (ds, source) => {
    const haystacks = new Map<string, string>();
    for (const r of ds.rows) haystacks.set(r.id, buildHaystack(r));
    set({
      dataset: ds,
      facets: computeFacets(ds.rows),
      haystacks,
      status: "ready",
      source,
    });
  },
  setError: () => set({ status: "error" }),

  setView: (v) => set({ view: v }),
  setLayout: (l) => set({ layout: l }),
  setSort: (s) => set({ sort: s }),
  setQ: (q) => set({ q }),

  toggleFilter: (key, value) => {
    const cur = get()[key];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    set({ [key]: next } as Partial<AppState>);
  },

  // Click a member anywhere (card chip, table cell, detail modal) to browse
  // only her appearances. Replaces the member facet, closes any open detail
  // modal and jumps back to the top of the library.
  filterByMember: (name) => {
    set((s) => ({
      members: s.members.length === 1 && s.members[0] === name ? s.members : [name],
      selected: null,
      view: "library",
    }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },

  clearFilters: () =>
    set({
      q: "",
      types: [],
      eras: [],
      years: [],
      seasons: [],
      chans: [],
      members: [],
      subs: [],
      starredOnly: false,
    }),

  setStarredOnly: (v) => set({ starredOnly: v }),

  select: (r) => set({ selected: r }),

  toggleStar: (id) => {
    const cur = get().watchlist;
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
    saveWatchlist(next);
    set({ watchlist: next });
  },

  isStarred: (id) => get().watchlist.includes(id),

  setImportOpen: (v) => set({ importOpen: v }),
}));

export interface FilterState {
  q: string;
  types: string[];
  eras: string[];
  years: string[];
  seasons: string[];
  chans: string[];
  members: string[];
  subs: string[];
  starredOnly: boolean;
  sort: SortKey;
}

export function filterRows(rows: Row[], f: FilterState, haystacks: Map<string, string>, watchlist: string[]): Row[] {
  const q = f.q.trim().toLowerCase();
  const hasType = f.types.length > 0;
  const hasEra = f.eras.length > 0;
  const hasYear = f.years.length > 0;
  const hasSeason = f.seasons.length > 0;
  const hasChan = f.chans.length > 0;
  const hasMember = f.members.length > 0;
  const hasSub = f.subs.length > 0;
  const anyFilter = q || hasType || hasEra || hasYear || hasSeason || hasChan || hasMember || hasSub || f.starredOnly;

  let out = rows.filter((r) => {
    if (f.starredOnly && !watchlist.includes(r.id)) return false;
    if (q && !(haystacks.get(r.id) || "").includes(q)) return false;
    if (hasType && !r.types.some((t) => f.types.includes(t))) return false;
    if (hasEra && !r.eras.some((t) => f.eras.includes(t))) return false;
    if (hasYear && !f.years.includes(r.date.slice(0, 4))) return false;
    if (hasSeason && !r.seasons.some((t) => f.seasons.includes(t))) return false;
    if (hasChan && !r.chans.some((t) => f.chans.includes(t))) return false;
    if (hasMember && !r.members.some((t) => f.members.includes(t))) return false;
    if (hasSub && !f.subs.includes(r.sub)) return false;
    return true;
  });

  const sort = f.sort;
  out = [...out].sort((a, b) => {
    if (sort === "new") return (b.date || "").localeCompare(a.date || "") || a.id.localeCompare(b.id);
    if (sort === "old") return (a.date || "").localeCompare(b.date || "") || a.id.localeCompare(b.id);
    if (sort === "az") return a.clean.localeCompare(b.clean) || a.id.localeCompare(b.id);
    // dur: longest first, nulls last
    const ad = a.durS ?? -1;
    const bd = b.durS ?? -1;
    return bd - ad || a.id.localeCompare(b.id);
  });
  return anyFilter || sort !== "new" ? out : out; // rows come pre-sorted newest-first
}

export function hasActiveFilters(f: {
  q: string;
  types: string[];
  eras: string[];
  years: string[];
  seasons: string[];
  chans: string[];
  members: string[];
  subs: string[];
  starredOnly: boolean;
}): boolean {
  return Boolean(
    f.q.trim() ||
    f.types.length ||
    f.eras.length ||
    f.years.length ||
    f.seasons.length ||
    f.chans.length ||
    f.members.length ||
    f.subs.length ||
    f.starredOnly,
  );
}
