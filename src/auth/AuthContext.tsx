/**
 * 後台登入情境：目前為 mock（localStorage 記住模擬登入），接 Supabase Auth 後改為 session
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { hasSupabase } from '@/lib/env';

const AUTH_STORAGE_KEY = 'admin_auth_mock';

type AuthState = { isAuthenticated: boolean; userId?: string };

const AuthContext = createContext<{
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  checkAuth: () => void;
} | null>(null);

/** 後台登入密碼：請於 .env 設定 VITE_ADMIN_PASSWORD；未設定時僅在開發模式預設為 admin */
const getAdminPassword = () =>
  import.meta.env.VITE_ADMIN_PASSWORD ?? (import.meta.env.DEV ? 'admin' : '');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ isAuthenticated: false });

  const checkAuth = useCallback(() => {
    if (hasSupabase()) {
      // TODO: getSession() from Supabase and set isAuthenticated
      setState({ isAuthenticated: !!localStorage.getItem(AUTH_STORAGE_KEY) });
      return;
    }
    setState({ isAuthenticated: !!localStorage.getItem(AUTH_STORAGE_KEY) });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((password: string): boolean => {
    if (hasSupabase()) {
      // TODO: signInWithPassword()
      // setState({ isAuthenticated: true, userId: user.id });
      // return true;
    }
    const expected = getAdminPassword();
    if (expected && password === expected) {
      localStorage.setItem(AUTH_STORAGE_KEY, '1');
      setState({ isAuthenticated: true });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    if (hasSupabase()) {
      // TODO: signOut()
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({ isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
