"use client";

import type { Dataset, Row } from "./triples";
import { S_BY_NAME, UNIT_NAMES } from "./triples";

/** Expected CSV headers (same as the bundled export CSV). */
export const CSV_HEADERS = [
  "Name", "Date", "Type", "Title", "Duration", "Link", "ENG SUB",
  "Member Appearances", "Keywords", "Tags", "Era", "Season",
  "Source Channel", "Episode #", "Series", "Series Season", "Notes",
  "Source/Alt Link", "Notion Row ID",
];

/** Robust CSV parser: handles quotes, embedded commas/newlines, BOM. */
export function parseCSV(text: string): string[][] {
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function splitMulti(value: string): string[] {
  const out: string[] = [];
  for (const part of (value || "").split(",")) {
    const p = part.trim();
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

function ytId(link: string): string | null {
  if (!link) return null;
  const l = link.trim();
  const patterns = [
    /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const p of patterns) {
    const m = l.match(p);
    if (m) return m[1];
  }
  if (l.includes("youtu.be/")) {
    const tail = l.split("youtu.be/")[1]?.split("?")[0];
    if (tail && /^[A-Za-z0-9_-]{6,}$/.test(tail)) return tail;
  }
  return null;
}

function durSeconds(text: string): number | null {
  if (!text) return null;
  const parts = text.trim().split(":");
  try {
    const nums = parts.map((p) => parseInt(p, 10));
    if (nums.some(Number.isNaN) || nums.length === 0 || nums.length > 3) return null;
    let secs = 0;
    for (const n of nums) secs = secs * 60 + n;
    return secs;
  } catch {
    return null;
  }
}

const NAME_PREFIX = /^\d{4}\.\d{1,2}\.\d{1,2}\s*(\[[^\]]*\])?\s*/;

function cleanName(name: string, title: string): string {
  const n = (name || "").trim();
  const stripped = n.replace(NAME_PREFIX, "").trim();
  if (stripped) return stripped;
  const t = (title || "").trim();
  if (t) return t;
  if (n) return n;
  return "(untitled)";
}

export interface ImportResult {
  rows: Row[];
  skipped: number;
}

/** Convert parsed CSV (in export format) into app Row objects. */
export function rowsFromCSV(table: string[][]): ImportResult {
  if (table.length < 2) return { rows: [], skipped: 0 };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const idx: Record<string, number> = {};
  header.forEach((h, i) => {
    idx[h] = i;
  });
  const col = (name: string) => idx[name.toLowerCase()] ?? -1;
  const get = (r: string[], name: string) => {
    const i = col(name);
    return i >= 0 ? (r[i] ?? "").trim() : "";
  };

  const rows: Row[] = [];
  let skipped = 0;
  for (let i = 1; i < table.length; i++) {
    const r = table[i];
    if (!r || r.length === 1 && !r[0]?.trim()) continue;
    const rawName = get(r, "Name");
    const rawTitle = get(r, "Title");
    if (!rawName && !rawTitle && !get(r, "Link")) {
      skipped++;
      continue;
    }
    const rawDate = get(r, "Date");
    const date = rawDate.split("~")[0].trim();
    const memberTokens = splitMulti(get(r, "Member Appearances"));
    const subRaw = get(r, "ENG SUB").toUpperCase();
    const sub = subRaw === "YES" || subRaw === "NO" ? subRaw : "N/A";
    const link = get(r, "Link");
    const ssnRaw = get(r, "Series Season");
    const ssnNum = parseInt(ssnRaw, 10);
    rows.push({
      id: get(r, "Notion Row ID") || `csv-${i}`,
      name: rawName,
      clean: cleanName(rawName, rawTitle),
      date,
      types: splitMulti(get(r, "Type")),
      title: rawTitle,
      dur: get(r, "Duration"),
      durS: durSeconds(get(r, "Duration")),
      link,
      alt: get(r, "Source/Alt Link"),
      sub,
      members: memberTokens.filter((t) => t in S_BY_NAME),
      units: memberTokens.filter((t) => UNIT_NAMES.has(t)),
      kw: splitMulti(get(r, "Keywords")),
      tags: splitMulti(get(r, "Tags")),
      eras: splitMulti(get(r, "Era")),
      seasons: splitMulti(get(r, "Season")),
      chans: splitMulti(get(r, "Source Channel")),
      ep: get(r, "Episode #"),
      series: splitMulti(get(r, "Series")),
      ssn: Number.isNaN(ssnNum) ? (ssnRaw || null) : ssnNum,
      notes: get(r, "Notes"),
      yt: ytId(link),
    });
  }
  rows.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return { rows, skipped };
}

export function datasetFromImported(rows: Row[], base: Dataset): Dataset {
  return {
    meta: {
      ...base.meta,
      source: "csv",
      importedAt: new Date().toISOString(),
      db: { ...base.meta.db, entries: rows.length },
    },
    members: base.members,
    rows,
  };
}
