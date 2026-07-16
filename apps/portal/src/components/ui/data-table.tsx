"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  ChevronsUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Search, ListFilter, CalendarRange, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Checkbox } from "./checkbox";
import Dropdown from "./Dropdown";

export interface DataTableFacet {
  columnId: string;
  title: string;
  options: { label: string; value: string }[];
}

export type DataTableFilter =
  | { type: "multiselect"; columnId: string; label: string; options: { label: string; value: string }[] }
  | { type: "daterange"; columnId: string; label: string };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  facets?: DataTableFacet[];
  /** Advanced filters: multi-select (chips) + date range. */
  filters?: DataTableFilter[];
  pageSize?: number;
  maxBodyHeight?: string;
  emptyMessage?: string;
  toolbarRight?: React.ReactNode;
  selectable?: boolean;
}

type ColMeta = { className?: string; headerClassName?: string };

// Column filter fns consumers set on their ColumnDef to drive the advanced
// filters. eslint/any: TanStack passes the row generically here.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const multiSelectFilterFn: FilterFn<any> = (row, columnId, value: string[]) => {
  if (!value?.length) return true;
  return value.includes(String(row.getValue(columnId)));
};
export const dateRangeFilterFn: FilterFn<any> = (row, columnId, value: { from?: string; to?: string }) => {
  if (!value || (!value.from && !value.to)) return true;
  const d = new Date(row.getValue(columnId) as string).getTime();
  if (value.from && d < new Date(value.from).getTime()) return false;
  if (value.to && d > new Date(`${value.to}T23:59:59`).getTime()) return false;
  return true;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const fmtShort = (v: string) => new Date(v).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

function paginationRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const around = [current - 1, current, current + 1].filter((p) => p > 1 && p < total);
  const seq = [1, ...around, total];
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of seq) {
    if (prev) {
      if (p - prev === 2) out.push(prev + 1);
      else if (p - prev > 2) out.push("…");
    }
    out.push(p);
    prev = p;
  }
  return out;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Buscar…",
  facets = [],
  filters = [],
  pageSize = 10,
  maxBodyHeight = "32rem",
  emptyMessage = "Sin resultados.",
  toolbarRight,
  selectable = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const globalFilterFn: FilterFn<TData> = (row, _columnId, value) => {
    const q = String(value).trim().toLowerCase();
    if (!q) return true;
    return Object.values(row.original as Record<string, unknown>).some(
      (v) => typeof v === "string" && v.toLowerCase().includes(q),
    );
  };

  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!selectable) return columns;
    const selectCol: ColumnDef<TData, TValue> = {
      id: "__select",
      size: 44,
      enableSorting: false,
      meta: { className: "w-11", headerClassName: "w-11" } as ColMeta,
      header: ({ table }) => (
        <Checkbox
          aria-label="Seleccionar todo"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => <Checkbox aria-label="Seleccionar fila" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
    };
    return [selectCol, ...columns];
  }, [columns, selectable]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns functions React Compiler can't memoize; expected.
  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const selectedCount = Object.keys(rowSelection).length;
  const pages = paginationRange(pageIndex + 1, Math.max(pageCount, 1));

  // Active filter chips derived from column filter state.
  const chips: { key: string; label: string; remove: () => void }[] = [];
  for (const f of filters) {
    const col = table.getColumn(f.columnId);
    if (f.type === "multiselect") {
      const sel = (col?.getFilterValue() as string[]) ?? [];
      for (const v of sel) {
        const opt = f.options.find((o) => o.value === v);
        chips.push({
          key: `${f.columnId}:${v}`,
          label: `${f.label}: ${opt?.label ?? v}`,
          remove: () => col?.setFilterValue(sel.filter((x) => x !== v)),
        });
      }
    } else {
      const val = (col?.getFilterValue() as { from?: string; to?: string }) ?? {};
      if (val.from || val.to) {
        chips.push({
          key: f.columnId,
          label: `${f.label}: ${val.from ? fmtShort(val.from) : "…"} – ${val.to ? fmtShort(val.to) : "…"}`,
          remove: () => col?.setFilterValue(undefined),
        });
      }
    }
  }
  const clearAll = () => filters.forEach((f) => table.getColumn(f.columnId)?.setFilterValue(undefined));

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b p-3" style={{ borderColor: "var(--border)" }}>
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-faint)" }} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Buscar"
            className="sidebar-input"
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>

        {filters.map((f) =>
          f.type === "multiselect" ? (
            <MultiSelectControl key={f.columnId} table={table} filter={f} />
          ) : (
            <DateRangeControl key={f.columnId} table={table} filter={f} />
          ),
        )}

        {facets.map((f) => {
          const col = table.getColumn(f.columnId);
          const value = (col?.getFilterValue() as string) ?? "";
          return (
            <select key={f.columnId} value={value} onChange={(e) => col?.setFilterValue(e.target.value || undefined)} aria-label={f.title} className="sidebar-select max-w-[180px]">
              <option value="">{f.title}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          );
        })}

        {toolbarRight && <div className="ml-auto">{toolbarRight}</div>}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--fg-faint)" }}>Filtros:</span>
          {chips.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full border py-1 pl-2.5 pr-1.5 text-xs font-medium" style={{ borderColor: "rgba(91,95,239,0.3)", background: "var(--accent-bg-sel)", color: "#5b5fef" }}>
              {c.label}
              <button onClick={c.remove} aria-label={`Quitar ${c.label}`} className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-[rgba(91,95,239,0.2)]">
                <X size={11} />
              </button>
            </span>
          ))}
          <button onClick={clearAll} className="ml-1 text-xs font-medium transition-colors hover:underline" style={{ color: "var(--fg-muted)" }}>
            Limpiar todo
          </button>
        </div>
      )}

      {/* Scroll body */}
      <div className="custom-scrollbar overflow-auto" style={{ maxHeight: maxBodyHeight }}>
        <Table className="min-w-[640px]">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColMeta | undefined;
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id} className={meta?.headerClassName} style={{ width: header.column.columnDef.size }}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 uppercase transition-colors hover:text-[var(--fg)]">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? <ChevronUp size={13} /> : sorted === "desc" ? <ChevronDown size={13} /> : <ChevronsUpDown size={12} className="opacity-50" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={allColumns.length} className="h-32 text-center">
                  <span className="text-sm" style={{ color: "var(--fg-muted)" }}>{emptyMessage}</span>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as ColMeta | undefined;
                    return (
                      <TableCell key={cell.id} className={cn("py-3.5", meta?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {selectable && selectedCount > 0 ? `${selectedCount} seleccionado${selectedCount === 1 ? "" : "s"} · ` : ""}
          {total} resultado{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-1">
          <PagerButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} label="Anterior">
            <ChevronLeft size={15} /> <span className="hidden sm:inline">Anterior</span>
          </PagerButton>
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`dots-${i}`} className="px-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => table.setPageIndex(p - 1)}
                aria-current={p === pageIndex + 1 ? "page" : undefined}
                className="flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors"
                style={p === pageIndex + 1 ? { borderColor: "#5b5fef", background: "var(--accent-bg-sel)", color: "#5b5fef" } : { borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                {p}
              </button>
            ),
          )}
          <PagerButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} label="Siguiente">
            <span className="hidden sm:inline">Siguiente</span> <ChevronRight size={15} />
          </PagerButton>
        </div>
      </div>
    </div>
  );
}

