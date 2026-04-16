import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { signIn as apiSignIn, signOut as apiSignOut } from '../api/auth';

export function useAuth() {
  const { auth, setAuth } = useAuthContext();

  const signIn = useCallback(async (code) => {
    setAuth(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { status, data } = await apiSignIn(code);
      if (status === 200 && data.ok) {
        setAuth(prev => ({
          ...prev,
          isSignedIn: true,
          accessCode: code,
          loading: false,
          error: null,
        }));
        return { ok: true };
      }
      const error = data.error || 'sign_in_failed';
      setAuth(prev => ({ ...prev, loading: false, error }));
      return { ok: false, error };
    } catch (err) {
      const error = err.message || 'sign_in_failed';
      setAuth(prev => ({ ...prev, loading: false, error }));
      return { ok: false, error };
    }
  }, [setAuth]);

  const signOut = useCallback(async () => {
    try {
      await apiSignOut();
    } finally {
      setAuth({
        isSignedIn: false,
        accessCode: null,
        sessionExpiry: null,
        loading: false,
        error: null,
      });
    }
  }, [setAuth]);

  // Call this after a successful sign-in performed externally (e.g. by a view).
  const markSignedIn = useCallback(() => {
    setAuth(prev => ({
      ...prev,
      isSignedIn: true,
      loading: false,
      error: null,
    }));
  }, [setAuth]);

  return { auth, signIn, signOut, markSignedIn };
}
