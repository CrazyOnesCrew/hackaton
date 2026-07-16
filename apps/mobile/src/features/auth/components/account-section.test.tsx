import * as React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
import { AccountSection } from './account-section';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockMutate = jest.fn();

jest.mock('../api', () => ({
  useUpdateProfile: () => ({ mutate: mockMutate, isPending: false }),
}));

const mockUseAuthStoreUse = {
  status: jest.fn(),
  user: jest.fn(),
};

jest.mock('../use-auth-store', () => ({
  useAuthStore: {
    use: {
      status: () => mockUseAuthStoreUse.status(),
      user: () => mockUseAuthStoreUse.user(),
    },
  },
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('accountSection', () => {
  it('prompts guests to log in or register', async () => {
    mockUseAuthStoreUse.status.mockReturnValue('signOut');
    mockUseAuthStoreUse.user.mockReturnValue(null);

    setup(<AccountSection />);

    expect(await screen.findByTestId('account-login-link')).toBeOnTheScreen();
    expect(screen.getByTestId('account-register-link')).toBeOnTheScreen();
  });

  it('shows the authenticated user profile', async () => {
    mockUseAuthStoreUse.status.mockReturnValue('signIn');
    mockUseAuthStoreUse.user.mockReturnValue({
      id: 'usr_1',
      email: 'member@example.com',
      displayName: 'Ana',
      role: 'member',
    });

    setup(<AccountSection />);

    expect(await screen.findByTestId('account-display-name')).toHaveTextContent('Ana');
    expect(screen.getByTestId('account-email')).toHaveTextContent('member@example.com');
  });

  it('submits an updated display name', async () => {
    mockUseAuthStoreUse.status.mockReturnValue('signIn');
    mockUseAuthStoreUse.user.mockReturnValue({
      id: 'usr_1',
      email: 'member@example.com',
      displayName: 'Ana',
      role: 'member',
    });

    const { user } = setup(<AccountSection />);

    await user.press(screen.getByTestId('account-edit-button'));
    await user.clear(screen.getByTestId('account-display-name-input'));
    await user.type(screen.getByTestId('account-display-name-input'), 'Ana María');
    await user.press(screen.getByTestId('account-save-button'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { displayName: 'Ana María' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });
});
