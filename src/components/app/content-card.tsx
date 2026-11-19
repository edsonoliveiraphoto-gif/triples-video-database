"use client";

import { memo, useState } from "react";
import { Bookmark, ExternalLink, Play } from "lucide-react";
import { useApp } from "@/lib/store";
import { formatDate, formatDur, thumbUrl, S_BY_NAME, type Row } from "@/lib/triples";
import { cn } from "@/lib/utils";

function Thumb({ row, big = false }: { row: Row; big?: boolean }) {
  const [failed, setFailed] = useState(false);
  const url = thumbUrl(row, big ? "hq" : "mq");
  if (!url || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/15">
        <Play className="size-8 text-zinc-600" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );
}

export const ContentCard = memo(function ContentCard({ row }: { row: Row }) {
  const select = useApp((s) => s.select);
  const toggleStar = useApp((s) => s.toggleStar);
  const filterByMember = useApp((s) => s.filterByMember);
  const starred = useApp((s) => s.watchlist.includes(row.id));
  const type = row.types[0] || "Misc";

  return (
    <article
      onClick={() => select(row)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_8px_40px_-16px_rgba(34,211,238,0.45)]"
    >
      <div className="relative aspect-video overflow-hidden">
        <Thumb row={row} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        {/* badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#a5f3fc] backdrop-blur-sm">
            {type}
          </span>
          {row.sub === "YES" && (
            <span className="rounded-md bg-cyan-400/25 px-1.5 py-0.5 text-[10px] font-semibold text-[#cffafe] backdrop-blur-sm">
              ENG SUB
            </span>
          )}
        </div>

        {row.dur && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-[#e4e4e7] backdrop-blur-sm">
            {formatDur(row.durS, row.dur)}
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-black/50 backdrop-blur-md">
            <Play className="size-5 fill-[#ffffff] text-[#ffffff]" />
          </span>
        </div>

        {/* quick actions */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(row.id);
            }}
            aria-label={starred ? "Remove from watchlist" : "Save to watchlist"}
            className={cn(
              "flex size-7 items-center justify-center rounded-md bg-black/60 backdrop-blur-sm transition-colors",
              starred ? "text-[#f0abfc]" : "text-[#cbd5e1] hover:text-[#f4f4f5]",
            )}
          >
            <Bookmark className={cn("size-3.5", starred && "fill-current")} />
          </button>
          {row.link && (
            <a
              href={row.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open video in new tab"
              className="flex size-7 items-center justify-center rounded-md bg-black/60 text-[#cbd5e1] backdrop-blur-sm transition-colors hover:text-[#67e8f9]"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-tight text-zinc-100 group-hover:text-white">
          {row.clean}
        </h3>

        <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="tabular-nums">{formatDate(row.date)}</span>
          {row.eras[0] && (
            <span className="truncate rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400">
              {row.eras.join(" · ")}
            </span>
          )}
        </div>

        {row.members.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {row.members.slice(0, 8).map((m) => {
              const sn = S_BY_NAME[m];
              return (
                <button
                  key={m}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    filterByMember(m);
                  }}
                  title={`Filter library by ${sn ? `${sn} · ${m}` : m}`}
                  aria-label={`Filter library by ${m}`}
                  className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-cyan-400/20 to-violet-400/20 text-[8px] font-bold tracking-tight text-zinc-200 transition-all duration-200 hover:border-cyan-300/60 hover:bg-cyan-400/30 hover:text-white hover:shadow-[0_0_12px_-4px_rgba(34,211,238,0.8)]"
                >
                  {sn ?? m.slice(0, 2)}
                </button>
              );
            })}
            {row.members.length > 8 && (
              <span className="text-[10px] text-zinc-500">+{row.members.length - 8}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
