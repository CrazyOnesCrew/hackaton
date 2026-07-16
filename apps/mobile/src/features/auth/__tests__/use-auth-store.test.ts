import type { AuthSession } from '@/lib/auth/utils';

import * as authUtils from '@/lib/auth/utils';
import {
  getAuthToken,
  hydrateAuth,
  isGuest,
  signIn,
  signOut,
  useAuthStore,
} from '../use-auth-store';

jest.mock('@/lib/auth/utils', () => ({
  getSession: jest.fn(),
  removeSession: jest.fn(),
  setSession: jest.fn(),
}));

const session: AuthSession = {
  token: 'sess_abc123',
  expiresAt: '2026-08-01T00:00:00-06:00',
  user: {
    id: 'usr_1',
    email: 'member@example.com',
    displayName: 'Ana',
    role: 'member',
  },
};

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    signOut();
  });

  it('starts as guest before hydration resolves a session', () => {
    expect(isGuest()).toBe(true);
    expect(getAuthToken()).toBeNull();
  });

  it('signIn persists the session and updates store state', () => {
    signIn(session);

    expect(authUtils.setSession).toHaveBeenCalledWith(session);
    expect(useAuthStore.getState().status).toBe('signIn');
    expect(useAuthStore.getState().user?.displayName).toBe('Ana');
    expect(getAuthToken()).toBe('sess_abc123');
    expect(isGuest()).toBe(false);
  });

  it('signOut clears persisted session and store state', () => {
    signIn(session);
    signOut();

    expect(authUtils.removeSession).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('signOut');
    expect(getAuthToken()).toBeNull();
    expect(isGuest()).toBe(true);
  });

  it('hydrate restores a persisted session on app launch', () => {
    (authUtils.getSession as jest.Mock).mockReturnValue(session);

    hydrateAuth();

    expect(useAuthStore.getState().status).toBe('signIn');
    expect(getAuthToken()).toBe('sess_abc123');
  });

  it('hydrate falls back to guest mode when no session is persisted', () => {
    (authUtils.getSession as jest.Mock).mockReturnValue(null);

    hydrateAuth();

    expect(useAuthStore.getState().status).toBe('signOut');
    expect(isGuest()).toBe(true);
  });
});
