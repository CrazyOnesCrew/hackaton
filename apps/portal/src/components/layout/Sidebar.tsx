"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Package, ShoppingCart, DollarSign, Users, FileText,
  RefreshCw, CreditCard, Settings, HelpCircle, Moon,
  ChevronDown, PanelLeftClose, PanelLeftOpen, X,
} from "lucide-react";
import type { NavItem, NavSection } from "@/lib/constants";
import { entriesFor, isPortalRole } from "@/lib/navigation";
import { useTheme } from "@/lib/useTheme";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLayout } from "@/lib/contexts/LayoutContext";
import VersionWidget from "./VersionWidget";

const ICON_BY_HREF: Record<string, string> = {
  "/dashboard": "dashboard",
  "/admin": "settings",
};

const ICONS = {
  dashboard: LayoutGrid, products: Package, orders: ShoppingCart, sales: DollarSign,
  customers: Users, reports: FileText, sync: RefreshCw, payments: CreditCard,
  settings: Settings, help: HelpCircle,
} as const;

const ACCENT = "var(--color-primary)";

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function childActive(item: NavItem, pathname: string) {
  if (item.children?.some((c) => c.href === pathname)) return true;
  return isActive(item.href, pathname);
}

// When two sibling entries share a prefix (e.g. "/admin" and
// "/admin/users"), only the most specific (longest href) match should be
// highlighted — otherwise both light up at once.
function bestMatch(items: NavItem[], pathname: string): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (childActive(item, pathname) && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const { collapsed, isDesktop, mobileOpen, toggleCollapsed, closeMobile } = useLayout();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // Role-scoped nav: members see the shared entries, admins additionally see
  // admin-only areas. Falls back to an empty section while `user` hydrates.
  const role = user?.role;
  const navSections: NavSection[] = isPortalRole(role)
    ? [
        {
          label: "Principal",
          items: entriesFor(role).map((entry) => ({
            href: entry.href,
            label: entry.label,
            icon: ICON_BY_HREF[entry.href] ?? "dashboard",
          })),
        },
      ]
    : [];

  // `collapsed` is a DESKTOP-only rail; the mobile drawer always shows labels.
  // We therefore gate the icon-only treatment behind `lg:` variants so the same
  // markup serves both. Below `lg`, these classes are inert.
  const labelHidden = collapsed ? "lg:hidden" : "";
  const rowCollapsed = collapsed ? "lg:justify-center lg:px-0" : "";
  // The actual rail (icon-only) is only in effect on desktop. Used for behavior
  // that can't be expressed with CSS alone — e.g. whether a parent expands its
  // sub-menu (rail) or just links to its own route.
  const rail = collapsed && isDesktop;

  const container = [
    "app-sidebar flex flex-col shrink-0 border-r z-50",
    "transition-[transform,width] duration-200 ease-out",
    // Mobile: off-canvas drawer.
    "fixed inset-y-0 left-0 w-[264px]",
    mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
    // Desktop: in-flow rail.
    "lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto",
    collapsed ? "lg:w-[68px]" : "lg:w-[240px]",
  ].join(" ");

  return (
    <aside className={container} style={{ borderColor: "var(--border)", background: "var(--sidebar-bg)" }}>
      {/* Header: brand doubles as the expand control in the collapsed rail */}
      <div className={`flex h-14 items-center gap-2.5 ${rail ? "lg:justify-center lg:px-0" : "px-5"}`}>
        {rail ? (
          <button
            onClick={toggleCollapsed}
            className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink transition-transform hover:scale-105"
            style={{ background: ACCENT }}
            aria-label="Expandir menú"
            title="Expandir menú"
          >
            <span className="text-sm font-extrabold leading-none group-hover:hidden">T</span>
            <PanelLeftOpen size={16} className="hidden group-hover:block" />
          </button>
        ) : (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-extrabold leading-none text-ink" style={{ background: ACCENT }}>
              T
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--fg)" }}>Template</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>
                Portal
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {/* Desktop: collapse to icon rail */}
              <button
                onClick={toggleCollapsed}
                className="hidden h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-bg)] lg:flex"
                style={{ color: "var(--fg-muted)" }}
                aria-label="Colapsar menú"
                title="Colapsar menú"
              >
                <PanelLeftClose size={17} strokeWidth={1.75} />
              </button>
              {/* Mobile: close drawer */}
              <button
                onClick={closeMobile}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-bg)] lg:hidden"
                style={{ color: "var(--fg-muted)" }}
                aria-label="Cerrar menú"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
          </>
        )}
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-2">
        {navSections.map((section) => {
          const activeHref = bestMatch(section.items, pathname);
          return (
          <div key={section.label} className="mb-4">
            <div className={`px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider ${labelHidden}`} style={{ color: "var(--fg-faint)" }}>
              {section.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS];
                const active = item.href === activeHref;
                const hasChildren = !!item.children?.length;
                // In the collapsed desktop rail, parents fall back to plain
                // links; everywhere else (expanded desktop, mobile drawer) they
                // expand their sub-menu.
                const expandable = hasChildren && !rail;
                const open = openMenus[item.href] ?? active;

                // Nav activo estilo styleguide: pill lavanda suave + texto oscuro.
                const rowStyle = active
                  ? { background: "var(--accent-bg-sel)", color: "var(--color-ink)" }
                  : { color: "var(--fg-muted)" };
                const rowClass = `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent-bg)] ${rowCollapsed}`;

                return (
                  <div key={item.href}>
                    {expandable ? (
                      <button
                        type="button"
                        onClick={() => setOpenMenus((m) => ({ ...m, [item.href]: !open }))}
                        className={`w-full ${rowClass}`}
                        style={rowStyle}
                        aria-expanded={open}
                      >
                        <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                        <span className={`flex-1 text-left ${labelHidden}`}>{item.label}</span>
                        <ChevronDown
                          size={15}
                          className={`shrink-0 transition-transform ${labelHidden} ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={rowClass}
                        style={rowStyle}
                        title={rail ? item.label : undefined}
                      >
                        <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                        <span className={labelHidden}>{item.label}</span>
                      </Link>
                    )}

                    {/* Sub-menu (expanded sidebar only) */}
                    {expandable && open && (
                      <div className={`mt-0.5 flex flex-col gap-0.5 pl-7 ${labelHidden}`}>
                        {item.children!.map((child) => {
                          const cActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-[var(--accent-bg)]"
                              style={{ color: cActive ? "var(--color-primary-strong)" : "var(--fg-muted)" }}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      <div className="px-3 py-2">
        <button
          onClick={toggle}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent-bg)] ${rowCollapsed}`}
          style={{ color: "var(--fg-muted)" }}
          title={rail ? "Modo oscuro" : undefined}
        >
          <Moon size={18} strokeWidth={1.5} className="shrink-0" />
          <span className={`flex-1 text-left ${labelHidden}`}>Modo oscuro</span>
          <span className={`app-switch ${labelHidden}`} data-checked={dark} />
        </button>
      </div>

      {/* Version + environment — full card when expanded, compact in the rail */}
      <div className={labelHidden}>
        <VersionWidget />
      </div>
      {rail && <VersionWidget rail />}
    </aside>
  );
}
