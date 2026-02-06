import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/config';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.HOME]: '首頁',
  [ROUTES.ABOUT]: '關於我',
  [ROUTES.METHOD]: '五金剛系統',
  [ROUTES.STORIES]: '學員故事',
  [ROUTES.RESOURCES]: '免費資源',
  [ROUTES.BOOKING]: '預約陪跑',
  [ROUTES.PRIVACY]: '隱私權政策',
  [ROUTES.QUIZ]: '測驗',
};

/**
 * 麵包屑：依當前路徑與自訂項目顯示 首頁 > 某頁
 */
export function Breadcrumbs({ items }: { items?: BreadcrumbItem[] }) {
  const pathItems = items ?? [];
  return (
    <nav aria-label="麵包屑" className="flex items-center gap-1 text-sm text-muted-foreground font-body flex-wrap">
      <Link to={ROUTES.HOME} className="hover:text-foreground transition-colors">
        {ROUTE_LABELS[ROUTES.HOME] ?? '首頁'}
      </Link>
      {pathItems.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const label = ROUTE_LABELS[pathname];
  if (!label || pathname === ROUTES.HOME) return [];
  return [{ label, path: pathname }];
}
