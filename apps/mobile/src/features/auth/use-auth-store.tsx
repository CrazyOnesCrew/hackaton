import type { AuthSession, AuthUser } from '@/lib/auth/utils';

import { create } from 'zustand';
import { getSession, removeSession, setSession } from '@/lib/auth/utils';
import { createSelectors } from '@/lib/utils';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (session: AuthSession) => void;
  signOut: () => void;
  hydrate: () => void;
  updateUser: (user: AuthUser) => void;
};

const _useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: (session) => {
    setSession(session);
    set({ status: 'signIn', token: session.token, user: session.user });
  },
  signOut: () => {
    removeSession();
    set({ status: 'signOut', token: null, user: null });
  },
  updateUser: (user) => {
    const { token } = get();
    if (!token)
      return;
    setSession({ token, expiresAt: getSession()?.expiresAt ?? '', user });
    set({ user });
  },
  hydrate: () => {
    try {
      const session = getSession();
      if (session !== null) {
        get().signIn(session);
      }
      else {
        get().signOut();
      }
    }
    catch (e) {
      // only to remove eslint error, handle the error properly
      console.error(e);
      // catch error here
      // Maybe sign_out user!
    }
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export const signOut = () => _useAuthStore.getState().signOut();
export const signIn = (session: AuthSession) => _useAuthStore.getState().signIn(session);
export const hydrateAuth = () => _useAuthStore.getState().hydrate();
export const isGuest = () => _useAuthStore.getState().status !== 'signIn';
export const getAuthToken = () => _useAuthStore.getState().token;
export const updateAuthUser = (user: AuthUser) => _useAuthStore.getState().updateUser(user);
