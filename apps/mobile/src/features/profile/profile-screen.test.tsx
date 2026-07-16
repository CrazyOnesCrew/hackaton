import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';
import { ProfileScreen } from './profile-screen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/auth/api', () => ({
  useUpdateProfile: () => ({ mutate: jest.fn(), isPending: false }),
}));

const mockAuth = {
  status: jest.fn(),
  user: jest.fn(),
};

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: {
    use: {
      status: () => mockAuth.status(),
      user: () => mockAuth.user(),
    },
  },
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('profileScreen guest mode', () => {
  it('shows a guest state and no fabricated identity when signed out', () => {
    mockAuth.status.mockReturnValue('signOut');
    mockAuth.user.mockReturnValue(null);

    render(<ProfileScreen />);

    expect(screen.getByTestId('profile-guest-header')).toBeOnTheScreen();
    expect(screen.getByText('You are browsing as a guest')).toBeOnTheScreen();
    expect(screen.queryByTestId('profile-authenticated-header')).toBeNull();
  });

  it('shows the real authenticated identity when signed in', () => {
    mockAuth.status.mockReturnValue('signIn');
    mockAuth.user.mockReturnValue({
      id: 'usr_1',
      email: 'member@example.com',
      displayName: 'Alex',
      role: 'member',
    });

    render(<ProfileScreen />);

    expect(screen.getByTestId('profile-authenticated-header')).toBeOnTheScreen();
    expect(screen.queryByTestId('profile-guest-header')).toBeNull();
  });
});
