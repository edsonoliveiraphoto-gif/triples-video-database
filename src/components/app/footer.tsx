"use client";

import { useApp } from "@/lib/store";

export function Footer() {
  const dataset = useApp((s) => s.dataset);
  const setImportOpen = useApp((s) => s.setImportOpen);
  const source = useApp((s) => s.source);

  return (
    <footer className="mt-auto border-t border-white/10 bg-[var(--bg-footer)] transition-colors duration-300">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <div className="text-sm">
          <p className="text-zinc-300">
            Data lovingly hand-entered over hundreds of hours by{" "}
            <a
              href="https://wavsteph.notion.site/tripleS-video-database-080d0d30618040159bd9a01919516d94"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cyan-300 underline-offset-2 hover:underline"
            >
              Steph (@wavsteph)
            </a>
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            An unofficial fan project. Not affiliated with MODHAUS or tripleS. All content belongs
            to its respective owners.
          </p>
        </div>
        <div className="sm:ml-auto sm:text-right">
          <p className="text-xs text-zinc-500">
            {source === "imported" ? "Imported dataset" : "Snapshot"} of{" "}
            {(dataset?.meta.db.entries ?? 0).toLocaleString()} entries ·{" "}
            {source === "imported"
              ? `imported ${new Date(dataset?.meta.importedAt ?? Date.now()).toLocaleDateString()}`
              : "2026-11-19"}
          </p>
          <button
            onClick={() => setImportOpen(true)}
            className="mt-1 text-xs text-cyan-300/80 underline-offset-2 hover:text-cyan-300 hover:underline"
          >
            Update data via CSV →
          </button>
        </div>
      </div>
    </footer>
  );
}
