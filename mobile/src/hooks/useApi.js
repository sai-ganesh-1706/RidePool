import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';

/** Last good response per cache key, so returning to a screen shows data instantly. */
const cache = new Map();
export const clearApiCache = () => cache.clear();

const initialState = (cacheKey) =>
  cacheKey && cache.has(cacheKey)
    ? { data: cache.get(cacheKey), loading: false, error: null }
    : { data: null, loading: true, error: null };

/**
 * Loads data when the screen mounts and again each time it regains focus.
 *
 * - `fetcher` is re-created when `deps` change.
 * - With a `cacheKey`, the previous response is shown immediately while fresh data loads in the
 *   background (no spinner on return visits).
 * - `setData` lets a screen apply a response it already has (e.g. the updated ride returned by an
 *   action) instead of paying for a second request.
 */
export default function useApi(fetcher, deps = [], { cacheKey } = {}) {
  const [state, setState] = useState(() => initialState(cacheKey));
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);
  const keyRef = useRef(cacheKey);

  // Switching to another key (e.g. a different filter) swaps in that key's cached data.
  useEffect(() => {
    if (keyRef.current === cacheKey) return;
    keyRef.current = cacheKey;
    setState(initialState(cacheKey));
  }, [cacheKey]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const data = await fetcher();
      if (id !== requestId.current) return; // a newer request superseded this one
      if (cacheKey) cache.set(cacheKey, data);
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (id !== requestId.current) return;
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

  const setData = useCallback(
    (next) => {
      requestId.current += 1; // drop any in-flight response that would overwrite this
      setState((prev) => {
        const data = typeof next === 'function' ? next(prev.data) : next;
        if (cacheKey) cache.set(cacheKey, data);
        return { data, loading: false, error: null };
      });
    },
    [cacheKey],
  );

  return { ...state, refreshing, refresh, reload: load, setData };
}
