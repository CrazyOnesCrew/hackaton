"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  LayoutGrid, Package, ShoppingCart, DollarSign, Users, FileText,
  RefreshCw, CreditCard, Settings, HelpCircle, Moon, Sparkles,
  Search, CornerDownLeft, ArrowRight,
} from "lucide-react";
import { COMMANDS, type Command } from "@/lib/commands";
import { useTheme } from "@/lib/useTheme";
import ChangelogModal from "./ChangelogModal";

const ICONS: Record<string, typeof LayoutGrid> = {
  dashboard: LayoutGrid, products: Package, orders: ShoppingCart, sales: DollarSign,
  customers: Users, reports: FileText, sync: RefreshCw, payments: CreditCard,
  settings: Settings, help: HelpCircle, theme: Moon, sparkles: Sparkles,
};

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { toggle } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [showChangelog, setShowChangelog] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(COMMANDS, {
        keys: [
          { name: "label", weight: 0.6 },
          { name: "keywords", weight: 0.3 },
          { name: "section", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [],
  );

  const results = useMemo<Command[]>(() => {
    const q = query.trim();
    return q ? fuse.search(q).map((r) => r.item) : COMMANDS;
  }, [query, fuse]);

  // Keep the active row scrolled into view as it changes.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function runCommand(cmd: Command) {
    if (cmd.action === "toggle-theme") {
      toggle();
      onClose();
      return;
    }
    if (cmd.action === "open-changelog") {
      setShowChangelog(true);
      return;
    }
    if (cmd.href) {
      router.push(cmd.href);
      onClose();
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) runCommand(cmd);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  if (typeof document === "undefined") return null;

  // Selecting "Ver novedades" swaps the palette for the changelog modal.
  if (showChangelog) return <ChangelogModal onClose={onClose} />;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-3 pt-[12vh] sm:p-6 sm:pt-[14vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
    >
      <button className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar" />

      <div
        className="animate-fade-in relative flex max-h-[70vh] w-full flex-col overflow-hidden rounded-xl border sm:max-w-xl"
        style={{ background: "var(--bg-raised)", borderColor: "var(--border)", boxShadow: "var(--card-shadow-hover)" }}
        onKeyDown={onKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4" style={{ borderColor: "var(--border)" }}>
          <Search size={18} style={{ color: "var(--fg-faint)" }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Buscar páginas y acciones…"
            aria-label="Buscar"
            className="h-12 flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--fg)" }}
          />
          <kbd className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: "var(--bg-subtle)", color: "var(--fg-faint)" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="custom-scrollbar flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm" style={{ color: "var(--fg-faint)" }}>
              Sin resultados para “{query}”.
            </div>
          ) : (
            results.map((cmd, idx) => {
              const Icon = ICONS[cmd.icon] ?? ArrowRight;
              const prev = results[idx - 1];
              const showHeader = !prev || prev.section !== cmd.section;
              const isActive = idx === active;
              return (
                <div key={cmd.id}>
                  {showHeader && (
                    <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>
                      {cmd.section}
                    </div>
                  )}
                  <button
                    data-idx={idx}
                    onMouseMove={() => setActive(idx)}
                    onClick={() => runCommand(cmd)}
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors"
                    style={isActive ? { background: "var(--accent-bg-sel)", color: "#5b5fef" } : { color: "var(--fg-muted)" }}
                  >
                    <Icon size={17} strokeWidth={1.6} className="shrink-0" />
                    <span className="flex-1 truncate font-medium" style={isActive ? undefined : { color: "var(--fg)" }}>
                      {cmd.label}
                    </span>
                    {isActive && <CornerDownLeft size={14} className="shrink-0" />}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center gap-4 border-t px-4 py-2 text-[11px]"
          style={{ borderColor: "var(--border)", color: "var(--fg-faint)" }}
        >
          <span className="flex items-center gap-1"><kbd className="font-mono">↑</kbd><kbd className="font-mono">↓</kbd> navegar</span>
          <span className="flex items-center gap-1"><kbd className="font-mono">↵</kbd> abrir</span>
          <span className="ml-auto">{results.length} resultado{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
