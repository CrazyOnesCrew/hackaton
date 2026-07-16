# DESIGN.md — UI design system

How to build UI in this template so it stays consistent. **Do not invent new
colors, radii or shadows** — everything reads from the design tokens in
`src/app/globals.css`. Compose the primitives below instead of hand-rolling
inputs/tables/menus.

> Related: `STYLE.md` (paleta de referencia), `docs/UI_DESIGN_SYSTEM.md` (tokens deep-dive), `docs/BEST_PRACTICES.md`
> (Vercel/React performance rules applied here).

---

## Tokens (never hard-code)

Defined on `:root` (light) and `.dark` in `globals.css`. Use the CSS variables —
not literal hex — via inline `style` or Tailwind arbitrary values `bg-[var(--…)]`.

Paleta cálida (naranjas y amarillos) + grises neutros. Valores de referencia en `STYLE.md`.

| Purpose | Variables | Light (referencia) |
|---|---|---|
| Surfaces | `--bg`, `--bg-raised`, `--bg-subtle` | `#FFE7D1`, `#FFFFFF`, `#FFE7D1` |
| Text | `--fg`, `--fg-muted`, `--fg-faint` | `#414B53`, `#888E93`, `#888E93` |
| Borders | `--border`, `--border-subtle` | `#D0D2D4` |
| Accent | `--color-primary`, `--accent-bg`, `--accent-bg-sel` | `#E75300`, `#FFE7D1` (10% opac.), `#FFE7D1` |
| Accent scale | `--color-primary-light`, `--color-primary-muted` | `#FFE7D1`, `#FFB876` |
| Inputs | `--input-bg`, `--input-border`, `--input-focus` | `#FFFFFF`, `#D0D2D4`, `rgba(231,83,0,0.35)` |
| Status | `--color-success`, `--color-warning`, `--color-danger` | `#FF891A`, `#FFAE09`, `#E75300` |
| Shadows | `--card-shadow`, `--card-shadow-hover` | objetos cálidos `#E75300`; grises `#414B53` |
| Radius scale | `--radius-sm … --radius-3xl` (drives every `rounded-*`) | — |

### Paleta rápida (hex de referencia)

| Rol | Hex | Uso típico |
|---|---|---|
| Primary Dark | `#E75300` | Botones primarios, nav activo, danger |
| Primary Orange | `#FF891A` | Links, success, acentos secundarios |
| Primary Yellow | `#FFAE09` | Warning, highlights |
| Primary Peach | `#FFB876` | Gráficos secundarios, info |
| Primary Beige | `#FFE7D1` | Fondo app, hover suave, badges |
| Gray Dark | `#414B53` | Texto principal, CTA banner dark |
| Gray Medium | `#888E93` | Texto muted, metadatos |
| Gray Light | `#D0D2D4` | Bordes, separadores |
| White | `#FFFFFF` | Cards, sidebar, paneles |

`cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) merges class names — use it
in every `ui/*` primitive.

---

## Forms (`src/components/ui/form.tsx`)

The form design system. Compose: titled **section** → 2-column **grid** →
**fields** (label + required `*` + hint/error) → **controls** sharing the
`.field-control` class (unified focus / hover / disabled / invalid states).

```tsx
import {
  FormSection, FormGrid, FormField, FieldFull,
  Input, Textarea, Select, InputAffix,
} from "@/components/ui/form";

<FormSection title="Detalles" description="Los campos con * son obligatorios.">
  <FormGrid>
    <FormField className={FieldFull} label="Título" htmlFor="titulo" required
               error={tituloError} hint={!tituloError ? "Texto de ayuda…" : undefined}>
      <Input id="titulo" value={titulo} invalid={!!tituloError}
             onChange={(e) => setTitulo(e.target.value)} onBlur={() => setTouched(true)} />
    </FormField>

    <FormField label="Importe" htmlFor="amount">
      <InputAffix affix="EUR" id="amount" inputMode="decimal" />
    </FormField>

    <FormField label="Estado" htmlFor="estado" hint="Controla la visibilidad.">
      <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </Select>
    </FormField>
  </FormGrid>
</FormSection>
```

Primitives: `FormSection` (title/description), `FormGrid` (responsive 1→2 cols;
`FieldFull` = span both), `FormField` (label, `required`, `hint`, `error`),
`Input` / `Textarea` / `Select` (all accept `invalid`), `InputAffix` (trailing
unit, e.g. currency).

### Validation pattern (client)

- Track a `touched` boolean; derive the error string during render — never store
  derived error in state.
- `const tituloError = touched && !titulo.trim() ? "Este campo no puede estar vacío." : "";`
- On submit: `setTouched(true)`; bail if invalid. Also `onBlur={() => setTouched(true)}`.
- Pass `invalid={!!error}` to the control (red border + ring) and `error` to the
  `FormField` (replaces the hint with a red message).
- Use `noValidate` on `<form>` so our messages show instead of the browser's.

### Form page layout

Two columns on `lg`: the form card on the left, an `<aside>` (≈320px) on the
right with live preview / tips / summary widgets — fills the space and avoids a
lonely centered form. Stacks on mobile. Reference: `RecursoForm.tsx`.

```tsx
<div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
  <form>…</form>
  <aside className="flex flex-col gap-4">…preview / tips…</aside>
</div>
```

Keep submit logic on the client component: optimistic-free `fetch` to the route
handler, then `startTransition(() => { router.push(...); router.refresh(); })`.

---

## Tables (`src/components/ui/table.tsx`, `data-table.tsx`)

shadcn/ui pattern on **TanStack Table**, design-tokened.

- `Table / TableHeader / TableBody / TableRow / TableHead / TableCell` — styled
  primitives for static tables (see `dashboard/TopProductsTable.tsx`).
- `<DataTable columns data … />` — full data table: column sorting, global
  search, faceted filters, pagination, fixed-height scroll with sticky header,
  responsive. Define `ColumnDef[]` with `useMemo`; pass `facets`, `pageSize`,
  `maxBodyHeight`. Per-column alignment via `meta: { className, headerClassName }`.
  Reference: `recursos/RecursosTable.tsx`, `usuarios/UsuariosTable.tsx`.

---

## Menus / overlays

- `src/components/ui/Dropdown.tsx` — headless dropdown (outside-click + Esc).
  Trigger + `children({ close })` panel. Used by the TopBar menus.
- Modals/popovers that live inside a transformed ancestor (e.g. the sidebar)
  **must** `createPortal` to `document.body`, or a CSS `transform` will capture
  their `position: fixed`. Reference: `ChangelogModal.tsx`, `CommandPalette.tsx`.

---

## Buttons & misc

- `.btn-primary` (gradiente cálido `#E75300` → `#FF891A`), `.btn-accent`, `.btn-ghost`, `.btn-danger` in
  `globals.css`. Secondary/cancel buttons: bordered, `hover:bg-[var(--accent-bg)]`.
- Icon buttons: `h-9 w-9 rounded-md border` + `hover:bg-[var(--accent-bg)]`.
- Status badges: `${color}20` background + `color` text, `rounded-full`, tiny
  uppercase. Colores semánticos: success `#FF891A`, warning `#FFAE09`, danger `#E75300`, info `#FFB876`.
  Status colors live in `lib/constants.ts`.

---

## Checklist before adding UI

1. Reuse a `ui/*` primitive before writing a raw `<input>` / `<table>` / menu.
2. Tokens only — no literal grays/hex for surfaces, text or borders.
3. New form? Use the form primitives + the validation pattern above.
4. Client interactivity only where needed; keep Server Components by default.
5. Respect `docs/BEST_PRACTICES.md` (memoize columns, portal overlays, listeners
   only while open, derive don't store, etc.).
