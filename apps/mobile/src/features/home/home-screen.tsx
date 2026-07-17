/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { CalculusTopic } from '@/features/study/calculus-exercises';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';
import {
  CALCULUS_TOPICS,
  countExercisesByTopic,
} from '@/features/study/calculus-exercises';
import { readLtiContext } from '@/app/lti-entry';
import { WebShell } from '@/features/study/web-shell';

function TopicCard({
  topic,
  onPress,
}: {
  topic: CalculusTopic;
  onPress: () => void;
}) {
  const count = countExercisesByTopic(topic.id);

  return (
    <Pressable
      testID={`topic-${topic.id}`}
      onPress={onPress}
      className="mb-4 rounded-[28px] bg-white p-5"
    >
      <View className="flex-row items-start gap-4">
        <View
          className="size-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${topic.tint}33` }}
        >
          <MaterialIcons name={topic.icon} size={28} color={topic.tint} />
        </View>
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
    </Pressable>
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
          <View className="mb-2 flex-row items-center justify-center">
            <View className="size-11 items-center justify-center rounded-full bg-accent">
              <MaterialIcons name="calculate" size={24} color="#ffffff" />
            </View>
          </View>

          <Text className="font-lato-black text-center text-3xl/9 text-on-surface">
            Cálculo
          </Text>
          {lti?.name
            ? (
                <Text className="font-lato-bold mt-2 text-center text-base text-primary">
                  Sesión LTI:
                  {' '}
                  {lti.name}
                </Text>
              )
            : null}
          <Text className="font-lato-bold mt-2 text-center text-base text-accent">
            {totalExercises}
            {' '}
            ejercicios quemados · respuestas mezcladas
          </Text>
          <Text className="font-lato mt-3 text-center text-sm text-slate-gray">
            Elige un tema y practica derivadas, integrales, límites y aplicaciones.
            Las opciones se reordenan al azar en cada intento.
          </Text>

          <View className="mt-8">
            {CALCULUS_TOPICS.map(topic => (
              <TopicCard key={topic.id} topic={topic} onPress={() => openTopic(topic.id)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
