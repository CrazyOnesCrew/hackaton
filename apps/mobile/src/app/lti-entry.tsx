import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { SafeAreaView, Text, View } from '@/components/ui';

type LtiContext = {
  email?: string;
  name?: string;
  role?: string;
  resourceLinkId?: string;
  contextId?: string;
};

const LTI_STORAGE_KEY = 'paag.lti.context';

export function saveLtiContext(context: LtiContext) {
  if (typeof window === 'undefined')
    return;

  window.sessionStorage.setItem(LTI_STORAGE_KEY, JSON.stringify(context));
}

export function readLtiContext(): LtiContext | null {
  if (typeof window === 'undefined')
    return null;

  const raw = window.sessionStorage.getItem(LTI_STORAGE_KEY);
  if (!raw)
    return null;

  try {
    return JSON.parse(raw) as LtiContext;
  }
  catch {
    return null;
  }
}

export default function LtiEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string;
    name?: string;
    role?: string;
    resource_link_id?: string;
    context_id?: string;
  }>();

  React.useEffect(() => {
    saveLtiContext({
      email: params.email,
      name: params.name,
      role: params.role,
      resourceLinkId: params.resource_link_id,
      contextId: params.context_id,
    });

    router.replace('/(app)/(tabs)' as never);
  }, [params.context_id, params.email, params.name, params.resource_link_id, params.role, router]);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 px-6">
      <View className="items-center rounded-[28px] bg-white p-8">
        <MaterialIcons name="school" size={40} color="#8B74E8" />
        <ActivityIndicator className="mt-4" color="#8B74E8" />
        <Text className="font-lato-black mt-4 text-xl text-on-surface">
          Entrando desde Moodle…
        </Text>
        {params.name
          ? (
              <Text className="font-lato mt-2 text-center text-sm text-slate-gray">
                Hola,
                {' '}
                {params.name}
              </Text>
            )
          : null}
      </View>
    </SafeAreaView>
  );
}
