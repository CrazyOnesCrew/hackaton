"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ROUTE_LABELS } from "@/lib/constants";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /**
   * Explicit trail. Omit to auto-derive from the current pathname via
   * ROUTE_LABELS — pass this for dynamic routes (e.g. /recursos/[id]) where a
   * segment needs a human label that only the page knows.
   */
  items?: Crumb[];
  className?: string;
}

function labelFor(segment: string) {
  return (
    ROUTE_LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname();

  const crumbs = useMemo<Crumb[]>(() => {
    if (items) return items;
    const segments = pathname.split("/").filter(Boolean);
    const auto: Crumb[] = segments.map((seg, i) => ({
      label: labelFor(seg),
      // Last segment renders as plain text (current page), not a link.
      href: i < segments.length - 1 ? "/" + segments.slice(0, i + 1).join("/") : undefined,
    }));
    return auto;
  }, [items, pathname]);

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 font-medium transition-colors hover:bg-[var(--accent-bg)]"
            style={{ color: "var(--fg-muted)" }}
            aria-label="Inicio"
          >
            <Home size={13} strokeWidth={1.75} />
          </Link>
        </li>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <li aria-hidden className="flex items-center" style={{ color: "var(--fg-faint)" }}>
                <ChevronRight size={13} strokeWidth={2} />
              </li>
              <li className="flex items-center">
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="rounded-md px-1.5 py-1 font-medium transition-colors hover:bg-[var(--accent-bg)]"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className="px-1.5 py-1 font-semibold"
                    style={{ color: "var(--fg)" }}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
