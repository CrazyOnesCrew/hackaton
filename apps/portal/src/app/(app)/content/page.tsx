import { ContentDashboard } from "@/components/content/ContentDashboard";
import { requireContentManager } from "@/lib/auth/server";
import { getContentDashboardSummary } from "@/lib/paag-api";

export default async function ContentHomePage() {
  await requireContentManager();
  const summary = await getContentDashboardSummary();

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-ink">Gestor de contenidos</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Resumen del banco de ejercicios e importaciones recientes.
      </p>
      <ContentDashboard summary={summary} />
    </div>
  );
}
