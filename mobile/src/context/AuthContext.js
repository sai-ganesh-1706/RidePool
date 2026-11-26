import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { clearApiCache } from '../hooks/useApi';

const TOKEN_KEY = 'ridepool.token';
const USER_KEY = 'ridepool.user';
const AuthContext = createContext(null);

const saveUser = (user) => SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch(() => {});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback(async ({ user: nextUser, token: nextToken }) => {
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    // Persist in the background – the user shouldn't wait on disk writes to get into the app.
    SecureStore.setItemAsync(TOKEN_KEY, nextToken).catch(() => {});
    saveUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    clearApiCache();
    setToken(null);
    setUser(null);
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]).catch(() => {});
  }, []);

  /**
   * Restore a saved session on app start. The cached profile lets the app open instantly even when
   * the server is still waking up; the profile is then refreshed (and the session verified) in the background.
   */
  useEffect(() => {
    (async () => {
      let savedToken = null;
      let hasCachedUser = false;
      try {
        savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const savedUser = await SecureStore.getItemAsync(USER_KEY);
        if (savedToken) {
          setAuthToken(savedToken);
          setToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            hasCachedUser = true;
          }
        }
      } catch {
        savedToken = null;
      }
      // With a cached profile the app opens right away; otherwise we must wait for the server once.
      if (hasCachedUser || !savedToken) setInitializing(false);

      if (!savedToken) return;
      try {
        const fresh = await authApi.me();
        setUser(fresh);
        saveUser(fresh);
      } catch (err) {
        // A 401 is handled by the interceptor (signs out). Offline / slow server: keep the cached session.
        if (err.response?.status === 401 || !hasCachedUser) await logout();
      } finally {
        setInitializing(false);
      }
    })();
  }, [logout]);

  // Any 401 from the API signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      login: async (credentials) => applySession(await authApi.login(credentials)),
      register: async (details) => applySession(await authApi.register(details)),
      updateProfile: async (changes) => {
        const next = await authApi.updateMe(changes);
        setUser(next);
        saveUser(next);
      },
      logout,
    }),
    [user, token, initializing, applySession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
