import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui className merge helper: clsx for conditionals + tailwind-merge
// to resolve conflicting Tailwind utilities. Used by the ui/* primitives.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
