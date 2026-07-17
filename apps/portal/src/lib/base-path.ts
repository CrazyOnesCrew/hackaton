/**
 * Prefix an absolute app path with Next.js `basePath` (e.g. `/portal` in prod).
 *
 * `next/link` and the App Router handle basePath automatically; raw `fetch("/api/…")`
 * and plain `<a href>` do not — they resolve from the origin root and miss the
 * portal when it is served behind a path-based reverse proxy.
 */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_BASE_PATH ?? "";
  if (!path.startsWith("/")) {
    return `${base}/${path}`;
  }
  if (!base) return path;
  if (path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}
