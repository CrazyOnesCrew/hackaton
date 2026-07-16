import type { AxiosError } from 'axios';
import type { RegisterFormProps } from './components/register-form';

import { useRouter } from 'expo-router';

import * as React from 'react';
import { FocusAwareStatusBar, Pressable, Text, View } from '@/components/ui';
import { useRegister } from './api';
import { RegisterForm } from './components/register-form';

function getApiErrorMessage(error: AxiosError | null): string | null {
  if (!error)
    return null;
  const data = error.response?.data as any;
  if (data?.error?.details?.length) {
    return data.error.details.map((detail: { message: string }) => detail.message).join(' ');
  }
  if (data?.error?.message)
    return data.error.message;
  if (!error.response) {
    return 'No se pudo conectar con la API. Inicia el servidor Rails en otra terminal: cd apps/api && bin/rails server';
  }
  return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
}

export function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();

  const onSubmit: RegisterFormProps['onSubmit'] = (data) => {
    register.mutate(data, {
      onSuccess: () => router.replace('/(app)/(tabs)'),
    });
  };

  return (
    <>
      <FocusAwareStatusBar />
      <RegisterForm
        onSubmit={onSubmit}
        isSubmitting={register.isPending}
        apiError={getApiErrorMessage(register.error)}
      />
      <View className="items-center pb-8">
        <Pressable onPress={() => router.replace('/login')}>
          <Text className="text-sm text-blue-600">¿Ya tienes cuenta? Inicia sesión</Text>
        </Pressable>
      </View>
    </>
  );
}
