"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  /** Content rendered inside the trigger button. */
  trigger: ReactNode;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  triggerLabel?: string;
  align?: "left" | "right";
  panelClassName?: string;
  /** Panel content; receives `close` to dismiss after an action. */
  children: (args: { close: () => void }) => ReactNode;
}

// Headless dropdown. The panel is portaled to <body> with fixed positioning so
// it's never clipped by an `overflow` ancestor (e.g. a scrolling table body) or
// captured by a transformed one (e.g. the sidebar). Closes on outside-click and
// Escape; repositions on scroll/resize.
export default function Dropdown({
  trigger,
  triggerClassName,
  triggerStyle,
  triggerLabel,
  align = "right",
  panelClassName = "",
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords(
      align === "right"
        ? { top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) }
        : { top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 8) },
    );
  }, [align]);

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        style={triggerStyle}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            className={`animate-fade-in fixed z-[70] overflow-hidden rounded-lg border ${panelClassName}`}
            style={{
              top: coords.top,
              left: coords.left,
              right: coords.right,
              background: "var(--bg-raised)",
              borderColor: "var(--border)",
              boxShadow: "var(--card-shadow-hover)",
            }}
          >
            {children({ close: () => setOpen(false) })}
          </div>,
          document.body,
        )}
    </>
  );
}
