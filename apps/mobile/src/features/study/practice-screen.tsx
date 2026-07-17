/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { CalculusExercise } from '@/features/study/calculus-exercises';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';
import {
  getExercisesByTopic,
  getTopicById,
} from '@/features/study/calculus-exercises';
import { shuffle } from '@/features/study/shuffle';
import { WebShell } from '@/features/study/web-shell';

type ShuffledOption = {
  label: string;
  key: string;
};

function useShuffledOptions(
  exercise: CalculusExercise | undefined,
  reshuffleKey: number,
): ShuffledOption[] {
  return React.useMemo(() => {
    if (!exercise)
      return [];

    return shuffle(exercise.options).map((label, index) => ({
      label,
      key: `${exercise.id}-${label}-${index}`,
    }));
  }, [exercise, reshuffleKey]);
}

export function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ topicId?: string }>();
  const topicId = params.topicId ?? 'limits';
  const topic = getTopicById(topicId);
  const exercises = getExercisesByTopic(topicId);

  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [reshuffleKey, setReshuffleKey] = React.useState(0);

  const exercise = exercises[index];
  const shuffledOptions = useShuffledOptions(exercise, reshuffleKey);

  const isComplete = index >= exercises.length;
  const isCorrect = selected !== null && selected === exercise?.correctAnswer;

  const goNext = () => {
    setSelected(null);
    setIndex(previous => previous + 1);
    setReshuffleKey(previous => previous + 1);
  };

  const retryShuffle = () => {
    setSelected(null);
    setReshuffleKey(previous => previous + 1);
  };

  if (!topic || exercises.length === 0) {
    return (
      <WebShell>
        <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 px-6">
          <Text className="font-lato-bold text-center text-lg text-on-surface">
            No hay ejercicios para este tema.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 rounded-full bg-primary px-6 py-3"
          >
            <Text className="font-lato-bold text-white">Volver</Text>
          </Pressable>
        </SafeAreaView>
      </WebShell>
    );
  }

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-primary-50" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Pressable
              testID="practice-back"
              onPress={() => router.back()}
              className="size-10 items-center justify-center rounded-full bg-white"
            >
              <MaterialIcons name="arrow-back" size={22} color="#1F2430" />
            </Pressable>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: `${topic.tint}33` }}
            >
              <Text className="font-lato-bold text-xs" style={{ color: topic.tint }}>
                {topic.name}
              </Text>
            </View>
          </View>

          {isComplete
            ? (
                <View className="rounded-[28px] bg-white p-6">
                  <MaterialIcons name="emoji-events" size={48} color="#F5A623" />
                  <Text className="font-lato-black mt-4 text-2xl text-on-surface">
                    ¡Tema completado!
                  </Text>
                  <Text className="font-lato mt-2 text-sm text-slate-gray">
                    Resolviste
                    {' '}
                    {exercises.length}
                    {' '}
                    ejercicios de
                    {' '}
                    {topic.name}
                    .
                  </Text>
                  <Pressable
                    testID="practice-finish"
                    onPress={() => router.back()}
                    className="mt-6 items-center rounded-full bg-primary py-3"
                  >
                    <Text className="font-lato-bold text-white">Volver al inicio</Text>
                  </Pressable>
                </View>
              )
            : (
                <>
                  <Text className="font-lato text-sm text-slate-gray">
                    Ejercicio
                    {' '}
                    {index + 1}
                    {' '}
                    de
                    {' '}
                    {exercises.length}
                  </Text>

                  <View className="mt-4 rounded-[28px] bg-white p-6">
                    <Text className="font-lato-black text-xl/7 text-on-surface">
                      {exercise.question}
                    </Text>
                  </View>

                  <View className="mt-5 gap-3">
                    {shuffledOptions.map((option, optionIndex) => {
                      const chosen = selected === option.label;
                      const showCorrect = selected !== null && option.label === exercise.correctAnswer;
                      const showWrong = selected !== null && chosen && !showCorrect;

                      return (
                        <Pressable
                          key={`${option.key}-${reshuffleKey}`}
                          testID={`option-${optionIndex}`}
                          disabled={selected !== null}
                          onPress={() => setSelected(option.label)}
                          className={`rounded-2xl border-2 px-4 py-4 ${
                            showCorrect
                              ? 'border-success-500 bg-success-50'
                              : showWrong
                                ? 'border-danger-600 bg-danger-50'
                                : chosen
                                  ? 'border-primary bg-primary-50'
                                  : 'border-transparent bg-white'
                          }`}
                        >
                          <Text className="font-lato-bold text-base text-on-surface">
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {selected !== null
                    ? (
                        <View className="mt-5 rounded-[24px] bg-white p-5">
                          <Text
                            className={`font-lato-bold text-base ${
                              isCorrect ? 'text-success-600' : 'text-danger-600'
                            }`}
                          >
                            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                          </Text>
                          <Text className="font-lato mt-2 text-sm text-slate-gray">
                            {exercise.explanation}
                          </Text>
                          {!isCorrect
                            ? (
                                <Text className="font-lato-bold mt-2 text-sm text-on-surface">
                                  Respuesta correcta:
                                  {' '}
                                  {exercise.correctAnswer}
                                </Text>
                              )
                            : null}
                          <View className="mt-4 flex-row gap-3">
                            <Pressable
                              testID="reshuffle-options"
                              onPress={retryShuffle}
                              className="flex-1 items-center rounded-full border border-primary py-3"
                            >
                              <Text className="font-lato-bold text-primary">Reordenar</Text>
                            </Pressable>
                            <Pressable
                              testID="next-exercise"
                              onPress={goNext}
                              className="flex-1 items-center rounded-full bg-primary py-3"
                            >
                              <Text className="font-lato-bold text-white">
                                {index + 1 >= exercises.length ? 'Finalizar' : 'Siguiente'}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )
                    : (
                        <Pressable
                          testID="shuffle-again"
                          onPress={retryShuffle}
                          className="mt-5 flex-row items-center justify-center gap-2"
                        >
                          <MaterialIcons name="shuffle" size={18} color="#8B74E8" />
                          <Text className="font-lato-bold text-sm text-primary">
                            Mezclar respuestas otra vez
                          </Text>
                        </Pressable>
                      )}
                </>
              )}
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
