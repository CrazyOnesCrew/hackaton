import { ContentPlaceholder } from "@/components/content/ContentPlaceholder";
import { requireContentManager } from "@/lib/auth/server";

export default async function ContentImportsPage() {
  await requireContentManager();
  return (
    <ContentPlaceholder
      title="Importaciones XML"
      description="Carga de archivos XML y reportes. Se implementa en PAAG-303."
    />
  );
}
