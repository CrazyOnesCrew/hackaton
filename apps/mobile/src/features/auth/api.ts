import type { AxiosError } from 'axios';
import type { AuthRole, AuthSession, AuthUser } from '@/lib/auth/utils';

import { createMutation, createQuery } from 'react-query-kit';
import { client } from '@/lib/api';
import { signIn, signOut, updateAuthUser } from './use-auth-store';

type RawUser = {
  id: string;
  email: string;
  displayName: string;
  role: AuthRole;
};

type RawSession = {
  token: string;
  expiresAt: string;
};

type AuthResponse = { data: { user: RawUser; session: RawSession } };
type ProfileResponse = { data: RawUser };

export type RegisterPayload = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  displayName?: string;
  email?: string;
};

function toSession(user: RawUser, session: RawSession): AuthSession {
  return { token: session.token, expiresAt: session.expiresAt, user };
}

function toUser(raw: RawUser): AuthUser {
  return raw;
}

export const useRegister = createMutation<AuthSession, RegisterPayload, AxiosError>({
  mutationFn: async (payload) => {
    const response = await client.post<AuthResponse>('api/v1/registrations', payload);
    const session = toSession(response.data.data.user, response.data.data.session);
    signIn(session);
    return session;
  },
});

export const useLogin = createMutation<AuthSession, LoginPayload, AxiosError>({
  mutationFn: async (payload) => {
    const response = await client.post<AuthResponse>('api/v1/sessions', payload);
    const session = toSession(response.data.data.user, response.data.data.session);
    signIn(session);
    return session;
  },
});

export const useLogout = createMutation<void, void, AxiosError>({
  mutationFn: async () => {
    try {
      await client.delete('api/v1/sessions/current');
    }
    finally {
      signOut();
    }
  },
});

export const useProfile = createQuery<AuthUser, void, AxiosError>({
  queryKey: ['profile'],
  fetcher: async () => {
    const response = await client.get<ProfileResponse>('api/v1/profile');
    return toUser(response.data.data);
  },
});

export const useUpdateProfile = createMutation<AuthUser, UpdateProfilePayload, AxiosError>({
  mutationFn: async (payload) => {
    const response = await client.patch<ProfileResponse>('api/v1/profile', payload);
    const user = toUser(response.data.data);
    updateAuthUser(user);
    return user;
  },
});
