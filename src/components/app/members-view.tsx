"use client";

import { ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import type { MemberInfo } from "@/lib/triples";

function MemberCard({ m, count }: { m: MemberInfo; count: number }) {
  const filterByMember = useApp((s) => s.filterByMember);

  const browse = () => filterByMember(m.name);

  return (
    <button
      onClick={browse}
      className="group glass-card relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-[0_10px_40px_-16px_rgba(167,139,250,0.5)]"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-violet-400/15 to-cyan-400/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <span className="gradient-text font-mono text-3xl font-bold">{m.s}</span>
      <h3 className="mt-2 text-lg font-semibold text-white">{m.name}</h3>
      <p className="text-xs text-zinc-500">{m.full}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {m.units.slice(0, 5).map((u) => (
          <span
            key={u}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400"
          >
            {u}
          </span>
        ))}
        {m.units.length > 5 && (
          <span className="px-1 text-[10px] text-zinc-600">+{m.units.length - 5}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-zinc-500">
          <span className="font-semibold text-zinc-200 tabular-nums">
            {count.toLocaleString()}
          </span>{" "}
          appearances
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-cyan-300 opacity-0 transition-opacity group-hover:opacity-100">
          Browse
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </button>
  );
}

export function MembersView() {
  const dataset = useApp((s) => s.dataset);
  const facets = useApp((s) => s.facets);
  if (!dataset || !facets) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          The 24 <span className="gradient-text">members</span>
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Revealed as S1 – S24 between 2022 and 2024. Click a member to browse everything she
          appears in.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {dataset.members.map((m) => (
          <MemberCard key={m.s} m={m} count={facets.memberCounts[m.name] ?? 0} />
        ))}
      </div>
    </section>
  );
}
