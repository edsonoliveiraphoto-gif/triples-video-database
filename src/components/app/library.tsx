"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownWideNarrow, Bookmark, ExternalLink } from "lucide-react";
import { filterRows, useApp, type Layout } from "@/lib/store";
import { formatDate, formatDur, type Row } from "@/lib/triples";
import { ContentCard } from "./content-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const GRID_CHUNK = 60;
const TABLE_CHUNK = 100;

function useFilteredRows() {
  const dataset = useApp((s) => s.dataset);
  const haystacks = useApp((s) => s.haystacks);
  const q = useApp((s) => s.q);
  const types = useApp((s) => s.types);
  const eras = useApp((s) => s.eras);
  const years = useApp((s) => s.years);
  const seasons = useApp((s) => s.seasons);
  const chans = useApp((s) => s.chans);
  const members = useApp((s) => s.members);
  const subs = useApp((s) => s.subs);
  const sort = useApp((s) => s.sort);
  const starredOnly = useApp((s) => s.starredOnly);
  const watchlist = useApp((s) => s.watchlist);

  return useMemo(() => {
    if (!dataset) return [] as Row[];
    return filterRows(
      dataset.rows,
      { q, types, eras, years, seasons, chans, members, subs, starredOnly, sort },
      haystacks,
      watchlist,
    );
    // watchlist identity changes force re-filter when starredOnly is on
  }, [dataset, haystacks, q, types, eras, years, seasons, chans, members, subs, sort, starredOnly, watchlist]);
}

export function Library() {
  const rows = useFilteredRows();
  const layout = useApp((s) => s.layout);
  const sort = useApp((s) => s.sort);
  const setSort = useApp((s) => s.setSort);
  const select = useApp((s) => s.select);
  const dataset = useApp((s) => s.dataset);
  const watchlist = useApp((s) => s.watchlist);
  const toggleStar = useApp((s) => s.toggleStar);
  const filterByMember = useApp((s) => s.filterByMember);

  // Reset the visible slice whenever results or layout change — adjusted during
  // render (React-sanctioned pattern) instead of a cascading effect.
  const [page, setPage] = useState<{ rows: Row[] | null; layout: Layout; n: number }>({
    rows: null,
    layout: "grid",
    n: GRID_CHUNK,
  });
  if (page.rows !== rows || page.layout !== layout) {
    setPage({ rows, layout, n: layout === "grid" ? GRID_CHUNK : TABLE_CHUNK });
  }
  const limit = page.n;
  const setLimit = (updater: (n: number) => number) =>
    setPage((p) => ({ ...p, n: updater(p.n) }));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLimit((l) => (l < rows.length ? l + (layout === "grid" ? GRID_CHUNK : TABLE_CHUNK) : l));
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rows.length, layout]);

  const visible = rows.slice(0, limit);

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6">
      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="text-sm text-zinc-400" aria-live="polite">
          <span className="font-semibold text-zinc-100 tabular-nums">
            {rows.length.toLocaleString()}
          </span>{" "}
          {rows.length === 1 ? "entry" : "entries"}
          {rows.length !== dataset?.rows.length && (
            <span className="text-zinc-500"> of {dataset?.rows.length.toLocaleString()}</span>
          )}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <ArrowDownWideNarrow className="size-4 text-zinc-500" />
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger
              className="h-8 w-[130px] border-white/10 bg-white/5 text-xs text-zinc-300"
              aria-label="Sort order"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[var(--bg-surface)] text-zinc-200">
              <SelectItem value="new">Newest first</SelectItem>
              <SelectItem value="old">Oldest first</SelectItem>
              <SelectItem value="az">A – Z</SelectItem>
              <SelectItem value="dur">Longest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-lg font-medium text-zinc-200">Nothing in this corner of the cosmos</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try removing a filter or searching for something else.
          </p>
        </div>
      )}

      {layout === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((r) => (
            <ContentCard key={r.id} row={r} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-left text-[10px] uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Type</th>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Members</th>
                <th className="px-3 py-2 font-semibold">Era</th>
                <th className="px-3 py-2 font-semibold">Sub</th>
                <th className="px-3 py-2 font-semibold">Dur</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => select(r)}
                  className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.05]"
                >
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums text-zinc-400">
                    {formatDate(r.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-cyan-200/80">
                    {r.types[0] || "—"}
                  </td>
                  <td className="max-w-[380px] truncate px-3 py-2 text-zinc-200">{r.clean}</td>
                  <td className="max-w-[180px] px-3 py-2 text-xs text-zinc-500">
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                      {r.members.slice(0, 6).map((m, i) => (
                        <span key={m} className="inline-flex items-center gap-1">
                          {i > 0 && <span className="text-zinc-700">·</span>}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              filterByMember(m);
                            }}
                            title={`Filter library by ${m}`}
                            className="cursor-pointer truncate underline-offset-2 transition-colors hover:text-cyan-300 hover:underline"
                          >
                            {m}
                          </button>
                        </span>
                      ))}
                      {r.members.length > 6 && (
                        <span className="text-zinc-600">+{r.members.length - 6}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-500">
                    {r.eras[0] || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                        r.sub === "YES"
                          ? "bg-cyan-400/20 text-cyan-200"
                          : "bg-white/5 text-zinc-500",
                      )}
                    >
                      {r.sub}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-zinc-400">
                    {formatDur(r.durS, r.dur)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(r.id);
                        }}
                        aria-label="Save to watchlist"
                        className={cn(
                          "rounded p-1 transition-colors",
                          watchlist.includes(r.id)
                            ? "text-fuchsia-300"
                            : "text-zinc-500 hover:text-zinc-200",
                        )}
                      >
                        <Bookmark
                          className={cn("size-3.5", watchlist.includes(r.id) && "fill-current")}
                        />
                      </button>
                      {r.link && (
                        <a
                          href={r.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Open video"
                          className="rounded p-1 text-zinc-500 transition-colors hover:text-cyan-300"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {limit < rows.length && (
        <div className="mt-8 flex justify-center" ref={sentinelRef}>
          <Button
            variant="outline"
            onClick={() =>
              setLimit((l) => l + (layout === "grid" ? GRID_CHUNK : TABLE_CHUNK))
            }
            className="border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
          >
            Load more ({(rows.length - limit).toLocaleString()} remaining)
          </Button>
        </div>
      )}
    </section>
  );
}
