import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchTasks } from '@/services/tasks';
import { fetchMembers } from '@/services/crm';
import { fetchBookings } from '@/services/booking';
import { ADMIN_ROUTES } from '@/config/routes';
import { loadTagColors } from '../store';
import { DEFAULT_TAG_COLOR } from '../constants/tag-colors';
import type { StudentTask } from '../types';
import type { BookingSubmission } from '../types';
import type { CRMStudent } from '../types';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

function getWeekDays(weekOffset: number): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + weekOffset * 7);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const isToday = d.getTime() === today.getTime();
  const label = d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' });
  return isToday ? `今天 ${label}` : label;
}

const TASK_STATUS_HEX: Record<StudentTask['status'], string> = {
  todo: '#eab308',
  in_progress: '#3b82f6',
  done: '#22c55e',
};

const BOOKING_STATUS_HEX: Record<string, string> = {
  pending: '#eab308',
  contacted: '#3b82f6',
  confirmed: '#22c55e',
  cancelled: '#94a3b8',
};

export default function AdminCalendar() {
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [members, setMembers] = useState<CRMStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterStudentId, setFilterStudentId] = useState<string>('all');
  const [tagColors] = useState<Record<string, string>>(() => loadTagColors());

  const weekDays = getWeekDays(weekOffset);
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchTasks(), fetchBookings(), fetchMembers()]).then(([t, b, m]) => {
      if (!cancelled) {
        setTasks(t);
        setBookings(b);
        setMembers(m);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const getStudentName = (id: string) => members.find((s) => s.id === id)?.name ?? '未指定';

  const taskColor = (t: StudentTask): string => {
    const member = members.find((m) => m.id === t.studentId);
    const firstTag = (member?.tags ?? [])[0];
    if (firstTag && tagColors[firstTag]) return tagColors[firstTag];
    return TASK_STATUS_HEX[t.status];
  };

  const filteredTasks = filterStudentId === 'all'
    ? tasks
    : tasks.filter((t) => t.studentId === filterStudentId);

  const tasksByDate = weekDays.reduce<Record<string, StudentTask[]>>((acc, dateStr) => {
    acc[dateStr] = filteredTasks.filter((t) => t.status !== 'done' && t.dueDate === dateStr);
    return acc;
  }, {});

  const isOverdue = (t: StudentTask) => t.status !== 'done' && t.dueDate && t.dueDate < todayStr;

  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">本週行事曆</h1>
        <p className="text-muted-foreground font-body mt-1">依日期檢視任務到期與預約狀況；可切換本週／下週、依學員篩選。</p>
      </div>

      <Card className="card-pearl">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-accent" />
              {weekOffset === 0 ? '本週' : '下週'}任務到期
            </CardTitle>
            <CardDescription className="font-body">點任務可前往任務板；顏色依學員標籤或任務狀態</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
              disabled={weekOffset === 0}
              className="min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" /> 上週
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset((o) => o + 1)}
              className="min-h-[44px]"
            >
              下週 <ChevronRight className="w-4 h-4" />
            </Button>
            <Select value={filterStudentId} onValueChange={setFilterStudentId}>
              <SelectTrigger className="w-[160px] min-h-[44px]">
                <SelectValue placeholder="全部學員" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部學員</SelectItem>
                {members.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">載入中…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {weekDays.map((dateStr) => {
                const isToday = dateStr === todayStr;
                return (
                  <div
                    key={dateStr}
                    className={`rounded-lg border p-3 ${isToday ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border'}`}
                  >
                    <p className={`font-body text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {formatDay(dateStr)}
                    </p>
                    <ul className="space-y-1">
                      {(tasksByDate[dateStr] ?? []).length === 0 ? (
                        <li className="text-xs text-muted-foreground">無到期任務</li>
                      ) : (
                        (tasksByDate[dateStr] ?? []).map((t) => {
                          const overdue = isOverdue(t);
                          const color = taskColor(t);
                          return (
                            <li key={t.id} className="flex items-center gap-2">
                              <span
                                className="shrink-0 w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                                title={getStudentName(t.studentId)}
                              />
                              <Link
                                to={ADMIN_ROUTES.TASKS}
                                className={`text-sm hover:underline truncate ${overdue ? 'text-destructive font-medium' : 'text-primary'}`}
                              >
                                {t.title}
                                {overdue && ' (逾期)'}
                              </Link>
                              <span className="text-xs text-muted-foreground shrink-0">（{getStudentName(t.studentId)}）</span>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-lg">待處理預約</CardTitle>
          <CardDescription className="font-body">待處理與已確認預約，可至預約管理更新；顏色依狀態</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">目前無待處理或已確認預約</p>
          ) : (
            <ul className="space-y-2">
              {pendingBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border-l-4 p-2 border border-border"
                  style={{ borderLeftColor: BOOKING_STATUS_HEX[b.status] ?? DEFAULT_TAG_COLOR }}
                >
                  <span className="font-body text-sm">{b.name} · {b.status === 'pending' ? '待處理' : '已確認'}</span>
                  <Link to={ADMIN_ROUTES.BOOKINGS} className="text-sm text-primary hover:underline">前往</Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
