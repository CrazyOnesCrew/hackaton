/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { MathExercise } from '@/features/practice/exercises';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView, Text, View } from '@/components/ui';
import { MATH_EXERCISES } from '@/features/practice/exercises';
import { WebShell } from '@/features/study/web-shell';

const DIFFICULTY_LABEL: Record<MathExercise['difficulty'], string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
};

function ExerciseCard({ exercise }: { exercise: MathExercise }) {
  const router = useRouter();

  return (
    <Pressable
      testID={`exercise-${exercise.id}`}
      onPress={() => router.push(`/(app)/practice/${exercise.id}` as never)}
      className="mb-3 rounded-[24px] bg-white p-5"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="rounded-full bg-primary-soft px-3 py-1">
          <Text className="font-lato-bold text-xs text-primary-strong">
            {exercise.topic}
          </Text>
        </View>
        <Text className="font-lato text-xs text-slate-gray">
          {DIFFICULTY_LABEL[exercise.difficulty]}
          {' · '}
          {exercise.steps.length}
          {' '}
          pasos
        </Text>
      </View>
      <Text className="font-lato-black text-lg text-on-surface">{exercise.title}</Text>
      <Text className="font-lato mt-1 text-sm text-slate-gray">{exercise.statement}</Text>
      <View className="mt-3 flex-row items-center">
        <Text className="font-lato-bold text-sm text-primary-strong">Resolver</Text>
        <MaterialIcons name="chevron-right" size={18} color="#8B74E8" />
      </View>
    </Pressable>
  );
}

export function PracticeListScreen() {
  const router = useRouter();

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-primary-50" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <View className="mb-5 flex-row items-center gap-3">
            <Pressable
              testID="practice-list-back"
              onPress={() => router.back()}
              className="size-10 items-center justify-center rounded-full bg-white"
            >
              <MaterialIcons name="arrow-back" size={22} color="#1F2430" />
            </Pressable>
            <View className="flex-1">
              <Text className="font-lato-black text-2xl text-on-surface">
                Ejercicios de mates
              </Text>
              <Text className="font-lato text-sm text-slate-gray">
                Demo local — validación sin IA
              </Text>
            </View>
          </View>

          <View className="mb-4 rounded-[22px] bg-accent-soft p-4">
            <Text className="font-lato-bold text-sm text-on-surface">
              Resuelve paso a paso. El veredicto es inmediato y determinista (sin modelo).
            </Text>
          </View>

          {MATH_EXERCISES.map(exercise => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
