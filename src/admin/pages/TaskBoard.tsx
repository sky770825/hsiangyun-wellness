import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { loadTasks, saveTasks, loadCRM, generateId } from '../store';
import type { StudentTask } from '../types';

const COLS: { key: StudentTask['status']; label: string }[] = [
  { key: 'todo', label: '待處理' },
  { key: 'in_progress', label: '進行中' },
  { key: 'done', label: '已完成' },
];

export default function AdminTaskBoard() {
  const [tasks, setTasks] = useState<StudentTask[]>(() => loadTasks());
  const students = loadCRM();
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', studentId: '' });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const now = new Date().toISOString();
    const studentId = newTask.studentId || students[0]?.id;
    const task: StudentTask = {
      id: generateId(),
      studentId: studentId || '',
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      status: 'todo',
      createdAt: now,
      updatedAt: now,
    };
    setTasks([...tasks, task]);
    saveTasks([...tasks, task]);
    setNewTask({ title: '', description: '', studentId: '' });
    setAdding(false);
  };

  const move = (id: string, status: StudentTask['status']) => {
    const now = new Date().toISOString();
    const next = tasks.map((t) => (t.id === id ? { ...t, status, updatedAt: now } : t));
    setTasks(next);
    saveTasks(next);
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
            <CardDescription className="font-body">拖曳或點選可變更狀態（目前為點選切換）</CardDescription>
          </div>
          <Button onClick={() => setAdding(!adding)} variant="golden">
            {adding ? '取消' : '新增任務'}
          </Button>
        </CardHeader>
        {adding && (
          <CardContent className="border-t pt-4 space-y-3">
            <Input
              placeholder="任務標題"
              value={newTask.title}
              onChange={(e) => setNewTask((f) => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="說明（選填）"
              value={newTask.description}
              onChange={(e) => setNewTask((f) => ({ ...f, description: e.target.value }))}
            />
            {students.length > 0 && (
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newTask.studentId}
                onChange={(e) => setNewTask((f) => ({ ...f, studentId: e.target.value }))}
              >
                <option value="">選擇學員（選填）</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            <Button onClick={addTask}>新增</Button>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-lg text-foreground mb-4">{col.label}</h3>
              <div className="space-y-3">
                {colTasks.map((t) => (
                  <Card
                    key={t.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      const nextStatus = COLS[(COLS.findIndex((c) => c.key === col.key) + 1) % COLS.length]?.key ?? col.key;
                      move(t.id, nextStatus);
                    }}
                  >
                    <CardHeader className="py-3">
                      <CardTitle className="font-body text-sm">{t.title}</CardTitle>
                      {t.description && (
                        <CardContent className="p-0 pt-1 text-muted-foreground text-xs">
                          {t.description}
                        </CardContent>
                      )}
                      <p className="text-xs text-muted-foreground pt-1">學員：{getStudentName(t.studentId)}</p>
                    </CardHeader>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-muted-foreground text-sm">無任務</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
