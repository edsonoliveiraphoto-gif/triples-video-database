"use client";

import { Search, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";

export function Hero() {
  const setQ = useApp((s) => s.setQ);
  const q = useApp((s) => s.q);
  const dataset = useApp((s) => s.dataset);
  const facets = useApp((s) => s.facets);

  const db = dataset?.meta.db;
  const rows = dataset?.rows.length ?? 0;
  const years =
    facets && facets.years.length > 1
      ? `${facets.years[0][0]}–${facets.years[facets.years.length - 1][0]}`
      : facets?.years[0]?.[0] ?? "2022–2026";

  return (
    <section className="relative px-4 pb-8 pt-14 text-center sm:pt-20">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
        <Sparkles className="size-3.5 text-cyan-300" />
        The unofficial archive of every tripleS video
      </p>

      <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
        <span className="gradient-text">tripleS</span>{" "}
        <span className="text-zinc-100">video database</span>
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
        {rows > 0 ? (
          <>
            <span className="text-zinc-200">{rows.toLocaleString()} entries</span> — official
            releases, SIGNAL, variety, fancams, Cosmo lives, web dramas &amp; more, from {years}.
            Hand-curated over three years by{" "}
            <a
              href={db?.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline-offset-2 hover:underline"
            >
              Steph (@wavsteph)
            </a>
            .
          </>
        ) : (
          <>Loading the universe…</>
        )}
      </p>

      {/* central search */}
      <div className="relative mx-auto mt-8 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles, members, keywords, shows…"
          className="h-12 rounded-2xl border-white/15 bg-white/5 pl-11 text-base text-zinc-100 shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)] placeholder:text-zinc-500 focus-visible:ring-cyan-400/50"
          aria-label="Search the database"
          autoFocus
        />
      </div>

      {/* quick stats */}
      {dataset && (
        <dl className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Entries", value: rows.toLocaleString() },
            { label: "Members", value: "24 (S1–S24)" },
            { label: "ENG SUB", value: `${Math.round(((dataset.rows.filter((r) => r.sub === "YES").length) / Math.max(rows, 1)) * 100)}% subbed` },
            { label: "Last updated", value: "2026.11.10" },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl px-3 py-2.5 text-left"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {s.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-zinc-100">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
