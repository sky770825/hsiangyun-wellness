import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { loadCRM, saveCRM, loadBookings, generateId } from '../store';
import type { CRMStudent } from '../types';

const STATUS_MAP: Record<CRMStudent['status'], string> = {
  new: '新進',
  following: '跟進中',
  in_progress: '進行中',
  completed: '已完成',
  paused: '暫停',
};

export default function AdminCRM() {
  const [students, setStudents] = useState<CRMStudent[]>(() => loadCRM());
  const [bookings] = useState(() => loadBookings());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const addFromBooking = (b: { name: string; email: string }) => {
    if (students.some((s) => s.email === b.email)) return;
    const now = new Date().toISOString();
    const next: CRMStudent = {
      id: generateId(),
      name: b.name,
      email: b.email,
      source: 'booking',
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };
    const list = [next, ...students];
    setStudents(list);
    saveCRM(list);
  };

  const addManual = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const now = new Date().toISOString();
    const next: CRMStudent = {
      id: generateId(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      source: 'manual',
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };
    const list = [next, ...students];
    setStudents(list);
    saveCRM(list);
    setForm({ name: '', email: '', phone: '' });
    setShowForm(false);
  };

  const updateStatus = (id: string, status: CRMStudent['status']) => {
    const now = new Date().toISOString();
    const next = students.map((s) => (s.id === id ? { ...s, status, updatedAt: now } : s));
    setStudents(next);
    saveCRM(next);
  };

  const updateNote = (id: string, progressNote: string) => {
    const now = new Date().toISOString();
    const next = students.map((s) => (s.id === id ? { ...s, progressNote, updatedAt: now } : s));
    setStudents(next);
    saveCRM(next);
  };

  const pendingBookings = bookings.filter((b) => b.status !== 'cancelled' && !students.some((s) => s.email === b.email));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">CRM 學員</h1>
        <p className="text-muted-foreground font-body mt-1">追蹤學員進度，填寫表單後可在此記錄狀態與備註。</p>
      </div>

      {pendingBookings.length > 0 && (
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-xl">從預約轉入</CardTitle>
            <CardDescription className="font-body">將預約轉為學員以便追蹤</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-body">{b.name} · {b.email}</span>
                <Button size="sm" variant="soft" onClick={() => addFromBooking(b)}>
                  加入學員
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="card-pearl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">學員列表</CardTitle>
            <CardDescription className="font-body">狀態與進度備註可在此維護</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="golden">
            {showForm ? '取消' : '新增學員'}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="border-t pt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>電話（選填）</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <Button onClick={addManual}>儲存</Button>
          </CardContent>
        )}
        <CardContent className="space-y-4">
          {students.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">尚無學員，請從預約轉入或手動新增。</p>
          ) : (
            students.map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-foreground">{s.name}</p>
                    <p className="text-muted-foreground font-body text-sm">{s.email} {s.phone && ` · ${s.phone}`}</p>
                  </div>
                  <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as CRMStudent['status'])}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(STATUS_MAP) as [CRMStudent['status'], string][]).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">進度備註</Label>
                  <Textarea
                    placeholder="記錄學員狀況..."
                    value={s.progressNote ?? ''}
                    onChange={(e) => updateNote(s.id, e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">來源：{s.source === 'booking' ? '預約表單' : '手動新增'} · 更新於 {s.updatedAt}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
