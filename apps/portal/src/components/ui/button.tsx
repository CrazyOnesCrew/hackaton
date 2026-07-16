import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

// Pill-shaped buttons per the styleguide: fully rounded, flat (no shadows),
// pastel lavender primary. Hierarchy comes from background contrast.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-ink hover:brightness-105 active:scale-[0.98]",
  secondary:
    "bg-primary-soft text-ink hover:bg-primary/40 active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-muted hover:bg-primary-soft hover:text-ink",
};

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-pill px-6 text-sm font-bold transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
