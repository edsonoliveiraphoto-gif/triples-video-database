"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/lib/store";
import { S_BY_NAME } from "@/lib/triples";
import { useTheme } from "next-themes";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      {subtitle && <p className="mb-3 mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
      <div className="mt-3 h-64">{children}</div>
    </div>
  );
}

interface TooltipEntry {
  value: number;
  payload?: { unit?: string };
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[var(--bg-surface)] px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-zinc-100">{label}</p>
      <p className="mt-0.5 tabular-nums text-cyan-300">
        {payload[0].value.toLocaleString()} {payload[0].payload?.unit ?? "entries"}
      </p>
    </div>
  );
}

export function StatsView() {
  const dataset = useApp((s) => s.dataset);
  const facets = useApp((s) => s.facets);
  const { resolvedTheme } = useTheme();
  if (!dataset || !facets) return null;

  const isLight = resolvedTheme === "light";
  const PALETTE = isLight
    ? ["#0891b2", "#7c3aed", "#c026d3", "#06b6d4", "#8b5cf6", "#d946ef"]
    : ["#22d3ee", "#a78bfa", "#e879f9", "#67e8f9", "#c4b5fd", "#f0abfc"];
  const GRID = isLight ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.06)";
  const CURSOR = isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.04)";
  const BAR_CYAN = isLight ? "#0891b2" : "#22d3ee";
  const BAR_VIOLET = isLight ? "#7c3aed" : "#a78bfa";
  const BAR_FUCHSIA = isLight ? "#c026d3" : "#e879f9";

  const rows = dataset.rows;
  const subYes = facets.subCounts.YES ?? 0;
  const subNo = facets.subCounts.NO ?? 0;
  const subNA = facets.subCounts["N/A"] ?? 0;
  const withLinks = rows.filter((r) => r.link).length;

  const yearData = facets.years.map(([year, count]) => ({ name: year, count }));
  const typeData = facets.types.slice(0, 12).map(([name, count]) => ({ name, count }));
  const eraData = facets.eras.slice(0, 10).map(([name, count]) => ({ name, count }));
  const memberData = Object.entries(facets.memberCounts)
    .filter(([n]) => n in S_BY_NAME)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name: `${S_BY_NAME[name]} ${name}`,
      count,
    }));

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Database <span className="gradient-text">stats</span>
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          A snapshot of {rows.length.toLocaleString()} hand-entered entries, maintained since{" "}
          {dataset.meta.db.started}.
        </p>
      </div>

      {/* summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total entries", value: rows.length.toLocaleString() },
          { label: "Years covered", value: `${facets.years[0]?.[0] ?? "—"}–${facets.years[facets.years.length - 1]?.[0] ?? "—"}` },
          { label: "Content types", value: facets.types.length.toLocaleString() },
          { label: "ENG SUB ✓", value: `${Math.round((subYes / Math.max(rows.length, 1)) * 100)}%` },
          { label: "With links", value: withLinks.toLocaleString() },
          { label: "Curated by", value: "Steph" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Entries per year" subtitle="From pre-debut content to the current era">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {yearData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top content types" subtitle="Shorts dominate — tripleS never rests">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 30 }} barCategoryGap={4}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={84} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14} fill={BAR_CYAN} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Entries per era" subtitle="LOVE&POP and ASSEMBLE25 lead the catalogue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eraData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 30 }} barCategoryGap={4}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={110} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14} fill={BAR_VIOLET} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Member appearances" subtitle="Every S1–S24, by number of entries">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 30 }} barCategoryGap={2}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={100} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: CURSOR }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={11} fill={BAR_FUCHSIA} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ENG SUB breakdown */}
      <div className="glass-card mt-4 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-zinc-100">Subtitles availability</h3>
        <div className="mt-3 space-y-2.5">
          {[
            { label: "English subs available", count: subYes, cls: "bg-gradient-to-r from-cyan-400 to-cyan-300", w: subYes },
            { label: "Not applicable", count: subNA, cls: "bg-gradient-to-r from-violet-400 to-violet-300", w: subNA },
            { label: "No subs (yet)", count: subNo, cls: "bg-gradient-to-r from-fuchsia-400 to-fuchsia-300", w: subNo },
          ].map((s) => (
            <div key={s.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-zinc-300">{s.label}</span>
                <span className="tabular-nums text-zinc-500">
                  {s.count.toLocaleString()} · {Math.round((s.w / Math.max(rows.length, 1)) * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${s.cls}`}
                  style={{ width: `${(s.w / Math.max(rows.length, 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
