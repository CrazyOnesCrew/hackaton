import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn/ui Table primitives, restyled with the design system tokens. Same component
// API as shadcn so you can later `npx shadcn add` siblings and they compose —
// but the visuals stay on the design system (CSS variables, no hard-coded grays).

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table className={cn("w-full caption-bottom border-collapse text-sm", className)} {...props} />;
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("sticky top-0 z-10 [&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot className={cn("border-t font-medium", className)} style={{ borderColor: "var(--border)" }} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--accent-bg)] data-[state=selected]:bg-[var(--accent-bg-sel)]", className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 whitespace-nowrap px-4 text-left align-middle text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] [&:has([role=checkbox])]:pr-0",
        className,
      )}
      style={{ background: "var(--bg-subtle)" }}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption className={cn("mt-4 text-sm text-[var(--fg-muted)]", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
