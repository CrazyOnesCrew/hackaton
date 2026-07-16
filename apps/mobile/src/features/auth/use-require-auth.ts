import { useRouter } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { useAuthStore } from './use-auth-store';

/**
 * Gate for actions that require an account (e.g. saving a draft).
 * Guests are prompted to register/login and their in-progress screen state
 * is left untouched — this only intercepts the gated action, it never
 * navigates the guest away from what they were doing.
 */
export function useRequireAuth() {
  const router = useRouter();
  const status = useAuthStore.use.status();
  const isGuest = status !== 'signIn';

  function requireAuth(onAuthenticated: () => void) {
    if (isGuest) {
      showMessage({
        message: 'Crea una cuenta para guardar esto',
        description: 'Inicia sesión o regístrate para guardar tus recorridos e intereses.',
        type: 'info',
        duration: 4000,
      });
      router.push('/login');
      return;
    }

    onAuthenticated();
  }

  return { isGuest, requireAuth };
}
