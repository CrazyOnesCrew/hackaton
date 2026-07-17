/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { Teacher } from '@/features/study/mock-data';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';
import { CatProfessorHero } from '@/features/study/illustrations';
import { COURSES, DEFAULT_COURSE_ID } from '@/features/study/mock-data';
import { WebShell } from '@/features/study/web-shell';

function TeacherAvatar({ teacher }: { teacher: Teacher }) {
  return (
    <View className="relative mr-3 items-center pb-2">
      <View
        className="size-14 items-center justify-center rounded-full"
        style={{ backgroundColor: teacher.color }}
      >
        <Text className="font-lato-black text-lg text-white">{teacher.initials}</Text>
      </View>
      <View className="absolute bottom-0 self-center rounded-full bg-white px-1.5 py-0.5">
        <Text className="font-lato-bold text-[10px] text-on-surface">
          {teacher.rating.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View className="flex-1 overflow-hidden rounded-[24px] bg-white p-4">
      <View className="absolute -top-2 -right-2 opacity-20">
        <MaterialIcons name={icon} size={72} color="#B9A5F5" />
      </View>
      <Text className="font-lato text-sm text-slate-gray">{label}</Text>
      <Text className="font-lato-black mt-1 text-3xl text-on-surface">{value}</Text>
    </View>
  );
}

export function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const course = COURSES[params.id ?? DEFAULT_COURSE_ID] ?? COURSES[DEFAULT_COURSE_ID];

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-accent-soft" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable
              testID="course-back"
              onPress={() => router.back()}
              className="size-10 items-center justify-center rounded-full bg-white"
            >
              <MaterialIcons name="arrow-back" size={22} color="#1F2430" />
            </Pressable>
            <Pressable className="size-10 items-center justify-center rounded-full bg-white">
              <MaterialIcons name="favorite-border" size={22} color="#1F2430" />
            </Pressable>
          </View>

          <CatProfessorHero />

          <View className="mt-5 items-center">
            <View className="size-20 items-center justify-center rounded-full border-4 border-accent bg-white">
              <Text className="font-lato-black text-2xl text-on-surface">
                {course.rating.toFixed(1)}
              </Text>
            </View>
            <View className="mt-4 flex-row items-center gap-2">
              <MaterialIcons name="school" size={22} color="#8B74E8" />
              <Text className="font-lato-black text-2xl text-on-surface">
                {course.title}
              </Text>
            </View>
            <Text className="font-lato mt-3 text-center text-sm/5 text-slate-gray">
              {course.description}
            </Text>
          </View>

          <View className="mt-8 flex-row items-end justify-between">
            <Text className="font-lato-black text-lg text-on-surface">
              Available Teachers
            </Text>
            <Pressable>
              <Text className="font-lato-bold text-sm text-primary-strong">
                See all
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingBottom: 8, paddingTop: 4 }}
          >
            {course.teachers.map(teacher => (
              <TeacherAvatar key={teacher.id} teacher={teacher} />
            ))}
          </ScrollView>

          <View className="mt-6 flex-row gap-3">
            <StatTile label="Hours" value={String(course.hours)} icon="schedule" />
            <StatTile
              label="Lessons"
              value={String(course.lessons)}
              icon="menu-book"
            />
          </View>

          <Pressable
            testID="start-course"
            onPress={() => router.push('/(app)/(tabs)/assistant' as never)}
            className="mt-6 items-center rounded-full bg-charcoal-800 py-4"
          >
            <Text className="font-lato-bold text-base text-white">
              Start with AI Owl
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
