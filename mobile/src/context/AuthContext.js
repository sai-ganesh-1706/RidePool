import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';

const TOKEN_KEY = 'ridepool.token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback(async ({ user: nextUser, token: nextToken }) => {
    setAuthToken(nextToken);
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Restore a saved session on app start.
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          setAuthToken(saved);
          setUser(await authApi.me());
          setToken(saved);
        }
      } catch {
        setAuthToken(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

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
      updateProfile: async (changes) => setUser(await authApi.updateMe(changes)),
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
