import * as React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
import { LoginScreen } from '../login-screen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockMutate = jest.fn();

jest.mock('../api', () => ({
  useLogin: jest.fn(),
}));

const { useLogin } = jest.requireMock('../api');

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('login flow', () => {
  it('submits credentials and navigates to the app on success', async () => {
    useLogin.mockReturnValue({
      mutate: (payload: unknown, options: { onSuccess: () => void }) => {
        mockMutate(payload);
        options.onSuccess();
      },
      isPending: false,
      error: null,
    });

    const { user } = setup(<LoginScreen />);

    await user.type(screen.getByTestId('email-input'), 'member@example.com');
    await user.type(screen.getByTestId('password-input'), 'S3guraP@ss');
    await user.press(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'member@example.com', password: 'S3guraP@ss' }),
      );
    });
    expect(mockReplace).toHaveBeenCalledWith('/(app)/(tabs)');
  });

  it('surfaces an invalid-credentials error without navigating', async () => {
    useLogin.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: {
        response: { data: { error: { message: 'Correo o contraseña incorrectos.' } } },
      },
    });

    setup(<LoginScreen />);

    expect(await screen.findByTestId('login-error')).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
