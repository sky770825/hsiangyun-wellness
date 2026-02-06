import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Palette,
  Image,
  CalendarCheck,
  Users,
  Kanban,
  Send,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_NAV } from './admin-nav';
import { SITE_NAME, ROUTES } from '@/config';

const iconMap = {
  LayoutDashboard,
  Palette,
  Image,
  CalendarCheck,
  Users,
  Kanban,
  Send,
};

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* 側邊欄 - 與前台相同設計語言 */}
      <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-xl text-foreground">後台管理</h1>
          <p className="text-muted-foreground font-body text-xs mt-1">{SITE_NAME}</p>
        </div>
        <nav className="p-3 flex-1 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm transition-colors',
                  isActive
                    ? 'bg-primary/20 text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {Icon && <Icon className="w-5 h-5 shrink-0" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <a
            href={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground font-body text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            前往前台
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
