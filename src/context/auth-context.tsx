import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, type User } from '@/lib/api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthStorage } from '@/lib/auth-storage';
import { notifyNativeLogout } from '@/lib/webview-bridge';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const u = await api<User>('/users/me');
    setUser(u);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (!storedToken) return;
        setToken(storedToken);
        await refreshUser();
      } catch {
        await clearAuthStorage();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const signIn = useCallback(async (newToken: string, newUser: User) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      await clearAuthStorage();
    } catch {
      // Still logged out in memory even if storage clear fails
    }
    notifyNativeLogout();
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signIn, signOut, refreshUser }),
    [user, token, loading, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
