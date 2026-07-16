import { useForm } from '@tanstack/react-form';

import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  displayName: z
    .string({ message: 'El nombre es obligatorio' })
    .min(1, 'El nombre es obligatorio'),
  email: z
    .string({ message: 'El correo es obligatorio' })
    .min(1, 'El correo es obligatorio')
    .email('Formato de correo inválido'),
  password: z
    .string({ message: 'La contraseña es obligatoria' })
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(/(?=.*[a-z])(?=.*\d)/i, 'Debe incluir al menos una letra y un número'),
});

export type RegisterFormType = z.infer<typeof schema>;

export type RegisterFormProps = {
  onSubmit?: (data: RegisterFormType) => void;
  isSubmitting?: boolean;
  apiError?: string | null;
};

export function RegisterForm({ onSubmit = () => {}, isSubmitting, apiError }: RegisterFormProps) {
  const form = useForm({
    defaultValues: {
      displayName: '',
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={10}>
      <View className="flex-1 justify-center p-4">
        <View className="items-center justify-center">
          <Text testID="form-title" className="pb-6 text-center text-3xl font-bold">
            Create your account
          </Text>
          <Text className="mb-6 max-w-xs text-center text-gray-500">
            Sign up to save your profile across devices.
          </Text>
        </View>

        <form.Field
          name="displayName"
          children={field => (
            <Input
              testID="display-name-input"
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

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
              secureTextEntry
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        {apiError
          ? (
              <Text testID="register-error" className="mb-2 text-center text-sm text-red-500">
                {apiError}
              </Text>
            )
          : null}

        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([formSubmitting]) => (
            <Button
              testID="register-button"
              label="Crear cuenta"
              onPress={form.handleSubmit}
              loading={Boolean(formSubmitting) || Boolean(isSubmitting)}
            />
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
