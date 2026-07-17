import { ExercisesBank } from "@/components/content/ExercisesBank";
import { requireContentManager } from "@/lib/auth/server";
import { listManagementExercises } from "@/lib/paag-api";

export default async function ContentExercisesPage() {
  await requireContentManager();
  const { data } = await listManagementExercises();

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-bold text-ink">Banco de ejercicios</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Filtra, previsualiza, publica y reordena ejercicios del banco.
      </p>
      <ExercisesBank initial={data} />
    </div>
  );
}
