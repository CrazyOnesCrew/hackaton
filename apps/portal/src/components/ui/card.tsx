import * as React from "react";
import { cn } from "@/lib/utils";

// Flat card per the styleguide: 24px radius, subtle light-gray surface that
// separates it from the white page background — no shadows, generous padding.
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-card bg-surface p-6", className)}
      {...props}
    />
  );
}
