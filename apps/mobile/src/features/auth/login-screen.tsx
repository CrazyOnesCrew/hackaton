import type { AxiosError } from 'axios';
import type { LoginFormProps } from './components/login-form';

import { useRouter } from 'expo-router';

import * as React from 'react';
import { FocusAwareStatusBar, Pressable, Text, View } from '@/components/ui';
import { useLogin } from './api';
import { LoginForm } from './components/login-form';

function getApiErrorMessage(error: AxiosError | null): string | null {
  if (!error)
    return null;
  const data = error.response?.data as any;
  if (data?.error?.message)
    return data.error.message;
  if (!error.response) {
    return 'No se pudo conectar con la API. Inicia el servidor Rails en otra terminal: cd apps/api && bin/rails server';
  }
  return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
}

export function LoginScreen() {
  const router = useRouter();
  const login = useLogin();

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    login.mutate(data, {
      onSuccess: () => router.replace('/(app)/(tabs)'),
    });
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm
        onSubmit={onSubmit}
        isSubmitting={login.isPending}
        apiError={getApiErrorMessage(login.error)}
      />
      <View className="items-center pb-8">
        <Pressable onPress={() => router.replace('/register')}>
          <Text className="text-sm text-blue-600">¿No tienes cuenta? Regístrate</Text>
        </Pressable>
      </View>
    </>
  );
}
