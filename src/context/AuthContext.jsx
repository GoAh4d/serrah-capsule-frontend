import { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isSignedIn: false,
    accessCode: null,
    sessionExpiry: null,
    loading: true,
    error: null,
  });

  // Check for an active session on mount by probing an authenticated endpoint.
  useEffect(() => {
    request('GET', '/environments')
      .then(({ status }) => {
        setAuth(prev => ({
          ...prev,
          isSignedIn: status === 200,
          loading: false,
        }));
      })
      .catch(() => {
        setAuth(prev => ({ ...prev, loading: false }));
      });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
