import { ImportsPanel } from "@/components/content/ImportsPanel";
import { requireContentManager } from "@/lib/auth/server";
import { listImportJobs } from "@/lib/paag-api";

export default async function ContentImportsPage() {
  await requireContentManager();
  const { data } = await listImportJobs();

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-ink">Importaciones XML</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Sube un banco de ejercicios conforme al XSD y revisa el reporte de creados/rechazados.
      </p>
      <ImportsPanel initialJobs={data} />
    </div>
  );
}
