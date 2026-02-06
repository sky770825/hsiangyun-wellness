import React, { useState, useEffect } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadBookings, saveBookings } from '../store';
import { fetchBookings, updateBookingStatus, deleteBooking } from '@/services/booking';
import { createMember, fetchMembers } from '@/services/crm';
import type { BookingSubmission } from '../types';
import { EmptyState } from '../components/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { LayoutGrid, List, Trash2 } from 'lucide-react';

const STATUS_MAP: Record<BookingSubmission['status'], string> = {
  pending: '待處理',
  contacted: '已聯繫',
  confirmed: '已確認',
  cancelled: '已取消',
};

const STATUS_BADGE_CLASS: Record<BookingSubmission['status'], string> = {
  pending: 'border-amber-500/60 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  contacted: 'border-blue-500/60 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  confirmed: 'border-green-500/60 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  cancelled: 'border-muted bg-muted text-muted-foreground',
};

type DateFilter = 'all' | '7d' | '30d';
type ViewMode = 'cards' | 'table';
type SortBy = 'dateDesc' | 'dateAsc' | 'status';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [members, setMembers] = useState<{ email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BookingSubmission['status'] | 'all'>('all');
  const [filterDate, setFilterDate] = useState<DateFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<SortBy>('dateDesc');
  const [groupByDate, setGroupByDate] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchBookings(), fetchMembers()]).then(([list, memberList]) => {
      if (!cancelled) {
        setBookings(list);
        setMembers(memberList.map((m) => ({ email: m.email })));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const updateStatus = async (id: string, status: BookingSubmission['status']) => {
    const now = new Date().toISOString();
    const next = bookings.map((b) =>
      b.id === id ? { ...b, status, updatedAt: now } : b,
    );
    setBookings(next);
    try {
      await updateBookingStatus(id, status);
    } catch {
      saveBookings(next);
    }
  };

  const turnIntoMember = async (b: BookingSubmission) => {
    if (members.some((m) => m.email === b.email)) {
      toast.info('該 email 已是學員');
      return;
    }
    await createMember({
      name: b.name,
      email: b.email,
      source: 'booking',
      status: 'new',
    });
    setMembers((prev) => [...prev, { email: b.email }]);
    toast.success(`已將 ${b.name} 加入學員`);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteBooking(deleteTargetId);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTargetId));
      toast.success('已刪除該筆預約');
    } catch {
      toast.error('刪除失敗，請稍後再試');
    }
    setDeleteTargetId(null);
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterDate !== 'all') {
      const created = new Date(b.createdAt).getTime();
      const now = Date.now();
      const cut = filterDate === '7d' ? now - 7 * 24 * 60 * 60 * 1000 : now - 30 * 24 * 60 * 60 * 1000;
      if (created < cut) return false;
    }
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'dateDesc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'dateAsc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return (a.status === b.status) ? 0 : (a.status < b.status ? -1 : 1);
  });

  const stats = { pending: 0, contacted: 0, confirmed: 0, cancelled: 0 };
  bookings.forEach((b) => { stats[b.status] = (stats[b.status] ?? 0) + 1; });

  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const groupByDateMap = new Map<string, BookingSubmission[]>();
  if (groupByDate && viewMode === 'cards') {
    sortedBookings.forEach((b) => {
      const key = (b.createdAt || '').slice(0, 10) || todayKey;
      if (!groupByDateMap.has(key)) groupByDateMap.set(key, []);
      groupByDateMap.get(key)!.push(b);
    });
  }
  const dateGroupKeys = [...groupByDateMap.keys()].sort((a, b) => b.localeCompare(a));

  const formatDateLabel = (key: string) => {
    if (key === todayKey) return '今天';
    if (key === yesterdayKey) return '昨天';
    try {
      const [y, m, d] = key.split('-');
      return `${Number(m)}月${Number(d)}日`;
    } catch {
      return key;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">預約管理</h1>
        <p className="text-muted-foreground font-body mt-1">前台預約表單提交列表，可更新狀態以便追蹤。</p>
      </div>

      <Card className="card-pearl">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl">預約列表</CardTitle>
            <CardDescription className="font-body">
              從 Supabase 或本地讀取；可切換卡片／表格檢視、排序與篩選。
            </CardDescription>
          </div>
          {!loading && bookings.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('cards')} aria-label="卡片檢視">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} aria-label="表格檢視">
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-[140px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateDesc">最新優先</SelectItem>
                  <SelectItem value="dateAsc">最舊優先</SelectItem>
                  <SelectItem value="status">依狀態</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as BookingSubmission['status'] | 'all')}>
                <SelectTrigger className="w-[120px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  {(Object.entries(STATUS_MAP) as [BookingSubmission['status'], string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={(v) => setFilterDate(v as DateFilter)}>
                <SelectTrigger className="w-[120px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部日期</SelectItem>
                  <SelectItem value="7d">最近 7 天</SelectItem>
                  <SelectItem value="30d">最近 30 天</SelectItem>
                </SelectContent>
              </Select>
              {viewMode === 'cards' && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupByDate}
                    onChange={(e) => setGroupByDate(e.target.checked)}
                    className="rounded border-border"
                  />
                  依日期分組
                </label>
              )}
              <span className="text-sm text-muted-foreground">共 {filteredBookings.length} 筆</span>
            </div>
          )}
        </CardHeader>
        {!loading && bookings.length > 0 && (
          <CardContent className="border-t pt-2">
            <div className="flex flex-wrap gap-4 py-2 text-sm text-muted-foreground">
              <span>待處理 <strong className="text-foreground">{stats.pending}</strong></span>
              <span>已聯繫 <strong className="text-foreground">{stats.contacted}</strong></span>
              <span>已確認 <strong className="text-foreground">{stats.confirmed}</strong></span>
              <span>已取消 <strong className="text-foreground">{stats.cancelled}</strong></span>
            </div>
          </CardContent>
        )}
        <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground font-body text-sm">載入中…</p>
            ) : bookings.length === 0 ? (
              <EmptyState
                title="尚無預約資料"
                description="前台預約表單的提交會出現在這裡。"
              />
            ) : filteredBookings.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm">沒有符合條件的預約，可調整篩選條件。</p>
            ) : viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="max-w-[200px]">留言</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>建立日</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBookings.map((b) => (
                    <React.Fragment key={b.id}>
                      <TableRow>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{b.email}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground" title={b.message ?? ''}>
                          {b.message ? (b.message.length > 40 ? b.message.slice(0, 40) + '…' : b.message) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_BADGE_CLASS[b.status]}>{STATUS_MAP[b.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{b.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setExpandedId((id) => (id === b.id ? null : b.id))}>
                              {expandedId === b.id ? '收合' : '詳情'}
                            </Button>
                            {b.status === 'pending' && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(b.id, 'contacted')}>已聯繫</Button>
                            )}
                            {b.status !== 'cancelled' && !members.some((m) => m.email === b.email) && (
                              <Button variant="soft" size="sm" onClick={() => turnIntoMember(b)}>轉入學員</Button>
                            )}
                            {['pending', 'contacted'].includes(b.status) && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(b.id, 'confirmed')}>已確認</Button>
                            )}
                            {b.status !== 'cancelled' && (
                              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => updateStatus(b.id, 'cancelled')}>取消</Button>
                            )}
                            <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingSubmission['status'])}>
                              <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.entries(STATUS_MAP) as [BookingSubmission['status'], string][]).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTargetId(b.id)} aria-label="刪除此筆預約">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedId === b.id && b.message && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/40 border-l-2 border-primary/30">
                            <p className="text-xs text-muted-foreground mb-1">完整留言</p>
                            <p className="font-body text-sm whitespace-pre-wrap">{b.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">建立 {b.createdAt}{b.updatedAt !== b.createdAt ? ` · 更新 ${b.updatedAt}` : ''}</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            ) : groupByDate && dateGroupKeys.length > 0 ? (
              dateGroupKeys.map((dateKey) => (
                <div key={dateKey} className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground sticky top-0 bg-card py-1">
                    {formatDateLabel(dateKey)}（{groupByDateMap.get(dateKey)!.length} 筆）
                  </p>
                  {(groupByDateMap.get(dateKey) ?? []).map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-border p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-foreground">{b.name}</p>
                      <p className="text-muted-foreground font-body text-sm">{b.email}</p>
                      {b.message && (
                        <p className={`text-muted-foreground font-body text-sm mt-2 ${expandedId === b.id ? '' : 'line-clamp-2'}`}>
                          {b.message}
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs mt-2">
                        建立 {b.createdAt}
                        {b.updatedAt !== b.createdAt && ` · 更新 ${b.updatedAt}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] text-muted-foreground"
                      onClick={() => setExpandedId((id) => (id === b.id ? null : b.id))}
                    >
                      {expandedId === b.id ? '收合' : '檢視詳情'}
                    </Button>
                    <div className="flex flex-wrap gap-1">
                      {b.status === 'pending' && (
                        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => updateStatus(b.id, 'contacted')}>
                          已聯繫
                        </Button>
                      )}
                      {b.status !== 'cancelled' && !members.some((m) => m.email === b.email) && (
                        <Button variant="soft" size="sm" className="min-h-[44px]" onClick={() => turnIntoMember(b)}>
                          轉入學員
                        </Button>
                      )}
                      {['pending', 'contacted'].includes(b.status) && (
                        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => updateStatus(b.id, 'confirmed')}>
                          已確認
                        </Button>
                      )}
                      {b.status !== 'cancelled' && (
                        <Button variant="ghost" size="sm" className="min-h-[44px] text-muted-foreground" onClick={() => updateStatus(b.id, 'cancelled')}>
                          取消
                        </Button>
                      )}
                    </div>
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingSubmission['status'])}>
                      <SelectTrigger className="w-28 min-h-[44px]">
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
                    <Badge variant="outline" className={STATUS_BADGE_CLASS[b.status]}>{STATUS_MAP[b.status]}</Badge>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive min-h-[44px]" onClick={() => setDeleteTargetId(b.id)} aria-label="刪除此筆預約">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                  </div>
                  {expandedId === b.id && b.message && (
                    <div className="rounded-lg bg-muted/50 p-3 border-l-2 border-primary/30">
                      <p className="text-xs text-muted-foreground mb-1">完整留言</p>
                      <p className="font-body text-sm whitespace-pre-wrap">{b.message}</p>
                    </div>
                  )}
                </div>
                  ))}
                </div>
              ))
            ) : (
              sortedBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-border p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-foreground">{b.name}</p>
                      <p className="text-muted-foreground font-body text-sm">{b.email}</p>
                      {b.message && (
                        <p className={`text-muted-foreground font-body text-sm mt-2 ${expandedId === b.id ? '' : 'line-clamp-2'}`}>
                          {b.message}
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs mt-2">
                        建立 {b.createdAt}
                        {b.updatedAt !== b.createdAt && ` · 更新 ${b.updatedAt}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] text-muted-foreground"
                      onClick={() => setExpandedId((id) => (id === b.id ? null : b.id))}
                    >
                      {expandedId === b.id ? '收合' : '檢視詳情'}
                    </Button>
                    <div className="flex flex-wrap gap-1">
                      {b.status === 'pending' && (
                        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => updateStatus(b.id, 'contacted')}>
                          已聯繫
                        </Button>
                      )}
                      {b.status !== 'cancelled' && !members.some((m) => m.email === b.email) && (
                        <Button variant="soft" size="sm" className="min-h-[44px]" onClick={() => turnIntoMember(b)}>
                          轉入學員
                        </Button>
                      )}
                      {['pending', 'contacted'].includes(b.status) && (
                        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => updateStatus(b.id, 'confirmed')}>
                          已確認
                        </Button>
                      )}
                      {b.status !== 'cancelled' && (
                        <Button variant="ghost" size="sm" className="min-h-[44px] text-muted-foreground" onClick={() => updateStatus(b.id, 'cancelled')}>
                          取消
                        </Button>
                      )}
                    </div>
<Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingSubmission['status'])}>
                      <SelectTrigger className="w-28 min-h-[44px]">
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
                    <Badge variant="outline" className={STATUS_BADGE_CLASS[b.status]}>{STATUS_MAP[b.status]}</Badge>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive min-h-[44px]" onClick={() => setDeleteTargetId(b.id)} aria-label="刪除此筆預約">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                  </div>
                  {expandedId === b.id && b.message && (
                    <div className="rounded-lg bg-muted/50 p-3 border-l-2 border-primary/30">
                      <p className="text-xs text-muted-foreground mb-1">完整留言</p>
                      <p className="font-body text-sm whitespace-pre-wrap">{b.message}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確認刪除此筆預約？</AlertDialogTitle>
              <AlertDialogDescription>
                刪除後無法復原，僅用於移除測試單或錯誤資料。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                刪除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
