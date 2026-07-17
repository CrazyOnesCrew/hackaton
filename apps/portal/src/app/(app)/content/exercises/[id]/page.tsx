import Link from "next/link";
import { notFound } from "next/navigation";
import { ExercisePreview } from "@/components/content/ExercisePreview";
import { requireContentManager } from "@/lib/auth/server";
import { getManagementExercise } from "@/lib/paag-api";

type Props = { params: Promise<{ id: string }> };

export default async function ExerciseDetailPage({ params }: Props) {
  await requireContentManager();
  const { id } = await params;
  const exercise = await getManagementExercise(id);
  if (!exercise) notFound();

  return (
    <div className="p-6">
      <Link
        href="/content/exercises"
        className="mb-4 inline-block text-sm font-semibold text-primary-strong hover:underline"
      >
        ← Volver al banco
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-ink">{exercise.title}</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Vista previa completa con respuestas y pistas (solo gestores).
      </p>
      <ExercisePreview exercise={exercise} />
    </div>
  );
}
