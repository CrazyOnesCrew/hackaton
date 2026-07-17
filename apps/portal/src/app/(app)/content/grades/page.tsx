import { GradesExport } from "@/components/content/GradesExport";
import { requireContentManager } from "@/lib/auth/server";
import { listLtiContexts } from "@/lib/paag-api";

export default async function ContentGradesPage() {
  await requireContentManager();
  const contexts = await listLtiContexts();

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-ink">Exportación de notas</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Descarga un CSV por contexto LTI como contingencia del grade passback.
      </p>
      <GradesExport contexts={contexts} />
    </div>
  );
}
