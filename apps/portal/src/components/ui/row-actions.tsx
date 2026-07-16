"use client";

import Link from "next/link";
import { MoreVertical, type LucideIcon } from "lucide-react";
import Dropdown from "./Dropdown";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
}

// Per-row "⋮" kebab menu for table action columns.
export function RowActions({ actions }: { actions: RowAction[] }) {
  const itemClass = "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-[var(--accent-bg)]";
  return (
    <Dropdown
      trigger={<MoreVertical size={16} />}
      triggerClassName="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-bg)]"
      triggerStyle={{ color: "var(--fg-muted)" }}
      triggerLabel="Acciones"
      panelClassName="w-44 p-1"
    >
      {({ close }) =>
        actions.map((a) => {
          const Icon = a.icon;
          const color = a.danger ? "#ef4444" : "var(--fg)";
          const iconColor = a.danger ? "#ef4444" : "var(--fg-muted)";
          return a.href ? (
            <Link key={a.label} href={a.href} onClick={close} className={itemClass} style={{ color }} role="menuitem">
              {Icon && <Icon size={15} strokeWidth={1.75} style={{ color: iconColor }} />}
              {a.label}
            </Link>
          ) : (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onSelect?.();
                close();
              }}
              className={itemClass}
              style={{ color }}
              role="menuitem"
            >
              {Icon && <Icon size={15} strokeWidth={1.75} style={{ color: iconColor }} />}
              {a.label}
            </button>
          );
        })
      }
    </Dropdown>
  );
}
