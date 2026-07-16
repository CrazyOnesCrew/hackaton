import { signIn, signOut } from '@/features/auth/use-auth-store';
import { client } from './client';

jest.mock('@/lib/auth/utils', () => ({
  getSession: jest.fn(),
  removeSession: jest.fn(),
  setSession: jest.fn(),
}));

describe('api client request interceptor (guest mode)', () => {
  afterEach(() => signOut());

  it('does not attach an Authorization header for guest (unauthenticated) requests', async () => {
    signOut();
    const config = await (client.interceptors.request as any).handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('attaches a Bearer token once a session is signed in', async () => {
    signIn({
      token: 'sess_abc123',
      expiresAt: '2026-08-01T00:00:00-06:00',
      user: { id: 'usr_1', email: 'member@example.com', displayName: 'Ana', role: 'member' },
    });

    const config = await (client.interceptors.request as any).handlers[0].fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer sess_abc123');
  });
});
