import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, SafeAreaView, ScrollView, Text, View } from '@/components/ui';

type Shortcut = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  target: string;
};

// Generic example shortcuts. Replace these with your project's real entry points.
const SHORTCUTS: Shortcut[] = [
  {
    id: 'assistant',
    label: 'AI Assistant',
    description: 'Open the AI assistant placeholder',
    icon: 'auto-awesome',
    target: '/(app)/(tabs)/assistant',
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'View your account and preferences',
    icon: 'person-outline',
    target: '/(app)/(tabs)/perfil',
  },
];

export function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
      >
        <Text className="font-lato-black text-2xl text-on-surface">
          AI-First Project Template
        </Text>
        <Text className="font-lato mt-1 text-sm text-slate-gray">
          A clean starting point for mobile, web, and API — wire your own features here.
        </Text>

        <View className="mt-6 gap-4">
          {SHORTCUTS.map(shortcut => (
            <Pressable
              key={shortcut.id}
              testID={`home-shortcut-${shortcut.id}`}
              onPress={() => router.push(shortcut.target as never)}
              className="flex-row items-center rounded-lg bg-pure-white p-4 shadow-sm"
            >
              <View className="size-11 items-center justify-center rounded-full bg-primary-50">
                <MaterialIcons name={shortcut.icon} size={22} color="#2f5ded" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-lato-black text-base text-on-surface">
                  {shortcut.label}
                </Text>
                <Text className="font-lato mt-0.5 text-xs text-slate-gray">
                  {shortcut.description}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#74798a" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
