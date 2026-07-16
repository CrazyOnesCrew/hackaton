"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Fully-controlled checkbox (no reliance on :checked CSS so indeterminate +
// theming stay reliable). Used for table row selection.
export function Checkbox({
  checked,
  indeterminate,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const filled = checked || indeterminate;
  return (
    <span className={cn("relative inline-flex h-[18px] w-[18px] shrink-0 align-middle", className)}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        readOnly={!onChange}
        aria-label={ariaLabel}
        className="absolute inset-0 cursor-pointer appearance-none rounded-[5px] border transition-colors"
        style={{ borderColor: filled ? "#5b5fef" : "var(--input-border)", background: filled ? "#5b5fef" : "var(--bg-raised)" }}
      />
      {indeterminate ? (
        <Minus size={12} strokeWidth={3} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
      ) : checked ? (
        <Check size={12} strokeWidth={3} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
      ) : null}
    </span>
  );
}
