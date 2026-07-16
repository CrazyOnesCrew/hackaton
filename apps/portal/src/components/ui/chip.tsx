import * as React from "react";
import { cn } from "@/lib/utils";

export type ChipVariant = "active" | "inactive" | "highlight";

// Pill chips per the styleguide: active = soft lavender with dark text,
// inactive = very light gray with dark text, highlight = near-black "dark
// mode" chip with white text.
const VARIANT_CLASSES: Record<ChipVariant, string> = {
  active: "bg-primary-soft text-ink",
  inactive: "bg-surface text-ink",
  highlight: "bg-ink text-white",
};

export interface ChipProps extends React.ComponentProps<"span"> {
  variant?: ChipVariant;
}

export function Chip({ className, variant = "inactive", ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
