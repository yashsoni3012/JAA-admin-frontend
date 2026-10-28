'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { adminLogin, adminLogout, getAuthSession } from '@/services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session after mount
  useEffect(() => {
    try {
      const session = getAuthSession();
      if (session?.user && session?.token) {
        setUser(session.user);
        setToken(session.token);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const session = await adminLogin(credentials);
      setUser(session.user);
      setToken(session.token);
      return session;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminLogout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedData };
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('jaa_admin_session');
          if (raw) {
            const session = JSON.parse(raw);
            session.user = nextUser;
            window.localStorage.setItem('jaa_admin_session', JSON.stringify(session));
          }
        } catch {}
      }
      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, token, isLoading, login, logout, updateUser]
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
