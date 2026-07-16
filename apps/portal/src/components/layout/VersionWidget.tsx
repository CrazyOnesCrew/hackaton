"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, Tag } from "lucide-react";
import { APP_VERSION } from "@/lib/constants";
import { APP_ENV, ENV_META } from "@/lib/env";

// Lazy-load the modal: its markdown renderer + content only ship once the user
// actually opens "Novedades" (bundle-dynamic-imports).
const ChangelogModal = dynamic(() => import("./ChangelogModal"), { ssr: false });

/**
 * Sidebar footer widget: shows the app's semantic version + deploy environment
 * and opens the changelog ("Novedades") modal. `rail` renders the compact
 * icon-only form for the collapsed desktop sidebar.
 */
export default function VersionWidget({ rail = false }: { rail?: boolean }) {
  const [open, setOpen] = useState(false);
  const env = ENV_META[APP_ENV];

  if (rail) {
    return (
      <>
        <div className="hidden justify-center px-2 py-2 lg:flex">
          <button
            onClick={() => setOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-[var(--accent-bg)]"
            style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
            aria-label={`Versión ${APP_VERSION} · ${env.label} · ver novedades`}
            title={`v${APP_VERSION} · ${env.label}`}
          >
            <Tag size={16} />
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2"
              style={{ background: env.color, borderColor: "var(--sidebar-bg)" }}
            />
          </button>
        </div>
        {open && <ChangelogModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="m-3 rounded-lg border p-3" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-xs font-semibold" style={{ color: "var(--fg)" }}>
            <Tag size={13} style={{ color: "var(--fg-muted)" }} />
            v{APP_VERSION}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: `${env.color}1a`, color: env.color }}
            title={env.label}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: env.color }} />
            {env.short}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#5b5fef" }}
        >
          <Sparkles size={13} />
          Novedades
        </button>
      </div>
      {open && <ChangelogModal onClose={() => setOpen(false)} />}
    </>
  );
}
