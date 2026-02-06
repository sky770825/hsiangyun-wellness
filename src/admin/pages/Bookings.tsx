import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { loadBookings, saveBookings } from '../store';
import type { BookingSubmission } from '../types';
import { EmptyState } from '../components/EmptyState';

const STATUS_MAP: Record<BookingSubmission['status'], string> = {
  pending: '待處理',
  contacted: '已聯繫',
  confirmed: '已確認',
  cancelled: '已取消',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingSubmission[]>(() => loadBookings());

  const updateStatus = (id: string, status: BookingSubmission['status']) => {
    const now = new Date().toISOString();
    const next = bookings.map((b) =>
      b.id === id ? { ...b, status, updatedAt: now } : b,
    );
    setBookings(next);
    saveBookings(next);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">預約管理</h1>
        <p className="text-muted-foreground font-body mt-1">前台預約表單提交列表，可更新狀態以便追蹤。</p>
      </div>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl">預約列表</CardTitle>
          <CardDescription className="font-body">
            之後接 Supabase 可改為從資料庫讀寫；也可從此處將預約轉入 CRM 學員。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <EmptyState
                title="尚無預約資料"
                description="前台預約表單的提交會出現在這裡，接上 Supabase 後可從資料庫讀取。"
              />
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="font-display text-foreground">{b.name}</p>
                    <p className="text-muted-foreground font-body text-sm">{b.email}</p>
                    {b.message && (
                      <p className="text-muted-foreground font-body text-sm mt-2 line-clamp-2">
                        {b.message}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs mt-2">{b.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingSubmission['status'])}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(STATUS_MAP) as [BookingSubmission['status'], string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary">{STATUS_MAP[b.status]}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
