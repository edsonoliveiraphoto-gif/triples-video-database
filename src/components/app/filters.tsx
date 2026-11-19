"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { S_BY_NAME } from "@/lib/triples";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
        active
          ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-200 shadow-[0_0_12px_-4px_rgba(34,211,238,0.6)]"
          : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-zinc-100",
      )}
    >
      {label}
      {typeof count === "number" && (
        <span className={cn("tabular-nums", active ? "text-cyan-300/70" : "text-zinc-500")}>
          {count}
        </span>
      )}
    </button>
  );
}

export function FilterBar() {
  const facets = useApp((s) => s.facets);
  const types = useApp((s) => s.types);
  const eras = useApp((s) => s.eras);
  const years = useApp((s) => s.years);
  const seasons = useApp((s) => s.seasons);
  const chans = useApp((s) => s.chans);
  const members = useApp((s) => s.members);
  const subs = useApp((s) => s.subs);
  const toggle = useApp((s) => s.toggleFilter);
  const clear = useApp((s) => s.clearFilters);
  const [advanced, setAdvanced] = useState(false);

  if (!facets) return null;

  const typeChips = facets.types.slice(0, 12);
  const eraChips = facets.eras.slice(0, 10);
  const chanChips = facets.chans.slice(0, 8);

  const anyActive =
    types.length || eras.length || years.length || seasons.length ||
    chans.length || members.length || subs.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:inline">
          Type
        </span>
        {typeChips.map(([t, c]) => (
          <Chip key={t} label={t} count={c} active={types.includes(t)} onClick={() => toggle("types", t)} />
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-100">
              All {facets.types.length}
              <ChevronDown className="size-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-80 w-72 overflow-y-auto border-white/10 bg-[var(--bg-surface)] backdrop-blur-xl" align="start">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              All content types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {facets.types.map(([t, c]) => (
                <Chip key={t} label={t} count={c} active={types.includes(t)} onClick={() => toggle("types", t)} />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />

        <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:inline">
          Era
        </span>
        {eraChips.map(([t, c]) => (
          <Chip key={t} label={t} count={c} active={eras.includes(t)} onClick={() => toggle("eras", t)} />
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-100">
              All {facets.eras.length}
              <ChevronDown className="size-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-80 w-72 overflow-y-auto border-white/10 bg-[var(--bg-surface)] backdrop-blur-xl" align="start">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">All eras</p>
            <div className="flex flex-wrap gap-1.5">
              {facets.eras.map(([t, c]) => (
                <Chip key={t} label={t} count={c} active={eras.includes(t)} onClick={() => toggle("eras", t)} />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />

        {facets.years.map(([y, c]) => (
          <Chip key={y} label={y} count={c} active={years.includes(y)} onClick={() => toggle("years", y)} />
        ))}
      </div>

      {/* members + advanced toggle */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                members.length
                  ? "border-violet-300/50 bg-violet-400/15 text-violet-200"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100",
              )}
            >
              Members
              {members.length > 0 && (
                <>
                  <span className="text-violet-300/70 tabular-nums">{members.length}</span>
                  <X
                    className="size-3 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      members.forEach((m) => toggle("members", m));
                    }}
                  />
                </>
              )}
              {members.length === 0 && <ChevronDown className="size-3" />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 border-white/10 bg-[var(--bg-surface)] backdrop-blur-xl" align="start">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Member appearances
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(facets.memberCounts)
                .filter(([n]) => n in S_BY_NAME)
                .sort((a, b) => parseInt(S_BY_NAME[a[0]].slice(1)) - parseInt(S_BY_NAME[b[0]].slice(1)))
                .map(([name, c]) => (
                  <button
                    key={name}
                    onClick={() => toggle("members", name)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors",
                      members.includes(name)
                        ? "border-violet-300/50 bg-violet-400/15 text-violet-100"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
                    )}
                  >
                    <span className="gradient-text shrink-0 font-mono text-[10px] font-bold">
                      {S_BY_NAME[name]}
                    </span>
                    <span className="truncate font-medium">{name}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-zinc-500">{c}</span>
                  </button>
                ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* ENG SUB segmented */}
        <div className="inline-flex overflow-hidden rounded-full border border-white/10 bg-white/5">
          {(["YES", "NO", "N/A"] as const).map((v) => (
            <button
              key={v}
              onClick={() => toggle("subs", v)}
              aria-pressed={subs.includes(v)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                subs.includes(v) ? "bg-cyan-400/20 text-cyan-200" : "text-zinc-400 hover:text-zinc-100",
              )}
            >
              {v === "YES" ? "ENG SUB ✓" : v === "NO" ? "No subs" : "N/A"}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdvanced((a) => !a)}
          className="h-7 gap-1 px-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        >
          <SlidersHorizontal className="size-3.5" />
          {advanced ? "Hide" : "Season & channel"}
        </Button>

        {anyActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="h-7 gap-1 px-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Button>
        )}
      </div>

      {advanced && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Season
          </span>
          {facets.seasons.map(([t, c]) => (
            <Chip key={t} label={t} count={c} active={seasons.includes(t)} onClick={() => toggle("seasons", t)} />
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Channel
          </span>
          {chanChips.map(([t, c]) => (
            <Chip key={t} label={t} count={c} active={chans.includes(t)} onClick={() => toggle("chans", t)} />
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-100">
                All {facets.chans.length}
                <ChevronDown className="size-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-h-80 w-80 overflow-y-auto border-white/10 bg-[var(--bg-surface)] backdrop-blur-xl" align="start">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                All source channels
              </p>
              <div className="flex flex-wrap gap-1.5">
                {facets.chans.map(([t, c]) => (
                  <Chip key={t} label={t} count={c} active={chans.includes(t)} onClick={() => toggle("chans", t)} />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
