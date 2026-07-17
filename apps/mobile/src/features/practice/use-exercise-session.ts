import type { ExerciseStep, MathExercise } from '@/features/practice/exercises';

import * as React from 'react';
import {

  getExerciseById,

} from '@/features/practice/exercises';

function checkAnswer(step: ExerciseStep, raw: string): boolean {
  if (step.kind === 'choice')
    return raw === step.correct;

  const parsed = Number(String(raw).trim().replace(',', '.'));
  if (Number.isNaN(parsed))
    return false;

  return parsed === Number(step.correct);
}

export function useExerciseSession(exerciseId: string | undefined) {
  const exercise = getExerciseById(exerciseId ?? '');
  const [stepIndex, setStepIndex] = React.useState(0);
  const [selected, setSelected] = React.useState('');
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const step = exercise?.steps[stepIndex];

  const resetStepState = React.useCallback(() => {
    setSelected('');
    setFeedback(null);
    setIsCorrect(null);
    setShowHint(false);
  }, []);

  const onSelect = React.useCallback((value: string) => {
    setSelected(value);
    setFeedback(null);
    setIsCorrect(null);
  }, []);

  const submit = React.useCallback(() => {
    if (!step || !selected.trim())
      return;

    const ok = checkAnswer(step, selected);
    setIsCorrect(ok);
    setFeedback(ok ? step.successFeedback : step.errorFeedback);
    if (ok)
      setScore(prev => prev + 10);
  }, [selected, step]);

  const goNext = React.useCallback(() => {
    if (!exercise)
      return;

    if (stepIndex >= exercise.steps.length - 1) {
      setDone(true);
      return;
    }

    setStepIndex(prev => prev + 1);
    resetStepState();
  }, [exercise, resetStepState, stepIndex]);

  const restart = React.useCallback(() => {
    setStepIndex(0);
    setScore(0);
    setDone(false);
    resetStepState();
  }, [resetStepState]);

  return {
    exercise: exercise as MathExercise | undefined,
    step,
    stepIndex,
    selected,
    feedback,
    isCorrect,
    score,
    done,
    showHint,
    onSelect,
    submit,
    goNext,
    restart,
    showHintNow: () => setShowHint(true),
  };
}
