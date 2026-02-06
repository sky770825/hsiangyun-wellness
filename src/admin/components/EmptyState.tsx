import { type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * 後台列表空狀態：引導建立第一筆資料
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <p className="font-display text-lg text-foreground mb-2">{title}</p>
      {description && <p className="font-body text-sm text-muted-foreground mb-6">{description}</p>}
      {action}
    </div>
  );
}
