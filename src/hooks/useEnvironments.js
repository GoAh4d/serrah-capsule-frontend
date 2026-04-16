import { useCallback } from 'react';
import { useEnvironmentContext } from '../context/EnvironmentContext';
import { getEnvironments } from '../api/environments';

export function useEnvironments() {
  const { environments, setEnvironments } = useEnvironmentContext();

  const refresh = useCallback(async () => {
    setEnvironments(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { status, data } = await getEnvironments();
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
    } catch {
      setEnvironments(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load environments',
      }));
    }
  }, [setEnvironments]);

  const selectEnvironment = useCallback((envId) => {
    setEnvironments(prev => ({ ...prev, selectedId: envId }));
  }, [setEnvironments]);

  return {
    list: environments.list,
    selected: environments.list.find(e => e.id === environments.selectedId) || null,
    selectedId: environments.selectedId,
    loading: environments.loading,
    error: environments.error,
    refresh,
    selectEnvironment,
  };
}
