/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { ExerciseStep, MathExercise } from '@/features/practice/exercises';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView, Text, View } from '@/components/ui';
import {

  PHASE_LABELS,
} from '@/features/practice/exercises';
import { useExerciseSession } from '@/features/practice/use-exercise-session';
import { WebShell } from '@/features/study/web-shell';

function CompletionCard({
  score,
  maxScore,
  onRestart,
  onMore,
}: {
  score: number;
  maxScore: number;
  onRestart: () => void;
  onMore: () => void;
}) {
  return (
    <View className="mt-6 rounded-[28px] bg-white p-6">
      <View className="mb-3 size-14 items-center justify-center rounded-full bg-accent-soft">
        <MaterialIcons name="emoji-events" size={28} color="#F5A623" />
      </View>
      <Text className="font-lato-black text-xl text-on-surface">¡Ejercicio completado!</Text>
      <Text className="font-lato mt-2 text-sm text-slate-gray">
        Puntuación demo:
        {' '}
        {score}
        {' / '}
        {maxScore}
        . Sin IA — solo validación local.
      </Text>
      <Pressable testID="exercise-restart" onPress={onRestart} className="mt-5 items-center rounded-full bg-primary py-3">
        <Text className="font-lato-bold text-white">Reintentar</Text>
      </Pressable>
      <Pressable testID="exercise-more" onPress={onMore} className="mt-3 items-center rounded-full bg-charcoal-800 py-3">
        <Text className="font-lato-bold text-white">Más ejercicios</Text>
      </Pressable>
    </View>
  );
}

function StepAnswerInput({
  step,
  selected,
  locked,
  onSelect,
}: {
  step: ExerciseStep;
  selected: string;
  locked: boolean;
  onSelect: (value: string) => void;
}) {
  if (step.kind === 'choice') {
    return (
      <View className="mt-4 gap-2">
        {step.options?.map(option => (
          <Pressable
            key={option.id}
            testID={`option-${option.id}`}
            disabled={locked}
            onPress={() => onSelect(option.id)}
            className={`rounded-2xl px-4 py-3 ${
              selected === option.id ? 'bg-primary-soft' : 'bg-surface-alt'
            }`}
          >
            <Text className="font-lato text-sm text-on-surface">{option.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <TextInput
      testID="numeric-answer"
      editable={!locked}
      value={selected}
      onChangeText={onSelect}
      keyboardType="numeric"
      placeholder="Escribe el número…"
      placeholderTextColor="#9CA3AF"
      className="font-lato mt-4 rounded-2xl bg-surface-alt px-4 py-3 text-base text-on-surface"
    />
  );
}

function StepCard({
  exercise,
  step,
  stepIndex,
  selected,
  feedback,
  isCorrect,
  showHint,
  onSelect,
  onHint,
  onSubmit,
  onNext,
}: {
  exercise: MathExercise;
  step: ExerciseStep;
  stepIndex: number;
  selected: string;
  feedback: string | null;
  isCorrect: boolean | null;
  showHint: boolean;
  onSelect: (value: string) => void;
  onHint: () => void;
  onSubmit: () => void;
  onNext: () => void;
}) {
  const isLast = stepIndex >= exercise.steps.length - 1;

  return (
    <View className="mt-5 rounded-[28px] bg-white p-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-lato-bold text-xs tracking-wide text-accent uppercase">
          {PHASE_LABELS[step.phase]}
        </Text>
        <Text className="font-lato text-xs text-slate-gray">
          {`Paso ${stepIndex + 1}/${exercise.steps.length}`}
        </Text>
      </View>
      <Text className="font-lato-black text-lg text-on-surface">{step.prompt}</Text>
      <StepAnswerInput step={step} selected={selected} locked={isCorrect === true} onSelect={onSelect} />
      {showHint
        ? (
            <View className="mt-3 rounded-2xl bg-accent-soft px-3 py-2">
              <Text className="font-lato text-sm text-on-surface">{`Pista: ${step.hint}`}</Text>
            </View>
          )
        : null}
      {feedback
        ? (
            <View className={`mt-3 rounded-2xl px-3 py-2 ${isCorrect ? 'bg-success-50' : 'bg-danger-soft'}`}>
              <Text className={`font-lato text-sm ${isCorrect ? 'text-success-700' : 'text-danger'}`}>
                {feedback}
              </Text>
            </View>
          )
        : null}
      <View className="mt-5 flex-row gap-2">
        <Pressable testID="show-hint" onPress={onHint} className="flex-1 items-center rounded-full bg-surface-alt py-3">
          <Text className="font-lato-bold text-sm text-slate-gray">Pista</Text>
        </Pressable>
        {isCorrect
          ? (
              <Pressable testID="next-step" onPress={onNext} className="flex-2 items-center rounded-full bg-charcoal-800 py-3">
                <Text className="font-lato-bold text-sm text-white">{isLast ? 'Finalizar' : 'Siguiente'}</Text>
              </Pressable>
            )
          : (
              <Pressable testID="submit-answer" onPress={onSubmit} className="flex-2 items-center rounded-full bg-primary py-3">
                <Text className="font-lato-bold text-sm text-white">Comprobar</Text>
              </Pressable>
            )}
      </View>
    </View>
  );
}

export function ExerciseSolveScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useExerciseSession(id);

  if (!session.exercise || !session.step) {
    return (
      <WebShell>
        <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
          <Text className="font-lato-bold text-lg text-on-surface">Ejercicio no encontrado</Text>
          <Pressable onPress={() => router.replace('/(app)/practice' as never)} className="mt-4 rounded-full bg-primary px-5 py-3">
            <Text className="font-lato-bold text-white">Volver al listado</Text>
          </Pressable>
        </SafeAreaView>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable testID="exercise-back" onPress={() => router.back()} className="size-10 items-center justify-center rounded-full bg-white">
              <MaterialIcons name="arrow-back" size={22} color="#1F2430" />
            </Pressable>
            <View className="rounded-full bg-primary-soft px-3 py-1">
              <Text className="font-lato-bold text-xs text-primary-strong">{`Puntos: ${session.score}`}</Text>
            </View>
          </View>
          <Text className="font-lato-black text-2xl text-on-surface">{session.exercise.title}</Text>
          <Text className="font-lato mt-1 text-sm text-slate-gray">{session.exercise.statement}</Text>
          {session.done
            ? (
                <CompletionCard
                  score={session.score}
                  maxScore={session.exercise.steps.length * 10}
                  onRestart={session.restart}
                  onMore={() => router.replace('/(app)/practice' as never)}
                />
              )
            : (
                <StepCard
                  exercise={session.exercise}
                  step={session.step}
                  stepIndex={session.stepIndex}
                  selected={session.selected}
                  feedback={session.feedback}
                  isCorrect={session.isCorrect}
                  showHint={session.showHint}
                  onSelect={session.onSelect}
                  onHint={session.showHintNow}
                  onSubmit={session.submit}
                  onNext={session.goNext}
                />
              )}
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
