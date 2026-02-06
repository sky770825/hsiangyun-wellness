import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadBookings, loadCRM, loadTasks, loadPushMessages, loadStaleDays, saveStaleDays } from '../store';
import {
  getBookingStats,
  getCRMStats,
  getTaskStats,
  getPushStats,
  getBookingConversionRate,
  getTaskCompletionRate,
  getActiveMemberRate,
  getBookingsInDays,
  getBookingsBetweenDays,
  getMembersAddedInDays,
  getMembersAddedBetweenDays,
  getMembersStaleDays,
} from '../utils/stats';
import { fetchBookings } from '@/services/booking';
import { fetchMembers } from '@/services/crm';
import { fetchTasks } from '@/services/tasks';
import { hasSupabase } from '@/lib/env';
import { ADMIN_ROUTES } from '@/config/routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { CalendarCheck, Users, Kanban, Send, AlertCircle, TrendingUp, Target, Zap, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BookingSubmission } from '../types';
import type { CRMStudent } from '../types';
import type { StudentTask } from '../types';

function getOverdueTasks(tasks: StudentTask[]): StudentTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  });
}

function getTasksDueToday(tasks: StudentTask[]): StudentTask[] {
  const today = new Date().toISOString().slice(0, 10);
  return tasks.filter((t) => t.status !== 'done' && t.dueDate === today);
}

