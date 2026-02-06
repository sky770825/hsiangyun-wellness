import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ADMIN_ROUTES } from '@/config/routes';

/**
 * 保護後台路由：未登入時導向登入頁（同網域 /admin/login）
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
