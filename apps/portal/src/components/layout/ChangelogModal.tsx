"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import { CHANGELOG, CHANGE_KIND_META } from "@/lib/changelog";
import { APP_VERSION } from "@/lib/constants";
import { APP_ENV, ENV_META } from "@/lib/env";
import { renderInlineMarkdown } from "@/lib/inline-markdown";

const TYPE_LABEL = { major: "Major", minor: "Minor", patch: "Patch" } as const;

// Mount-controlled: the parent renders this only while open, so the chunk can be
// lazy-loaded on first open. Portaled to <body> so the sidebar's CSS transform
// can't capture the fixed overlay.
export default function ChangelogModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const env = ENV_META[APP_ENV];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Novedades"
    >
      <button className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar" />

      <div
        className="animate-fade-in relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border sm:max-h-[88vh] sm:max-w-2xl"
        style={{ background: "var(--bg-raised)", borderColor: "var(--border)", boxShadow: "var(--card-shadow-hover)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 border-b px-6 py-5" style={{ borderColor: "var(--border)" }}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: "#5b5fef" }}>
            <Sparkles size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--fg)" }}>Novedades</h2>
            <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: "var(--fg-muted)" }}>
              <span className="font-mono font-medium">v{APP_VERSION}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: env.color }} />
                {env.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-bg)]"
            style={{ color: "var(--fg-muted)" }}
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body — timeline of releases */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
          <ol className="space-y-8">
            {CHANGELOG.map((entry, idx) => (
              <li key={entry.version} className="relative pl-6">
                {/* timeline line + dot */}
                {idx < CHANGELOG.length - 1 && (
                  <span className="absolute bottom-0 left-[3px] top-3 w-px" style={{ background: "var(--border)" }} aria-hidden />
                )}
                <span
                  className="absolute left-0 top-1.5 h-[7px] w-[7px] rounded-full ring-4"
                  style={{ background: "#5b5fef", color: "var(--bg-raised)" }}
                  aria-hidden
                />

                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-base font-bold" style={{ color: "var(--fg)" }}>
                    v{entry.version}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: "var(--accent-bg)", color: "#5b5fef" }}
                  >
                    {TYPE_LABEL[entry.type]}
                  </span>
                  <span className="ml-auto text-xs" style={{ color: "var(--fg-faint)" }}>
                    {new Date(entry.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {entry.changes.map((change, i) => {
                    const meta = CHANGE_KIND_META[change.kind];
                    return (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                        <span
                          className="mt-px shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: `${meta.color}1a`, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span>{renderInlineMarkdown(change.text)}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>,
    document.body,
  );
}