function getTasksDueThisWeek(tasks: StudentTask[]): StudentTask[] {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + 7);
  return tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= start && d < end;
  });
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [crm, setCrm] = useState<CRMStudent[]>([]);
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [push, setPush] = useState(loadPushMessages());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [staleDays, setStaleDays] = useState<3 | 7 | 14>(() => loadStaleDays());

  const refresh = () => {
    setLoading(true);
    if (hasSupabase()) {
      Promise.all([fetchBookings(), fetchMembers(), fetchTasks()]).then(([b, c, t]) => {
        setBookings(b);
        setCrm(c);
        setTasks(t);
        setLastUpdated(new Date());
        setLoading(false);
      });
    } else {
      setBookings(loadBookings());
      setCrm(loadCRM());
      setTasks(loadTasks());
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    const done = () => {
      setLastUpdated(new Date());
      setLoading(false);
    };
    if (hasSupabase()) {
      Promise.all([fetchBookings(), fetchMembers(), fetchTasks()]).then(([b, c, t]) => {
        setBookings(b);
        setCrm(c);
        setTasks(t);
        done();
      });
    } else {
      setBookings(loadBookings());
      setCrm(loadCRM());
      setTasks(loadTasks());
      done();
    }
  }, []);

  const bookingStats = getBookingStats(bookings);
  const crmStats = getCRMStats(crm);
  const taskStats = getTaskStats(tasks);
  const pushStats = getPushStats(push);
  const overdueTasks = getOverdueTasks(tasks);
  const dueToday = getTasksDueToday(tasks);
  const dueThisWeek = getTasksDueThisWeek(tasks);
  const bookingChartData = [
    { name: 'pending', value: bookingStats.pending, label: '待處理' },
    { name: 'contacted', value: bookingStats.contacted, label: '已聯絡' },
    { name: 'confirmed', value: bookingStats.confirmed, label: '已確認' },
    { name: 'cancelled', value: bookingStats.cancelled, label: '已取消' },
  ].filter((d) => d.value > 0);

  const crmChartData = [
    { name: 'new', value: crmStats.new, label: '新進' },
    { name: 'following', value: crmStats.following, label: '跟進中' },
    { name: 'in_progress', value: crmStats.in_progress, label: '進行中' },
    { name: 'completed', value: crmStats.completed, label: '已完成' },
    { name: 'paused', value: crmStats.paused, label: '暫停' },
  ].filter((d) => d.value > 0);

  const bookingChartConfig: ChartConfig = {
    pending: { label: '待處理', color: '#eab308' },
    contacted: { label: '已聯絡', color: '#3b82f6' },
    confirmed: { label: '已確認', color: '#22c55e' },
    cancelled: { label: '已取消', color: '#94a3b8' },
  };
  const crmChartConfig: ChartConfig = {
    new: { label: '新進', color: '#64748b' },
    following: { label: '跟進中', color: '#3b82f6' },
    in_progress: { label: '進行中', color: '#22c55e' },
    completed: { label: '已完成', color: '#16a34a' },
    paused: { label: '暫停', color: '#94a3b8' },
  };

  const recentConfirmedBookings = bookings
    .filter((b) => b.status === 'confirmed')
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
    .slice(0, 5);

  const conversionRate = getBookingConversionRate(bookings);
  const taskCompletionRate = getTaskCompletionRate(tasks);
  const activeMemberRate = getActiveMemberRate(crm);
  const bookingsLast7 = getBookingsInDays(bookings, 7);
  const bookingsPrev7 = getBookingsBetweenDays(bookings, 7, 14);
  const membersAddedLast7 = getMembersAddedInDays(crm, 7);
  const membersAddedPrev7 = getMembersAddedBetweenDays(crm, 7, 14);
  const staleMembers = getMembersStaleDays(crm, staleDays);

  const firstPendingBooking = bookings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
  const firstOverdueTask = overdueTasks[0];
  const firstDueToday = dueToday[0];
  const firstStaleMember = staleMembers[0];

  const priorityActions: { label: string; count: number; href: string; reason: string }[] = [];
  if (bookingStats.pending > 0) {
    priorityActions.push({
      label: '待處理預約',
      count: bookingStats.pending,
      href: ADMIN_ROUTES.BOOKINGS,
      reason: '影響轉化率，建議優先聯絡',
    });
  }
  if (overdueTasks.length > 0) {
    priorityActions.push({
      label: '逾期任務',
      count: overdueTasks.length,
      href: ADMIN_ROUTES.TASKS,
      reason: '影響學員體驗',
    });
  }
  if (dueToday.length > 0) {
    priorityActions.push({
      label: '今日到期任務',
      count: dueToday.length,
      href: ADMIN_ROUTES.TASKS,
      reason: '今日需處理',
    });
  }
  if (staleMembers.length > 0) {
    priorityActions.push({
      label: `超過 ${staleDays} 天未更新備註的學員`,
      count: staleMembers.length,
      href: ADMIN_ROUTES.CRM,
      reason: '建議更新進度',
    });
  }

  const cards = [
    { title: '待處理預約', value: loading ? '—' : bookingStats.pending, href: ADMIN_ROUTES.BOOKINGS, icon: CalendarCheck },
    { title: '進行中學員', value: loading ? '—' : crmStats.following + crmStats.in_progress, href: ADMIN_ROUTES.CRM, icon: Users },
    { title: '未完成任務', value: loading ? '—' : taskStats.todo + taskStats.in_progress, href: ADMIN_ROUTES.TASKS, icon: Kanban },
    { title: '草稿推播', value: pushStats.draft, href: ADMIN_ROUTES.PUSH, icon: Send },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">總覽</h1>
        <p className="text-muted-foreground font-body mt-1">
        後台首頁，快速掌握預約、學員與任務狀況。
        {lastUpdated && (
          <span className="ml-2 text-xs">最後更新 {lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </p>
      <div className="flex gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="min-h-[44px] min-w-[44px]">
          {loading ? '載入中…' : '重新整理'}
        </Button>
      </div>
      </div>

      {!loading && (() => {
        const mustDo: { num: number; label: string; href: string; variant: 'default' | 'destructive' | 'outline' }[] = [];
        if (firstPendingBooking) mustDo.push({ num: mustDo.length + 1, label: `聯絡預約：${firstPendingBooking.name}`, href: ADMIN_ROUTES.BOOKINGS, variant: 'default' });
        if (firstOverdueTask) mustDo.push({ num: mustDo.length + 1, label: `逾期任務：${firstOverdueTask.title}`, href: ADMIN_ROUTES.TASKS, variant: 'destructive' });
        if (firstDueToday) mustDo.push({ num: mustDo.length + 1, label: `今日到期：${firstDueToday.title}`, href: ADMIN_ROUTES.TASKS, variant: 'outline' });
        if (firstStaleMember) mustDo.push({ num: mustDo.length + 1, label: `跟進學員：${firstStaleMember.name}`, href: ADMIN_ROUTES.CRM_MEMBER(firstStaleMember.id), variant: 'outline' });
        if (mustDo.length === 0) return null;
        return (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <p className="font-display text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              今日必做
            </p>
            <div className="flex flex-wrap gap-3">
              {mustDo.map((item) => (
                <Link key={item.label} to={item.href}>
                  <Button variant={item.variant} size="sm" className="min-h-[44px]">
                    {item.num}. {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {priorityActions.length > 0 && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>建議優先處理</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {priorityActions.slice(0, 4).map((a) => (
              <Link key={a.label} to={a.href} className="hover:underline font-medium">
                {a.label} {a.count} 筆
              </Link>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {!loading && (bookings.length > 0 || crm.length > 0 || tasks.length > 0) && (
        <Card className="card-pearl border-primary/20">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                數據驅動・優先決策
              </CardTitle>
              <CardDescription className="font-body">
                依數據排序的建議動作；可調整「久未更新」天數以篩選建議跟進學員
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">建議跟進：超過</span>
              <Select value={String(staleDays)} onValueChange={(v) => { const n = Number(v) as 3 | 7 | 14; setStaleDays(n); saveStaleDays(n); }}>
                <SelectTrigger className="w-[72px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 天</SelectItem>
                  <SelectItem value="7">7 天</SelectItem>
                  <SelectItem value="14">14 天</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">未更新備註</span>
            </div>
          </CardHeader>
          <CardContent>
            {priorityActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">目前無待優先處理項目，可維持日常跟進。</p>
            ) : (
              <ol className="space-y-3">
                {priorityActions.map((a, i) => (
                  <li key={a.label} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-body text-sm">
                      <strong className="text-foreground">{i + 1}. {a.label}</strong>
                      <span className="text-muted-foreground ml-2">（{a.reason}）</span>
                    </span>
                    <Link to={a.href}>
                      <Button variant="outline" size="sm" className="min-h-[44px]">
                        前往處理 · {a.count} 筆
                      </Button>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && (bookings.length > 0 || crm.length > 0 || tasks.length > 0) && (
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              關鍵指標
            </CardTitle>
            <CardDescription className="font-body">
              轉化率、完成率、活躍度與近期趨勢，支援決策
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground font-body">預約轉化率</p>
                <p className="font-display text-2xl text-foreground mt-1">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">已確認 / 非取消預約</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground font-body">任務完成率</p>
                <p className="font-display text-2xl text-foreground mt-1">{taskCompletionRate}%</p>
                <p className="text-xs text-muted-foreground">已完成 / 總任務</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground font-body">學員活躍比</p>
                <p className="font-display text-2xl text-foreground mt-1">{activeMemberRate}%</p>
                <p className="text-xs text-muted-foreground">跟進中＋進行中 / 總學員</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground font-body">近 7 天 / 趨勢</p>
                <p className="font-display text-xl text-foreground mt-1">
                  <Zap className="w-4 h-4 inline mr-1 text-accent" />
                  預約 本週 {bookingsLast7}（上週 {bookingsPrev7}）
                </p>
                <p className="text-xs text-muted-foreground mt-1">新增學員 本週 {membersAddedLast7}（上週 {membersAddedPrev7}）</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} to={card.href}>
              <Card className="card-pearl hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className="w-5 h-5 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="font-display text-2xl text-foreground">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-lg">今日／本週焦點</CardTitle>
          <p className="text-muted-foreground font-body text-sm">到期任務與待處理預約</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">載入中…</p>
          ) : (
            <>
              <p className="font-body text-sm">
                今日到期任務：<strong>{dueToday.length}</strong> 筆
                {dueToday.length > 0 && (
                  <Link to={ADMIN_ROUTES.TASKS} className="ml-2 text-primary hover:underline">前往任務板</Link>
                )}
              </p>
              <p className="font-body text-sm">
                本週到期任務：<strong>{dueThisWeek.length}</strong> 筆
                {dueThisWeek.length > 0 && (
                  <Link to={ADMIN_ROUTES.TASKS} className="ml-2 text-primary hover:underline">前往任務板</Link>
                )}
              </p>
              <p className="font-body text-sm">
                待處理預約：<strong>{bookingStats.pending}</strong> 筆
                {bookingStats.pending > 0 && (
                  <Link to={ADMIN_ROUTES.BOOKINGS} className="ml-2 text-primary hover:underline">前往預約管理</Link>
                )}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {!loading && recentConfirmedBookings.length > 0 && (
        <Card className="card-pearl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-lg">最近已確認預約</CardTitle>
            <Link to={ADMIN_ROUTES.BOOKINGS}>
              <Button variant="ghost" size="sm" className="text-muted-foreground min-h-[44px]">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentConfirmedBookings.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link to={ADMIN_ROUTES.BOOKINGS} className="font-body text-foreground hover:underline">
                    {b.name}
                  </Link>
                  <span className="text-muted-foreground text-xs">{b.updatedAt || b.createdAt}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-lg">預約狀態分布</CardTitle>
            <p className="text-xs text-muted-foreground">共 {bookingStats.total} 筆</p>
          </CardHeader>
          <CardContent>
            {loading || bookingStats.total === 0 ? (
              <p className="text-sm text-muted-foreground">尚無資料</p>
            ) : bookingChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">無有效數據</p>
            ) : (
              <ChartContainer config={bookingChartConfig} className="h-[180px] w-full">
                <PieChart>
                  <Pie
                    data={bookingChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    label={({ name, value }) => `${bookingChartConfig[name as keyof ChartConfig]?.label ?? name} ${value}`}
                  >
                    {bookingChartData.map((entry, i) => (
                      <Cell key={entry.name} fill={bookingChartConfig[entry.name as keyof ChartConfig]?.color as string} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-lg">學員狀態分布</CardTitle>
            <p className="text-xs text-muted-foreground">共 {crmStats.total} 位</p>
          </CardHeader>
          <CardContent>
            {loading || crmStats.total === 0 ? (
              <p className="text-sm text-muted-foreground">尚無資料</p>
            ) : crmChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">無有效數據</p>
            ) : (
              <ChartContainer config={crmChartConfig} className="h-[180px] w-full">
                <PieChart>
                  <Pie
                    data={crmChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    label={({ name, value }) => `${crmChartConfig[name as keyof ChartConfig]?.label ?? name} ${value}`}
                  >
                    {crmChartData.map((entry) => (
                      <Cell key={entry.name} fill={crmChartConfig[entry.name as keyof ChartConfig]?.color as string} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl">快速操作</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to={ADMIN_ROUTES.SETTINGS}>
            <Button variant="soft">網站設定</Button>
          </Link>
          <Link to={ADMIN_ROUTES.MEDIA}>
            <Button variant="soft">媒體庫</Button>
          </Link>
          <Link to={ADMIN_ROUTES.BOOKINGS}>
            <Button variant="soft">預約管理</Button>
          </Link>
          <Link to={ADMIN_ROUTES.CRM}>
            <Button variant="soft">CRM 學員</Button>
          </Link>
          <Link to={ADMIN_ROUTES.TASKS}>
            <Button variant="soft">學員任務板</Button>
          </Link>
          <Link to={ADMIN_ROUTES.CALENDAR}>
            <Button variant="soft">本週行事曆</Button>
          </Link>
          <Link to={ADMIN_ROUTES.PUSH}>
            <Button variant="soft">推播發送</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
