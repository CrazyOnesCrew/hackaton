import { useRouter } from 'expo-router';
import * as React from 'react';

import { Button, Input, Pressable, Text, View } from '@/components/ui';
import { useUpdateProfile } from '../api';
import { useAuthStore } from '../use-auth-store';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
};

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="font-lato-black mb-3 text-base text-on-surface">{title}</Text>
  );
}

export function AccountSection() {
  const router = useRouter();
  const status = useAuthStore.use.status();
  const user = useAuthStore.use.user();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = React.useState(user?.displayName ?? '');
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    setDisplayName(user?.displayName ?? '');
  }, [user?.displayName]);

  if (status !== 'signIn' || !user) {
    return (
      <View className="mt-8 px-5">
        <SectionTitle title="Account" />
        <View className="rounded-lg bg-pure-white p-4 shadow-sm">
          <Text className="font-lato mb-3 text-sm text-slate-gray">
            Sign in to save your profile across devices.
          </Text>
          <View className="flex-row gap-3">
            <Pressable testID="account-login-link" onPress={() => router.push('/login')}>
              <Text className="text-sm font-bold text-blue-600">Sign in</Text>
            </Pressable>
            <Pressable testID="account-register-link" onPress={() => router.push('/register')}>
              <Text className="text-sm font-bold text-blue-600">Create account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-8 px-5">
      <SectionTitle title="Account" />
      <View className="rounded-lg bg-pure-white p-4 shadow-sm">
        {editing
          ? (
              <>
                <Input
                  testID="account-display-name-input"
                  label="Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
                <View className="mt-2 flex-row gap-3">
                  <Button
                    testID="account-save-button"
                    label="Save"
                    loading={updateProfile.isPending}
                    onPress={() => {
                      updateProfile.mutate(
                        { displayName },
                        { onSuccess: () => setEditing(false) },
                      );
                    }}
                  />
                  <Pressable testID="account-cancel-button" onPress={() => setEditing(false)}>
                    <Text className="text-sm text-slate-gray">Cancel</Text>
                  </Pressable>
                </View>
              </>
            )
          : (
              <>
                <Text testID="account-display-name" className="font-lato-black text-base text-on-surface">
                  {user.displayName}
                </Text>
                <Text testID="account-email" className="font-lato mt-1 text-sm text-slate-gray">
                  {user.email}
                </Text>
                <Text testID="account-role" className="font-lato mt-1 text-xs text-slate-gray">
                  {ROLE_LABELS[user.role] ?? user.role}
                </Text>
                <Pressable testID="account-edit-button" className="mt-3" onPress={() => setEditing(true)}>
                  <Text className="text-sm font-bold text-blue-600">Edit name</Text>
                </Pressable>
              </>
            )}
      </View>
    </View>
  );
}
