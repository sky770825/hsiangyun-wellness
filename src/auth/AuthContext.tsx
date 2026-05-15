/**
 * 後台登入情境：目前為 mock（localStorage 記住模擬登入），接 Supabase Auth 後改為 session
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
    // 無論是否有 Supabase，永遠檢查 localStorage mock auth 狀態
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    setState({ isAuthenticated: !!stored });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((password: string): boolean => {
    const expected = getAdminPassword();
    // 密碼為空字串時不允許登入
    if (!expected) {
      console.error('[Auth] VITE_ADMIN_PASSWORD 未設定，請聯繫系統管理員');
      return false;
    }
    if (password === expected) {
      localStorage.setItem(AUTH_STORAGE_KEY, '1');
      setState({ isAuthenticated: true });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
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
