"use client";

import { ErrorState } from "@/components/layout/ErrorState";

// Route-group error boundary: catches failures thrown while rendering the
// portal area pages (401s are redirected server-side in layout.tsx before
// this ever fires; raw errors are never rendered here).
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
