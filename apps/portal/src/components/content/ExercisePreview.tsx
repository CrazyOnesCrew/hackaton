"use client";

import { Chip } from "@/components/ui/chip";
import { Card } from "@/components/ui/card";
import { MathText } from "@/components/content/MathText";
import type { ManagementExercise, ManagementStep } from "@/lib/paag-types";

const PHASE_LABELS: Record<ManagementStep["phase"], string> = {
  identification: "Identificación",
  strategy: "Estrategia",
  procedure: "Procedimiento",
  verification: "Verificación",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

function answerLabel(step: ManagementStep): string {
  if (step.correctAnswer == null) return "—";
  if (Array.isArray(step.correctAnswer)) return step.correctAnswer.join(", ");
  if (step.options?.length) {
    const opt = step.options.find((o) => o.id === step.correctAnswer);
    return opt ? `${opt.id}: ${opt.label}` : String(step.correctAnswer);
  }
  return String(step.correctAnswer);
}

export function ExercisePreview({ exercise }: { exercise: ManagementExercise }) {
  const steps = [...(exercise.steps ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Chip variant="active">{STATUS_LABEL[exercise.status] ?? exercise.status}</Chip>
        <Chip variant="inactive">
          {DIFFICULTY_LABEL[exercise.difficulty] ?? exercise.difficulty}
        </Chip>
        <Chip variant="inactive">{exercise.topicName}</Chip>
        <Chip variant="highlight">{exercise.source === "xml" ? "XML" : "Manual"}</Chip>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-bold text-ink">Enunciado</h2>
        <MathText text={exercise.statement ?? "Sin enunciado."} className="text-ink" />
      </Card>

      <section aria-labelledby="steps-heading" className="space-y-4">
        <h2 id="steps-heading" className="text-lg font-bold text-ink">
          Pasos ({steps.length})
        </h2>
        {steps.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-muted">Este ejercicio aún no tiene pasos.</p>
          </Card>
        ) : (
          steps.map((step) => (
            <Card key={step.id} aria-label={`Paso ${step.position}`}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Chip variant="active">{PHASE_LABELS[step.phase]}</Chip>
                <span className="text-xs font-semibold text-ink-muted">
                  {step.answerType} · {step.maxScore} pts
                </span>
              </div>
              <MathText text={step.prompt} className="mb-3 font-medium text-ink" />
              {step.options?.length ? (
                <ul className="mb-3 space-y-1.5">
                  {step.options.map((opt) => {
                    const correct =
                      step.correctAnswer === opt.id ||
                      (Array.isArray(step.correctAnswer) &&
                        step.correctAnswer.includes(opt.id));
                    return (
                      <li
                        key={opt.id}
                        className={`rounded-pill px-3 py-1.5 text-sm ${
                          correct ? "bg-primary-soft font-semibold text-ink" : "bg-surface text-ink-muted"
                        }`}
                      >
                        {opt.id}. {opt.label}
                        {correct ? " ✓" : ""}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <p className="text-sm text-ink">
                <span className="font-semibold">Respuesta esperada:</span> {answerLabel(step)}
                {typeof step.tolerance === "number" ? ` (tol. ${step.tolerance})` : ""}
              </p>
              {step.hints?.length ? (
                <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3">
                  {step.hints.map((hint, i) => (
                    <li key={i} className="text-sm text-ink-muted">
                      Pista {i + 1} (−{hint.penaltyPercent}%): {hint.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
