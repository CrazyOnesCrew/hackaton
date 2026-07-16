export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-ES").format(n);
}

export function formatCurrency(
  n: number,
  opts: { decimals?: number } = {},
): string {
  const decimals = opts.decimals ?? 0;
  return `${new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)} €`;
}
