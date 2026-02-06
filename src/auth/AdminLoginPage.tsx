import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SITE_NAME } from '@/config';

export function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(password)) {
      setPassword('');
    } else {
      setError('密碼錯誤');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-2xl">後台登入</CardTitle>
          <CardDescription className="font-body">{SITE_NAME} 管理後台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                autoFocus
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
              />
            </div>
            {error && <p className="text-sm text-destructive font-body">{error}</p>}
            <Button type="submit" className="w-full" variant="golden">
              登入
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 font-body">
            示範模式預設密碼：admin（接上 Supabase Auth 後改為正式登入）
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
