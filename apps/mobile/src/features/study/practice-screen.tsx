/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { CalculusExercise } from '@/features/study/calculus-exercises';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
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

function ProgressDots({
  total,
  current,
  tint,
}: {
  total: number;
  current: number;
  tint: string;
}) {
  return (
    <View className="mt-3 flex-row items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        return (
          <MotiView
            key={`dot-${i}`}
            from={{ scale: 0.6, opacity: 0.4 }}
            animate={{
              scale: filled ? 1 : 0.85,
              opacity: filled ? 1 : 0.35,
              width: i === current - 1 ? 18 : 8,
            }}
            transition={{ type: 'spring', damping: 14, stiffness: 180 }}
            style={{
              height: 8,
              borderRadius: 999,
              backgroundColor: filled ? tint : '#D1D5DB',
            }}
          />
        );
      })}
    </View>
  );
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
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 280 }}
            className="mb-5 flex-row items-center justify-between"
          >
            <MotiPressable
              testID="practice-back"
              onPress={() => router.back()}
              animate={({ pressed }) => {
                'worklet';
                return { scale: pressed ? 0.92 : 1 };
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                backgroundColor: '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="arrow-back" size={22} color="#1F2430" />
            </MotiPressable>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: `${topic.tint}33` }}
            >
              <Text className="font-lato-bold text-xs" style={{ color: topic.tint }}>
                {topic.name}
              </Text>
            </View>
          </MotiView>

          <AnimatePresence exitBeforeEnter>
            {isComplete
              ? (
                  <MotiView
                    key="complete"
                    from={{ opacity: 0, scale: 0.9, translateY: 24 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 140 }}
                    className="rounded-[28px] bg-white p-6"
                  >
                    <MotiView
                      from={{ scale: 0.4, rotate: '-20deg' }}
                      animate={{ scale: 1, rotate: '0deg' }}
                      transition={{ type: 'spring', damping: 10, stiffness: 160, delay: 80 }}
                    >
                      <MaterialIcons name="emoji-events" size={48} color="#F5A623" />
                    </MotiView>
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
                    <MotiPressable
                      testID="practice-finish"
                      onPress={() => router.back()}
                      animate={({ pressed }) => {
                        'worklet';
                        return { scale: pressed ? 0.97 : 1 };
                      }}
                      style={{
                        marginTop: 24,
                        alignItems: 'center',
                        borderRadius: 999,
                        backgroundColor: '#8B74E8',
                        paddingVertical: 12,
                      }}
                    >
                      <Text className="font-lato-bold text-white">Volver al inicio</Text>
                    </MotiPressable>
                  </MotiView>
                )
              : (
                  <MotiView
                    key={`exercise-${exercise.id}-${reshuffleKey}`}
                    from={{ opacity: 0, translateX: 28 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -24 }}
                    transition={{ type: 'timing', duration: 320 }}
                  >
                    <Text className="font-lato text-sm text-slate-gray">
                      Ejercicio
                      {' '}
                      {index + 1}
                      {' '}
                      de
                      {' '}
                      {exercises.length}
                    </Text>

                    <ProgressDots
                      total={exercises.length}
                      current={index + 1}
                      tint={topic.tint}
                    />

                    <MotiView
                      from={{ opacity: 0, translateY: 16 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'timing', duration: 300, delay: 60 }}
                      className="mt-4 rounded-[28px] bg-white p-6"
                    >
                      <Text className="font-lato-black text-xl/7 text-on-surface">
                        {exercise.question}
                      </Text>
                    </MotiView>

                    <View className="mt-5 gap-3">
                      {shuffledOptions.map((option, optionIndex) => {
                        const chosen = selected === option.label;
                        const showCorrect = selected !== null && option.label === exercise.correctAnswer;
                        const showWrong = selected !== null && chosen && !showCorrect;

                        const borderColor = showCorrect
                          ? '#22C55E'
                          : showWrong
                            ? '#DC2626'
                            : chosen
                              ? '#8B74E8'
                              : 'transparent';
                        const backgroundColor = showCorrect
                          ? '#F0FDF4'
                          : showWrong
                            ? '#FEF2F2'
                            : chosen
                              ? '#F5F3FF'
                              : '#ffffff';

                        return (
                          <MotiView
                            key={`${option.key}-${reshuffleKey}`}
                            from={{ opacity: 0, translateY: 14, scale: 0.98 }}
                            animate={{
                              opacity: 1,
                              translateY: 0,
                              scale: showCorrect || showWrong ? 1.02 : 1,
                            }}
                            transition={{
                              type: 'timing',
                              duration: 280,
                              delay: 100 + optionIndex * 70,
                            }}
                          >
                            <MotiPressable
                              testID={`option-${optionIndex}`}
                              disabled={selected !== null}
                              onPress={() => setSelected(option.label)}
                              animate={({ pressed }) => {
                                'worklet';
                                return {
                                  scale: pressed && selected === null ? 0.98 : 1,
                                };
                              }}
                              style={{
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor,
                                backgroundColor,
                                paddingHorizontal: 16,
                                paddingVertical: 16,
                              }}
                            >
                              <Text className="font-lato-bold text-base text-on-surface">
                                {option.label}
                              </Text>
                            </MotiPressable>
                          </MotiView>
                        );
                      })}
                    </View>

                    <AnimatePresence>
                      {selected !== null
                        ? (
                            <MotiView
                              key="feedback"
                              from={{ opacity: 0, translateY: 20, scale: 0.96 }}
                              animate={{ opacity: 1, translateY: 0, scale: 1 }}
                              exit={{ opacity: 0, translateY: 8 }}
                              transition={{ type: 'spring', damping: 16, stiffness: 160 }}
                              className="mt-5 rounded-[24px] bg-white p-5"
                            >
                              <MotiView
                                from={{ scale: 0.85, opacity: 0.6 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 180 }}
                              >
                                <Text
                                  className={`font-lato-bold text-base ${
                                    isCorrect ? 'text-success-600' : 'text-danger-600'
                                  }`}
                                >
                                  {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                                </Text>
                              </MotiView>
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
                                <MotiPressable
                                  testID="reshuffle-options"
                                  onPress={retryShuffle}
                                  animate={({ pressed }) => {
                                    'worklet';
                                    return { scale: pressed ? 0.97 : 1 };
                                  }}
                                  style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: '#8B74E8',
                                    paddingVertical: 12,
                                  }}
                                >
                                  <Text className="font-lato-bold text-primary">Reordenar</Text>
                                </MotiPressable>
                                <MotiPressable
                                  testID="next-exercise"
                                  onPress={goNext}
                                  animate={({ pressed }) => {
                                    'worklet';
                                    return { scale: pressed ? 0.97 : 1 };
                                  }}
                                  style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    borderRadius: 999,
                                    backgroundColor: '#8B74E8',
                                    paddingVertical: 12,
                                  }}
                                >
                                  <Text className="font-lato-bold text-white">
                                    {index + 1 >= exercises.length ? 'Finalizar' : 'Siguiente'}
                                  </Text>
                                </MotiPressable>
                              </View>
                            </MotiView>
                          )
                        : (
                            <MotiView
                              key="shuffle-cta"
                              from={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ type: 'timing', duration: 240, delay: 280 }}
                            >
                              <MotiPressable
                                testID="shuffle-again"
                                onPress={retryShuffle}
                                animate={({ pressed }) => {
                                  'worklet';
                                  return { scale: pressed ? 0.96 : 1 };
                                }}
                                style={{
                                  marginTop: 20,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                }}
                              >
                                <MaterialIcons name="shuffle" size={18} color="#8B74E8" />
                                <Text className="font-lato-bold text-sm text-primary">
                                  Mezclar respuestas otra vez
                                </Text>
                              </MotiPressable>
                            </MotiView>
                          )}
                    </AnimatePresence>
                  </MotiView>
                )}
          </AnimatePresence>
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
