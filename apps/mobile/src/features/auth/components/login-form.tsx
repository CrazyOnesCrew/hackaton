import { useForm } from '@tanstack/react-form';

import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  email: z
    .string({ message: 'El correo es obligatorio' })
    .min(1, 'El correo es obligatorio')
    .email('Formato de correo inválido'),
  password: z
    .string({ message: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
});

export type LoginFormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (data: LoginFormType) => void;
  isSubmitting?: boolean;
  apiError?: string | null;
};

export function LoginForm({ onSubmit = () => {}, isSubmitting, apiError }: LoginFormProps) {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },

    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="pb-6 text-center text-4xl font-bold"
          >
            Inicia sesión
          </Text>

          <Text className="mb-6 max-w-xs text-center text-gray-500">
            Ingresa tu correo y contraseña para continuar.
          </Text>
        </View>

        <form.Field
          name="email"
          children={field => (
            <Input
              testID="email-input"
              label="Correo"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Field
          name="password"
          children={field => (
            <Input
              testID="password-input"
              label="Contraseña"
              placeholder="***"
              secureTextEntry={true}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        {apiError
          ? (
              <Text testID="login-error" className="mb-2 text-center text-sm text-red-500">
                {apiError}
              </Text>
            )
          : null}

        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([formSubmitting]) => (
            <Button
              testID="login-button"
              label="Iniciar sesión"
              onPress={form.handleSubmit}
              loading={Boolean(formSubmitting) || Boolean(isSubmitting)}
            />
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
