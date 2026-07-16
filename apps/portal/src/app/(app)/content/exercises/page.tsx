import { ContentPlaceholder } from "@/components/content/ContentPlaceholder";
import { requireContentManager } from "@/lib/auth/server";

export default async function ContentExercisesPage() {
  await requireContentManager();
  return (
    <ContentPlaceholder
      title="Banco de ejercicios"
      description="Listado, filtros y preview del banco. Se implementa en PAAG-302."
    />
  );
}
