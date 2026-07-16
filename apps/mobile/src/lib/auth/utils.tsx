import { getItem, removeItem, setItem } from '@/lib/storage';

const SESSION = 'session';

export type AuthRole = 'admin' | 'member';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: AuthRole;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

export const getSession = () => getItem<AuthSession>(SESSION);
export const removeSession = () => removeItem(SESSION);
export const setSession = (value: AuthSession) => setItem<AuthSession>(SESSION, value);
