'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { adminLogin, adminLogout, getAuthSession } from '@/services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session after mount without making unnecessary background API calls
  useEffect(() => {
    let isMounted = true;

    try {
      const cached = getAuthSession();
      if (cached?.user && isMounted) {
        setUser(cached.user);
      } else if (isMounted) {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      if (isMounted) setUser(null);
    } finally {
      if (isMounted) setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const session = await adminLogin(credentials);
      setUser(session.user);
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
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedData };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('jaa_admin_user', JSON.stringify(nextUser));
        } catch {}
      }
      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
