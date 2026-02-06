import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ROUTES } from '@/config';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center font-body">
        <h1 className="font-display mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">頁面不存在</p>
        <Link to={ROUTES.HOME} className="text-primary underline hover:text-primary/90">
          返回首頁
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
