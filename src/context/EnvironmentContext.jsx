import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { getEnvironments } from '../api/environments';

const EnvironmentContext = createContext(null);

export function EnvironmentProvider({ children }) {
  const { auth } = useAuthContext();
  const [environments, setEnvironments] = useState({
    list: [],
    selectedId: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!auth.isSignedIn) {
      setEnvironments({ list: [], selectedId: null, loading: false, error: null });
      return;
    }

    setEnvironments(prev => ({ ...prev, loading: true, error: null }));
    getEnvironments()
      .then(({ status, data }) => {
        if (status === 200) {
          setEnvironments(prev => ({
            ...prev,
            list: data.environments || [],
            loading: false,
          }));
        } else {
          setEnvironments(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to load environments',
          }));
        }
      })
      .catch(() => {
        setEnvironments(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load environments',
        }));
      });
  }, [auth.isSignedIn]);

  return (
    <EnvironmentContext.Provider value={{ environments, setEnvironments }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironmentContext() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironmentContext must be used within EnvironmentProvider');
  return ctx;
}
