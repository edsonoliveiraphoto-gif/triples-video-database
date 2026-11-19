"use client";

import { useRef, useState } from "react";
import { Database, FileUp, RotateCcw } from "lucide-react";
import { useApp } from "@/lib/store";
import { datasetFromImported, parseCSV, rowsFromCSV, type ImportResult } from "@/lib/csv";
import { idbClear, idbSet } from "@/lib/idb";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ImportDialog() {
  const open = useApp((s) => s.importOpen);
  const setOpen = useApp((s) => s.setImportOpen);
  const dataset = useApp((s) => s.dataset);
  const setDataset = useApp((s) => s.setDataset);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [parsed, setParsed] = useState<{ result: ImportResult; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = async (file: File) => {
    setError(null);
    setParsed(null);
    try {
      const text = await file.text();
      const table = parseCSV(text);
      if (table.length < 2) {
        setError("This CSV has no data rows.");
        return;
      }
      const header = table[0].map((h) => h.trim().toLowerCase());
      if (!header.includes("name") && !header.includes("title") && !header.includes("link")) {
        setError(
          "Unexpected CSV format — expected the database export columns (Name, Date, Type, Title, Link, …).",
        );
        return;
      }
      const result = rowsFromCSV(table);
      if (result.rows.length === 0) {
        setError("No valid rows could be parsed from this file.");
        return;
      }
      setParsed({ result, name: file.name });
    } catch (e) {
      setError(`Could not read file: ${String(e)}`);
    }
  };

  const apply = async () => {
    if (!parsed || !dataset) return;
    const ds = datasetFromImported(parsed.result.rows, dataset);
    setDataset(ds, "imported");
    try {
      await idbSet(ds);
    } catch {
      /* IDB write failed — dataset still active for this session */
    }
    setOpen(false);
    setParsed(null);
    if (inputRef.current) inputRef.current.value = "";
    toast({
      title: "Database updated",
      description: `${parsed.result.rows.length.toLocaleString()} entries loaded from ${parsed.name}.`,
    });
  };

  const reset = async () => {
    await idbClear();
    try {
      const res = await fetch("/data/contents.json", { cache: "no-store" });
      const ds = await res.json();
      setDataset(ds, "builtin");
      setOpen(false);
      toast({
        title: "Restored snapshot",
        description: "Back to the built-in 2026-11-19 snapshot of Steph's database.",
      });
    } catch {
      toast({ title: "Could not reload the snapshot", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogContent className="max-w-lg border-white/10 bg-[var(--bg-modal)] backdrop-blur-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Database className="size-5 text-cyan-300" />
            Update the database
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Export the Notion table as CSV (matching the columns below), then drop the file here.
            Your imported data is kept in this browser.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) await readFile(file);
          }}
          className={cn(
            "rounded-xl border border-dashed p-6 text-center transition-colors",
            dragging ? "border-cyan-300/60 bg-cyan-400/10" : "border-white/15 bg-white/[0.02]",
          )}
        >
          <FileUp className="mx-auto size-8 text-zinc-500" />
          <p className="mt-2 text-sm text-zinc-300">Drag &amp; drop the CSV export here</p>
          <p className="mt-1 text-xs text-zinc-500">or</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await readFile(file);
            }}
          />
          <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
            Columns: Name · Date · Type · Title · Duration · Link · ENG SUB · Member Appearances ·
            Keywords · Tags · Era · Season · Source Channel · Episode # · Series · Series Season ·
            Notes · Source/Alt Link · Notion Row ID
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        {parsed && (
          <div className="space-y-3 rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate text-zinc-200">{parsed.name}</span>
              <span className="text-xs text-zinc-500">
                {parsed.result.skipped > 0 && `${parsed.result.skipped} skipped · `}
                {parsed.result.rows.length.toLocaleString()} rows
              </span>
            </div>
            {(() => {
              const dates = parsed.result.rows
                .map((r) => r.date)
                .filter(Boolean)
                .sort();
              if (dates.length === 0) return null;
              return (
                <p className="text-xs text-zinc-400">
                  Coverage: {dates[0]} → {dates[dates.length - 1]}
                </p>
              );
            })()}
            <div className="flex gap-2">
              <Button
                onClick={apply}
                className="flex-1 bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:opacity-90"
              >
                Apply {parsed.result.rows.length.toLocaleString()} entries
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsed(null)}
                className="border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10"
              >
                Discard
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <p className="text-[11px] text-zinc-600">
            Currently serving:{" "}
            <span className="text-zinc-400">
              {dataset?.meta.source === "csv"
                ? `imported data (${dataset.meta.db.entries.toLocaleString()} entries)`
                : `built-in snapshot (${dataset?.meta.db.entries.toLocaleString() ?? "…"} entries)`}
            </span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="gap-1 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Restore snapshot
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
