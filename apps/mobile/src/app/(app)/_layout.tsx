import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="practice/[topicId]" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="practice/index" />
      <Stack.Screen name="practice/[id]" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
