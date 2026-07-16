import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Form design-system primitives. Compose a clean, consistent form: titled
// sections, a responsive 2-column grid, and fields with label + required mark +
// hint/error. Controls share `.field-control` (see globals.css) so focus,
// hover, disabled and invalid states stay uniform across the app.

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-5", className)}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--fg)" }}>{title}</h2>}
          {description && <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function FormGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2", className)}>{children}</div>;
}

/** Span both columns in a FormGrid. */
export const FieldFull = "sm:col-span-2";

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 text-sm font-medium" style={{ color: "var(--fg)" }}>
          {label}
          {required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn("field-control h-11 px-3", invalid && "field-control--invalid", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea"> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn("field-control resize-y px-3 py-2.5", invalid && "field-control--invalid", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Select({
  className,
  invalid,
  children,
  ...props
}: React.ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn("field-control h-11 cursor-pointer appearance-none pl-3 pr-9", invalid && "field-control--invalid", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }} />
    </div>
  );
}

/** Input with a trailing unit/affix (e.g. a currency suffix), like the reference. */
export function InputAffix({
  affix,
  invalid,
  className,
  ...props
}: React.ComponentProps<"input"> & { affix: React.ReactNode; invalid?: boolean }) {
  return (
    <div className={cn("field-control flex h-11 items-center overflow-hidden p-0", invalid && "field-control--invalid")}>
      <input className={cn("h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[var(--fg-faint)]", className)} {...props} />
      <span className="flex h-full items-center border-l px-3 text-xs font-medium" style={{ borderColor: "var(--border)", color: "var(--fg-muted)", background: "var(--bg-subtle)" }}>
        {affix}
      </span>
    </div>
  );
}
