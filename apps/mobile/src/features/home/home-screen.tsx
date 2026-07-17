/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { CalculusTopic } from '@/features/study/calculus-exercises';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import * as React from 'react';
import { ScrollView } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';
import {
  CALCULUS_TOPICS,
  countExercisesByTopic,
} from '@/features/study/calculus-exercises';
import { readLtiContext } from '@/app/lti-entry';
import { WebShell } from '@/features/study/web-shell';

function TopicCard({
  topic,
  index,
  onPress,
}: {
  topic: CalculusTopic;
  index: number;
  onPress: () => void;
}) {
  const count = countExercisesByTopic(topic.id);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 28, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 420,
        delay: 220 + index * 90,
      }}
      className="mb-4"
    >
      <MotiPressable
        testID={`topic-${topic.id}`}
        onPress={onPress}
        animate={({ pressed }) => {
          'worklet';
          return {
            scale: pressed ? 0.97 : 1,
          };
        }}
        transition={{ type: 'timing', duration: 120 }}
        style={{
          borderRadius: 28,
          backgroundColor: '#ffffff',
          padding: 20,
        }}
      >
        <View className="flex-row items-start gap-4">
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 14,
              stiffness: 180,
              delay: 280 + index * 90,
            }}
            className="size-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${topic.tint}33` }}
          >
            <MaterialIcons name={topic.icon} size={28} color={topic.tint} />
          </MotiView>
          <View className="flex-1">
            <Text className="font-lato-black text-lg text-on-surface">{topic.name}</Text>
            <Text className="font-lato mt-1 text-sm text-slate-gray">{topic.description}</Text>
            <View className="mt-3 flex-row items-center gap-2">
              <View className="rounded-full bg-accent-soft px-3 py-1">
                <Text className="font-lato-bold text-xs text-accent">
                  {count}
                  {' '}
                  ejercicios
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#8B74E8" />
            </View>
          </View>
        </View>
      </MotiPressable>
    </MotiView>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const lti = React.useMemo(() => readLtiContext(), []);

  const openTopic = (topicId: string) => {
    router.push(`/(app)/practice/${topicId}` as never);
  };

  const totalExercises = CALCULUS_TOPICS.reduce(
    (sum, topic) => sum + countExercisesByTopic(topic.id),
    0,
  );

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-primary-50" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 160 }}
            className="mb-2 flex-row items-center justify-center"
          >
            <MotiView
              from={{ rotate: '-8deg' }}
              animate={{ rotate: '0deg' }}
              transition={{ type: 'spring', damping: 10, stiffness: 120, delay: 120 }}
              className="size-11 items-center justify-center rounded-full bg-accent"
            >
              <MaterialIcons name="calculate" size={24} color="#ffffff" />
            </MotiView>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380, delay: 80 }}
          >
            <Text className="font-lato-black text-center text-3xl/9 text-on-surface">
              Cálculo
            </Text>
          </MotiView>

          {lti?.name
            ? (
                <MotiView
                  from={{ opacity: 0, translateY: 8 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 320, delay: 140 }}
                >
                  <Text className="font-lato-bold mt-2 text-center text-base text-primary">
                    Sesión LTI:
                    {' '}
                    {lti.name}
                  </Text>
                </MotiView>
              )
            : null}

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360, delay: 160 }}
          >
            <Text className="font-lato-bold mt-2 text-center text-base text-accent">
              {totalExercises}
              {' '}
              ejercicios quemados · respuestas mezcladas
            </Text>
            <Text className="font-lato mt-3 text-center text-sm text-slate-gray">
              Elige un tema y practica derivadas, integrales, límites y aplicaciones.
              Las opciones se reordenan al azar en cada intento.
            </Text>
          </MotiView>

          <View className="mt-8">
            {CALCULUS_TOPICS.map((topic, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                index={index}
                onPress={() => openTopic(topic.id)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