const filterTriggerClass = "flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-[var(--accent-bg)]";

function MultiSelectControl<TData>({ table, filter }: { table: TanstackTable<TData>; filter: Extract<DataTableFilter, { type: "multiselect" }> }) {
  const col = table.getColumn(filter.columnId);
  const selected = (col?.getFilterValue() as string[]) ?? [];
  return (
    <Dropdown
      align="left"
      panelClassName="w-52 p-1"
      triggerClassName={filterTriggerClass}
      triggerStyle={{ borderColor: selected.length ? "rgba(91,95,239,0.4)" : "var(--border)", color: selected.length ? "#5b5fef" : "var(--fg-muted)" }}
      triggerLabel={filter.label}
      trigger={
        <>
          <ListFilter size={15} /> {filter.label}
          {selected.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "#5b5fef" }}>{selected.length}</span>
          )}
          <ChevronDown size={14} style={{ color: "var(--fg-faint)" }} />
        </>
      }
    >
      {() => (
        <>
          {filter.options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => col?.setFilterValue(checked ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--accent-bg)]"
                style={{ color: "var(--fg)" }}
                role="menuitemcheckbox"
                aria-checked={checked}
              >
                <Checkbox checked={checked} />
                {o.label}
              </button>
            );
          })}
        </>
      )}
    </Dropdown>
  );
}

function DateRangeControl<TData>({ table, filter }: { table: TanstackTable<TData>; filter: Extract<DataTableFilter, { type: "daterange" }> }) {
  const col = table.getColumn(filter.columnId);
  const val = (col?.getFilterValue() as { from?: string; to?: string }) ?? {};
  const active = !!(val.from || val.to);
  return (
    <Dropdown
      align="left"
      panelClassName="w-64 p-3"
      triggerClassName={filterTriggerClass}
      triggerStyle={{ borderColor: active ? "rgba(91,95,239,0.4)" : "var(--border)", color: active ? "#5b5fef" : "var(--fg-muted)" }}
      triggerLabel={filter.label}
      trigger={
        <>
          <CalendarRange size={15} /> {filter.label}
          {active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#5b5fef" }} />}
          <ChevronDown size={14} style={{ color: "var(--fg-faint)" }} />
        </>
      }
    >
      {({ close }) => (
        <DateRangePanel
          value={val}
          onApply={(v) => {
            col?.setFilterValue(v.from || v.to ? v : undefined);
            close();
          }}
          onClear={() => {
            col?.setFilterValue(undefined);
            close();
          }}
        />
      )}
    </Dropdown>
  );
}

function DateRangePanel({
  value,
  onApply,
  onClear,
}: {
  value: { from?: string; to?: string };
  onApply: (v: { from?: string; to?: string }) => void;
  onClear: () => void;
}) {
  const [from, setFrom] = React.useState(value.from ?? "");
  const [to, setTo] = React.useState(value.to ?? "");
  return (
    <div className="space-y-2.5">
      <label className="block">
        <span className="mb-1 block text-xs font-medium" style={{ color: "var(--fg-muted)" }}>Desde</span>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field-control h-9 px-2.5" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium" style={{ color: "var(--fg-muted)" }}>Hasta</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field-control h-9 px-2.5" />
      </label>
      <div className="flex items-center justify-between gap-2 pt-1">
        <button onClick={onClear} className="text-xs font-medium transition-colors hover:underline" style={{ color: "var(--fg-muted)" }}>
          Limpiar
        </button>
        <button onClick={() => onApply({ from: from || undefined, to: to || undefined })} className="btn-primary px-3 py-1.5 text-xs">
          Aplicar
        </button>
      </div>
    </div>
  );
}

function PagerButton({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors hover:bg-[var(--accent-bg)] disabled:pointer-events-none disabled:opacity-40"
      style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
    >
      {children}
    </button>
  );
}
