import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getErrorMessage } from '../api/client';

/**
 * Loads data when the screen mounts and again each time it regains focus.
 * `fetcher` is re-created when `deps` change.
 */
export default function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [refreshing, setRefreshing] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(err) }));
    }
  }, deps);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { ...state, refreshing, refresh, reload: load };
}
