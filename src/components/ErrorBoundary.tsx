import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 全域錯誤邊界：子元件拋錯時顯示友善錯誤頁，避免白屏
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-6">
          <div className="text-center max-w-md">
            <h1 className="font-display text-2xl text-foreground mb-2">發生錯誤</h1>
            <p className="font-body text-muted-foreground mb-6">
              頁面暫時無法載入，請重新整理或返回首頁。
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-body"
              >
                重新整理
              </button>
              <Link
                to={ROUTES.HOME}
                className="px-4 py-2 rounded-lg border border-border font-body hover:bg-secondary"
              >
                返回首頁
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
