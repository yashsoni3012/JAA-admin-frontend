'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Access auth state and actions: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}
