"use client";

import { useEffect, useState } from "react";
import { Bookmark, LayoutGrid, Moon, Search, Sun, Table2, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useApp, type ViewMode } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NAV: { key: ViewMode; label: string }[] = [
  { key: "library", label: "Library" },
  { key: "members", label: "Members" },
  { key: "stats", label: "Stats" },
];

export function Header() {
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const q = useApp((s) => s.q);
  const setQ = useApp((s) => s.setQ);
  const layout = useApp((s) => s.layout);
  const setLayout = useApp((s) => s.setLayout);
  const watchlist = useApp((s) => s.watchlist);
  const starredOnly = useApp((s) => s.starredOnly);
  const setStarredOnly = useApp((s) => s.setStarredOnly);
  const setImportOpen = useApp((s) => s.setImportOpen);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // theme-dependent output must match the server render until mounted,
  // otherwise the aria-label causes a fatal hydration mismatch.
  const isLight = mounted && theme === "light";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--bg-header)] backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        {/* wordmark */}
        <button
          onClick={() => setView("library")}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="tripleS video database — home"
        >
          <span className="gradient-text text-xl font-bold tracking-tight sm:text-2xl">
            tripleS
          </span>
          <span className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:inline">
            Video DB
          </span>
        </button>

        {/* nav */}
        <nav className="ml-1 hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                view === n.key
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* search */}
        <div className="relative ml-auto hidden w-56 lg:block xl:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (view !== "library") setView("library");
            }}
            placeholder="Search 6,729 videos…"
            className="border-white/10 bg-white/5 pl-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-cyan-400/40"
            aria-label="Search the database"
          />
        </div>

        {/* actions */}
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
            aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
            title={isLight ? "Dark mode" : "Light mode"}
          >
            {mounted && isLight ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStarredOnly(!starredOnly);
              setView("library");
            }}
            className={cn(
              "gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white",
              starredOnly && "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
            )}
            aria-pressed={starredOnly}
          >
            <Bookmark className={cn("size-4", starredOnly && "fill-current")} />
            <span className="hidden sm:inline">{watchlist.length}</span>
          </Button>

          <div className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 sm:flex">
            <button
              onClick={() => setLayout("grid")}
              className={cn(
                "rounded p-1.5 transition-colors",
                layout === "grid" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100",
              )}
              aria-label="Card grid view"
              title="Card grid"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setLayout("table")}
              className={cn(
                "rounded p-1.5 transition-colors",
                layout === "table" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100",
              )}
              aria-label="Dense table view"
              title="Dense table"
            >
              <Table2 className="size-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="gap-1.5 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
            title="Update data from CSV"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Update</span>
          </Button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden" aria-label="Main mobile">
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setView(n.key)}
            className={cn(
              "rounded-lg px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors",
              view === n.key ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100",
            )}
          >
            {n.label}
          </button>
        ))}
        <button
          onClick={() => {
            setStarredOnly(!starredOnly);
            setView("library");
          }}
          className={cn(
            "rounded-lg px-3 py-1 text-sm font-medium whitespace-nowrap",
            starredOnly ? "bg-fuchsia-400/10 text-fuchsia-300" : "text-zinc-400",
          )}
        >
          Saved ({watchlist.length})
        </button>
      </nav>
    </header>
  );
}
