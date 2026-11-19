"use client";

import { useState } from "react";
import { Bookmark, Check, Copy, ExternalLink, Link2, Play } from "lucide-react";
import { useApp } from "@/lib/store";
import { formatDate, formatDur, thumbUrl } from "@/lib/triples";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-200">{children}</dd>
    </div>
  );
}

function Thumbs({ yt }: { yt: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!yt || failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/15">
        <Play className="size-10 text-zinc-700" />
      </div>
    );
  }
  return (
    <img
      src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="aspect-video w-full rounded-xl border border-white/10 object-cover"
    />
  );
}

export function DetailModal() {
  const row = useApp((s) => s.selected);
  const select = useApp((s) => s.select);
  const toggleStar = useApp((s) => s.toggleStar);
  const filterByMember = useApp((s) => s.filterByMember);
  const activeMembers = useApp((s) => s.members);
  const starred = useApp((s) => (row ? s.watchlist.includes(row.id) : false));
  const members = useApp((s) => s.dataset?.members) ?? [];
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!row?.link) return;
    try {
      await navigator.clipboard.writeText(row.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && select(null)}>
      {row && (
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-white/10 bg-[var(--bg-modal)] backdrop-blur-2xl sm:rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{row.clean}</DialogTitle>
            <DialogDescription>Database entry details</DialogDescription>
          </DialogHeader>

          <Thumbs yt={row.yt} />

          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-balance text-lg font-semibold leading-snug text-white">
                {row.clean}
              </h2>
              {row.name !== row.clean && (
                <p className="mt-1 text-xs text-zinc-500">{row.name}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {row.link ? (
                <Button asChild className="bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:opacity-90">
                  <a href={row.link} target="_blank" rel="noopener noreferrer">
                    <Play className="size-4 fill-current" />
                    Watch
                  </a>
                </Button>
              ) : (
                <Button disabled variant="outline" className="border-white/10 bg-white/5 text-zinc-500">
                  No link available
                </Button>
              )}
              {row.alt && (
                <Button asChild variant="outline" className="border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10">
                  <a href={row.alt} target="_blank" rel="noopener noreferrer">
                    <Link2 className="size-4" />
                    Alt link
                  </a>
                </Button>
              )}
              {row.link && (
                <Button
                  variant="outline"
                  onClick={copyLink}
                  className="border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
                >
                  {copied ? <Check className="size-4 text-cyan-300" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => toggleStar(row.id)}
                className={cn(
                  "border-white/15 bg-white/5 hover:bg-white/10",
                  starred
                    ? "border-fuchsia-400/40 text-fuchsia-300"
                    : "text-zinc-200",
                )}
              >
                <Bookmark className={cn("size-4", starred && "fill-current")} />
                {starred ? "Saved" : "Save"}
              </Button>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:grid-cols-3">
              <Field label="Date">
                <span className="tabular-nums">{formatDate(row.date)}</span>
              </Field>
              <Field label="Type">{row.types.join(", ") || "—"}</Field>
              <Field label="Duration">
                <span className="font-mono tabular-nums">
                  {formatDur(row.durS, row.dur)}
                </span>
              </Field>
              <Field label="ENG SUB">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-semibold",
                    row.sub === "YES"
                      ? "bg-cyan-400/20 text-cyan-200"
                      : "bg-white/5 text-zinc-400",
                  )}
                >
                  {row.sub}
                </span>
              </Field>
              <Field label="Era">{row.eras.join(", ") || "—"}</Field>
              <Field label="Season">{row.seasons.join(", ") || "—"}</Field>
              <Field label="Source channel">{row.chans.join(", ") || "—"}</Field>
              {row.series.length > 0 && (
                <Field label="Series">
                  {row.series.join(", ")}
                  {row.ssn != null && row.ssn !== "" ? ` · Season ${row.ssn}` : ""}
                </Field>
              )}
              {row.ep && <Field label="Episode">{row.ep}</Field>}
            </dl>

            {row.members.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Member appearances ({row.members.length})
                  <span className="ml-2 font-normal normal-case tracking-normal text-zinc-600">
                    · click a member to filter the library
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {row.members.map((m) => {
                    const info = members.find((x) => x.name === m);
                    const isActive = activeMembers.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => filterByMember(m)}
                        title={`Filter library by ${m}`}
                        aria-label={`Filter library by ${m}`}
                        className={cn(
                          "group/m inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-200 hover:-translate-y-px",
                          isActive
                            ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100 shadow-[0_0_14px_-4px_rgba(34,211,238,0.7)]"
                            : "border-white/10 bg-white/5 text-zinc-200 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-white hover:shadow-[0_0_14px_-6px_rgba(34,211,238,0.8)]",
                        )}
                      >
                        <span className="gradient-text font-mono text-[10px] font-bold">
                          {info?.s ?? "?"}
                        </span>
                        <span className="underline-offset-2 group-hover/m:underline">{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {row.units.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Units
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {row.units.map((u) => (
                    <span
                      key={u}
                      className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-200"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {row.kw.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {row.kw.map((k) => (
                    <span
                      key={k}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {row.notes && (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Notes
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                  {row.notes}
                </p>
              </div>
            )}

            <p className="border-t border-white/5 pt-3 text-[11px] text-zinc-600">
              Entry from the{" "}
              <a
                href="https://wavsteph.notion.site/tripleS-video-database-080d0d30618040159bd9a01919516d94"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 underline-offset-2 hover:text-cyan-300 hover:underline"
              >
                tripleS video database
              </a>{" "}
              by Steph (@wavsteph).
            </p>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
