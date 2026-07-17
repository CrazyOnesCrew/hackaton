/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { Subject, WeekPlan } from '@/features/study/mock-data';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';
import {
  DEFAULT_COURSE_ID,
  GRADES,
  WEEK_PLANS,
} from '@/features/study/mock-data';
import { WebShell } from '@/features/study/web-shell';

type Mode = 'learning' | 'practicing';

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  return (
    <View className="flex-row rounded-full bg-white p-1">
      <Pressable
        testID="mode-learning"
        onPress={() => onChange('learning')}
        className={`flex-1 flex-row items-center justify-center gap-2 rounded-full p-3 ${
          mode === 'learning' ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        <MaterialIcons
          name="menu-book"
          size={18}
          color={mode === 'learning' ? '#ffffff' : '#6B7280'}
        />
        <Text
          className={`font-lato-bold text-sm ${
            mode === 'learning' ? 'text-white' : 'text-slate-gray'
          }`}
        >
          Learning
        </Text>
      </Pressable>
      <Pressable
        testID="mode-practicing"
        onPress={() => onChange('practicing')}
        className={`flex-1 flex-row items-center justify-center gap-2 rounded-full p-3 ${
          mode === 'practicing' ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        <MaterialIcons
          name="fitness-center"
          size={18}
          color={mode === 'practicing' ? '#ffffff' : '#6B7280'}
        />
        <Text
          className={`font-lato-bold text-sm ${
            mode === 'practicing' ? 'text-white' : 'text-slate-gray'
          }`}
        >
          Practicing
        </Text>
      </Pressable>
    </View>
  );
}

function GradeChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (grade: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {GRADES.map((grade) => {
        const active = grade === selected;
        return (
          <Pressable
            key={grade}
            testID={`grade-${grade}`}
            onPress={() => onSelect(grade)}
            className={`rounded-full px-4 py-2 ${
              active ? 'bg-charcoal-800' : 'bg-white'
            }`}
          >
            <Text
              className={`font-lato-bold text-sm ${
                active ? 'text-white' : 'text-slate-gray'
              }`}
            >
              {grade}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SubjectCell({
  subject,
  onPress,
}: {
  subject: Subject;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`subject-${subject.id}`}
      onPress={onPress}
      className="w-[30%] items-center py-2"
    >
      <View
        className="mb-2 size-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${subject.tint}33` }}
      >
        <MaterialIcons name={subject.icon} size={28} color={subject.tint} />
      </View>
      <Text className="font-lato-bold text-center text-xs text-on-surface">
        {subject.name}
      </Text>
      <Text className="font-lato text-center text-[10px] text-slate-gray">
        {subject.hours}
        {' '}
        hours
      </Text>
    </Pressable>
  );
}

function WeekCard({
  plan,
  onSubjectPress,
}: {
  plan: WeekPlan;
  onSubjectPress: (subject: Subject) => void;
}) {
  return (
    <View className="mb-4 rounded-[28px] bg-white p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="font-lato-bold text-base text-on-surface">
            {plan.weekLabel}
          </Text>
          <View className="flex-row items-center gap-1 rounded-full bg-accent-soft px-2 py-1">
            <MaterialIcons name="emoji-events" size={14} color="#F5A623" />
            <Text className="font-lato-bold text-xs text-accent">
              #
              {plan.rank}
            </Text>
          </View>
        </View>
        <Text className="font-lato text-xs text-slate-gray">
          Subjects
          {' '}
          {plan.subjects.length}
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {plan.subjects.map(subject => (
          <SubjectCell
            key={subject.id}
            subject={subject}
            onPress={() => onSubjectPress(subject)}
          />
        ))}
        <Pressable
          testID={`add-subject-${plan.id}`}
          className="w-[30%] items-center py-2"
        >
          <View className="mb-2 size-14 items-center justify-center rounded-2xl bg-surface-alt">
            <MaterialIcons name="add" size={28} color="#8B74E8" />
          </View>
          <Text className="font-lato text-center text-xs text-slate-gray">Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('learning');
  const [grade, setGrade] = React.useState<string>('Grade 2');

  const openCourse = () => {
    router.push(`/(app)/course/${DEFAULT_COURSE_ID}` as never);
  };

  const openPractice = () => {
    router.push('/(app)/practice' as never);
  };

  return (
    <WebShell>
      <SafeAreaView className="flex-1 bg-primary-50" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Pressable
              testID="home-back"
              className="size-10 items-center justify-center rounded-full bg-white"
            >
              <MaterialIcons name="arrow-back" size={22} color="#1F2430" />
            </Pressable>
            <View className="size-11 items-center justify-center rounded-full bg-accent">
              <MaterialIcons name="bolt" size={22} color="#ffffff" />
            </View>
          </View>

          <ModeToggle mode={mode} onChange={setMode} />

          <View className="mt-6 mb-4">
            <Text className="font-lato-black text-3xl/9 text-on-surface">
              Your personal
              {'\n'}
              learning plan
            </Text>
            <Text className="font-lato-bold mt-2 text-lg text-accent">
              Created by AI
            </Text>
          </View>

          <GradeChips selected={grade} onSelect={setGrade} />

          <View className="mt-5">
            {mode === 'learning'
              ? (
                  WEEK_PLANS.map(plan => (
                    <WeekCard
                      key={plan.id}
                      plan={plan}
                      onSubjectPress={openCourse}
                    />
                  ))
                )
              : (
                  <View className="rounded-[28px] bg-white p-6">
                    <Text className="font-lato-black text-xl text-on-surface">
                      Practice mode
                    </Text>
                    <Text className="font-lato mt-2 text-sm text-slate-gray">
                      5 ejercicios de mates quemados: ecuaciones, fracciones, área,
                      porcentajes y Pitágoras. Validación local, sin IA.
                    </Text>
                    <Pressable
                      testID="start-practice"
                      onPress={openPractice}
                      className="mt-5 items-center rounded-full bg-primary py-3"
                    >
                      <Text className="font-lato-bold text-white">Ver ejercicios</Text>
                    </Pressable>
                  </View>
                )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </WebShell>
  );
}
