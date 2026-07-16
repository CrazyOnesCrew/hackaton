import type { AuthUser } from '@/lib/auth/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, SafeAreaView, ScrollView, Text, View } from '@/components/ui';
import { AccountSection } from '@/features/auth/components/account-section';
import { useAuthStore } from '@/features/auth/use-auth-store';

const SETTINGS: { icon: keyof typeof MaterialIcons.glyphMap; label: string; target: string }[] = [
  { icon: 'settings', label: 'Settings', target: '/(app)/settings' },
];

export function ProfileScreen() {
  const router = useRouter();
  const status = useAuthStore.use.status();
  const user = useAuthStore.use.user();

  const isAuthenticated = status === 'signIn' && !!user;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="font-lato-black px-5 pt-4 text-2xl text-on-surface">Profile</Text>

        <ProfileIdentity isAuthenticated={isAuthenticated} user={user} />

        <AccountSection />

        <View className="mt-8 px-5">
          <Text className="font-lato-black mb-3 text-base text-on-surface">Preferences</Text>
          <View className="overflow-hidden rounded-lg bg-pure-white shadow-sm">
            {SETTINGS.map((item, index) => (
              <Pressable
                key={item.label}
                testID={`profile-link-${item.label.toLowerCase()}`}
                onPress={() => router.push(item.target as never)}
                className={`flex-row items-center p-4 ${
                  index < SETTINGS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <MaterialIcons name={item.icon} size={20} color="#2f5ded" />
                <Text className="font-lato ml-3 flex-1 text-base text-on-surface">
                  {item.label}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color="#74798a" />
              </Pressable>
            ))}
          </View>
          <Text className="font-lato mt-6 text-center text-xs text-slate-gray">
            AI-First Project Template
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileIdentityProps = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

/** Identity header — never fabricates a profile for unauthenticated guests. */
function ProfileIdentity({ isAuthenticated, user }: ProfileIdentityProps) {
  if (isAuthenticated && user) {
    const initial = (user.displayName ?? user.email ?? 'U').trim().charAt(0).toUpperCase();
    return (
      <View className="items-center px-5 pt-2" testID="profile-authenticated-header">
        <View className="size-20 items-center justify-center rounded-full bg-primary-100">
          <Text className="font-lato-black text-2xl text-primary-700">{initial}</Text>
        </View>
        <Text className="font-lato-black mt-3 text-xl text-on-surface">
          {user.displayName ?? 'User'}
        </Text>
        <Text className="font-lato mt-1 text-sm text-slate-gray">{user.email}</Text>
      </View>
    );
  }

  return (
    <View
      className="mx-5 mt-2 rounded-lg bg-primary-50 p-5"
      testID="profile-guest-header"
    >
      <View className="size-14 items-center justify-center rounded-full bg-primary-100">
        <MaterialIcons name="person-outline" size={28} color="#2f5ded" />
      </View>
      <Text className="font-lato-black mt-3 text-lg text-on-surface">
        You are browsing as a guest
      </Text>
      <Text className="font-lato mt-1 text-sm text-slate-gray">
        Create an account to save your profile and settings across devices.
      </Text>
    </View>
  );
}
