"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { idbGet } from "@/lib/idb";
import { StarField } from "@/components/app/starfield";
import { Header } from "@/components/app/header";
import { Hero } from "@/components/app/hero";
import { FilterBar } from "@/components/app/filters";
import { Library } from "@/components/app/library";
import { MembersView } from "@/components/app/members-view";
import { StatsView } from "@/components/app/stats-view";
import { DetailModal } from "@/components/app/detail-modal";
import { ImportDialog } from "@/components/app/import-dialog";
import { Footer } from "@/components/app/footer";
import type { Dataset } from "@/lib/triples";

function LoadingSkeleton() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="glass-card overflow-hidden rounded-xl">
            <div className="aspect-video animate-pulse bg-white/5" />
            <div className="space-y-2 p-3">
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/5" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-zinc-500">
        Loading 6,729 entries from Steph&apos;s database…
      </p>
    </section>
  );
}

export default function Home() {
  const status = useApp((s) => s.status);
  const view = useApp((s) => s.view);
  const setDataset = useApp((s) => s.setDataset);
  const setError = useApp((s) => s.setError);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // prefer a previously imported dataset kept in this browser
      try {
        const imported = (await idbGet()) as Dataset | null;
        if (!cancelled && imported && Array.isArray(imported.rows) && imported.rows.length > 0) {
          setDataset(imported, "imported");
          return;
        }
      } catch {
        /* fall through to builtin */
      }
      try {
        const res = await fetch("/data/contents.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ds: Dataset = await res.json();
        if (!cancelled) setDataset(ds, "builtin");
      } catch {
        if (!cancelled) setError();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setDataset, setError]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-zinc-100 transition-colors duration-300">
      <StarField />
      <Header />

      <main className="relative z-10 flex-1">
        {view === "library" && (
          <>
            <Hero />
            {status === "loading" && <LoadingSkeleton />}
            {status === "error" && (
              <div className="mx-auto max-w-md p-16 text-center">
                <p className="text-lg font-medium text-zinc-200">The cosmos went dark</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Could not load the database. Refresh the page and try again.
                </p>
              </div>
            )}
            {status === "ready" && (
              <div className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6">
                <FilterBar />
              </div>
            )}
            {status === "ready" && <Library />}
          </>
        )}

        {view === "members" && status === "ready" && <MembersView />}
        {view === "stats" && status === "ready" && <StatsView />}
        {view !== "library" && status === "loading" && (
          <p className="p-16 text-center text-sm text-zinc-500">Loading the universe…</p>
        )}
      </main>

      <Footer />
      <DetailModal />
      <ImportDialog />
    </div>
  );
}
