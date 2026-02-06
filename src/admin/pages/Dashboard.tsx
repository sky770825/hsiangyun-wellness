import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadBookings, loadCRM, loadTasks, loadPushMessages } from '../store';
import { getBookingStats, getCRMStats, getTaskStats, getPushStats } from '../utils/stats';
import { ADMIN_ROUTES } from '@/config/routes';
import { CalendarCheck, Users, Kanban, Send } from 'lucide-react';

export default function AdminDashboard() {
  const bookings = loadBookings();
  const crm = loadCRM();
  const tasks = loadTasks();
  const push = loadPushMessages();

  const bookingStats = getBookingStats(bookings);
  const crmStats = getCRMStats(crm);
  const taskStats = getTaskStats(tasks);
  const pushStats = getPushStats(push);

  const cards = [
    { title: '待處理預約', value: bookingStats.pending, href: ADMIN_ROUTES.BOOKINGS, icon: CalendarCheck },
    { title: '進行中學員', value: crmStats.following + crmStats.in_progress, href: ADMIN_ROUTES.CRM, icon: Users },
    { title: '未完成任務', value: taskStats.todo + taskStats.in_progress, href: ADMIN_ROUTES.TASKS, icon: Kanban },
    { title: '草稿推播', value: pushStats.draft, href: ADMIN_ROUTES.PUSH, icon: Send },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">總覽</h1>
        <p className="text-muted-foreground font-body mt-1">後台首頁，快速掌握預約、學員與任務狀況。</p>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-lg">預約狀態分布</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-body text-muted-foreground space-y-1">
            <p>待處理 {bookingStats.pending} · 已聯絡 {bookingStats.contacted} · 已確認 {bookingStats.confirmed} · 已取消 {bookingStats.cancelled}</p>
            <p className="text-xs">共 {bookingStats.total} 筆</p>
          </CardContent>
        </Card>
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-lg">學員狀態分布</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-body text-muted-foreground space-y-1">
            <p>新進 {crmStats.new} · 跟進中 {crmStats.following} · 進行中 {crmStats.in_progress} · 已完成 {crmStats.completed} · 暫停 {crmStats.paused}</p>
            <p className="text-xs">共 {crmStats.total} 位</p>
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
          <Link to={ADMIN_ROUTES.PUSH}>
            <Button variant="soft">推播發送</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
