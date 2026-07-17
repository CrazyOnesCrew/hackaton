import { ContentPlaceholder } from "@/components/content/ContentPlaceholder";
import { requireContentManager } from "@/lib/auth/server";

export default async function ContentGradesPage() {
  await requireContentManager();
  return (
    <ContentPlaceholder
      title="Exportación de notas"
      description="Descarga CSV por contexto LTI. Se implementa en PAAG-304."
    />
  );
}
