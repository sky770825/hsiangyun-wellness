import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchTasks, createTask, updateTaskStatus } from '@/services/tasks';
import { fetchMembers } from '@/services/crm';
import { ADMIN_ROUTES } from '@/config/routes';
import { EmptyState } from '../components/EmptyState';
import type { StudentTask } from '../types';

const COLS: { key: StudentTask['status']; label: string }[] = [
  { key: 'todo', label: '待處理' },
  { key: 'in_progress', label: '進行中' },
  { key: 'done', label: '已完成' },
];

/** 任務範本（身心靈瘦身教練常用） */
const TASK_TEMPLATES: { title: string; description: string }[] = [
  { title: '寄送初談表單連結', description: '已寄出，等待學員回填' },
  { title: '安排首次諮詢時間', description: '確認學員可配合時段' },
  { title: '填寫一週飲食紀錄', description: '請學員在表單中填寫 7 天飲食與情緒簡述' },
  { title: '月底回顧與下月計畫', description: '檢視本月進度並設定下月小目標' },
  { title: '電話／訊息關懷', description: '確認需求與可配合時段' },
];

function isOverdue(task: StudentTask): boolean {
  if (task.status === 'done' || !task.dueDate) return false;
  try {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  } catch {
    return false;
  }
}

export default function AdminTaskBoard() {
  const [searchParams] = useSearchParams();
  const presetStudentId = searchParams.get('studentId') ?? '';
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', studentId: presetStudentId, dueDate: '' });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchTasks(), fetchMembers()]).then(([taskList, memberList]) => {
      if (!cancelled) {
        setTasks(taskList);
        setStudents(memberList.map((s) => ({ id: s.id, name: s.name })));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (presetStudentId && students.some((s) => s.id === presetStudentId)) {
      setNewTask((prev) => ({ ...prev, studentId: presetStudentId }));
      setAdding(true);
    }
  }, [presetStudentId, students]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    const studentId = newTask.studentId || students[0]?.id || '';
    const task = await createTask({
      studentId,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      status: 'todo',
      dueDate: newTask.dueDate || undefined,
    });
    setTasks((prev) => [task, ...prev]);
    setNewTask({ title: '', description: '', studentId: presetStudentId || '', dueDate: '' });
    setAdding(false);
  };

  const applyTemplate = (idx: number) => {
    const t = TASK_TEMPLATES[idx];
    if (t) setNewTask((prev) => ({ ...prev, title: t.title, description: t.description }));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => setDraggingId(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetStatus: StudentTask['status']) => {
    e.preventDefault();
    setDraggingId(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) move(taskId, targetStatus);
  };

  const move = async (id: string, status: StudentTask['status']) => {
    const now = new Date().toISOString();
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status, updatedAt: now } : t)));
    await updateTaskStatus(id, status);
  };

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? '未指定';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">學員任務板</h1>
        <p className="text-muted-foreground font-body mt-1">以看板方式追蹤學員相關任務狀態。</p>
      </div>

      <Card className="card-pearl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">任務看板</CardTitle>
            <CardDescription className="font-body">拖曳任務卡到不同欄位，或點擊卡片切換狀態</CardDescription>
          </div>
          <Button onClick={() => setAdding(!adding)} variant="golden">
            {adding ? '取消' : '新增任務'}
          </Button>
        </CardHeader>
        {adding && (
          <CardContent className="border-t pt-4 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">從範本選擇</label>
              <Select onValueChange={(v) => v !== '_' && applyTemplate(Number(v))} value="_">
                <SelectTrigger className="w-full min-h-[44px]">
                  <SelectValue placeholder="選擇範本（可再修改）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">— 選擇範本 —</SelectItem>
                  {TASK_TEMPLATES.map((t, idx) => (
                    <SelectItem key={idx} value={String(idx)}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="任務標題"
              value={newTask.title}
              onChange={(e) => setNewTask((f) => ({ ...f, title: e.target.value }))}
              className="min-h-[44px]"
            />
            <Textarea
              placeholder="說明（選填）"
              value={newTask.description}
              onChange={(e) => setNewTask((f) => ({ ...f, description: e.target.value }))}
            />
            {students.length > 0 && (
              <Select value={newTask.studentId ? newTask.studentId : '_'} onValueChange={(v) => setNewTask((f) => ({ ...f, studentId: v === '_' ? '' : v }))}>
                <SelectTrigger className="w-full min-h-[44px]">
                  <SelectValue placeholder="選擇學員（選填）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">選擇學員（選填）</SelectItem>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">到期日（選填）</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask((f) => ({ ...f, dueDate: e.target.value }))}
                className="min-h-[44px]"
              />
            </div>
            <Button onClick={addTask} className="min-h-[44px] min-w-[44px]">新增</Button>
          </CardContent>
        )}
      </Card>

      {!loading && tasks.length === 0 ? (
        <EmptyState
          title="尚無任務"
          description="在上方新增第一筆任務，或從學員詳情頁為學員建立任務。"
          action={
            <Button variant="golden" onClick={() => setAdding(true)} className="min-h-[44px]">
              新增任務
            </Button>
          }
        />
      ) : (
      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className="rounded-xl border border-border bg-card p-4 min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <h3 className="font-display text-lg text-foreground mb-4">{col.label}</h3>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-muted-foreground text-sm">載入中…</p>
                ) : colTasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">無任務（可拖曳任務到此）</p>
                ) : (
                  colTasks.map((t) => {
                    const overdue = isOverdue(t);
                    return (
                      <Card
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onDragEnd={handleDragEnd}
                        className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow min-h-[44px] ${draggingId === t.id ? 'opacity-50' : ''} ${overdue ? 'border-amber-500/60 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                        onClick={() => {
                          if (draggingId) return;
                          const nextStatus = COLS[(COLS.findIndex((c) => c.key === col.key) + 1) % COLS.length]?.key ?? col.key;
                          move(t.id, nextStatus);
                        }}
                      >
                        <CardHeader className="py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="font-body text-sm">{t.title}</CardTitle>
                            {overdue && (
                              <Badge variant="destructive" className="text-xs">已逾期</Badge>
                            )}
                          </div>
                          {t.description && (
                            <CardContent className="p-0 pt-1 text-muted-foreground text-xs">
                              {t.description}
                            </CardContent>
                          )}
                          <p className="text-xs text-muted-foreground pt-1">
                            學員：<Link to={ADMIN_ROUTES.CRM_MEMBER(t.studentId)} className="hover:text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{getStudentName(t.studentId)}</Link>
                          </p>
                        </CardHeader>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
