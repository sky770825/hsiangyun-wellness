import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchMembers, createMember, updateMemberStatus, updateMemberNote } from '@/services/crm';
import { fetchBookings } from '@/services/booking';
import { ADMIN_ROUTES } from '@/config/routes';
import { PROGRESS_NOTE_TEMPLATES } from '../constants/progress-note-templates';
import { EmptyState } from '../components/EmptyState';
import { loadTagColors } from '../store';
import { DEFAULT_TAG_COLOR } from '../constants/tag-colors';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CRMStudent } from '../types';
import { LayoutGrid, List, Rows3 } from 'lucide-react';

const STATUS_MAP: Record<CRMStudent['status'], string> = {
  new: '新進',
  following: '跟進中',
  in_progress: '進行中',
  completed: '已完成',
  paused: '暫停',
};

const STATUS_BADGE_CLASS: Record<CRMStudent['status'], string> = {
  new: 'border-slate-500/60 bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-200',
  following: 'border-blue-500/60 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  in_progress: 'border-green-500/60 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  completed: 'border-green-600/60 bg-green-200/80 text-green-900 dark:bg-green-800/40 dark:text-green-100',
  paused: 'border-muted bg-muted text-muted-foreground',
};

/** 學員卡左側色條（無標籤時依狀態） */
const STATUS_BAR_HEX: Record<CRMStudent['status'], string> = {
  new: '#64748b',
  following: '#3b82f6',
  in_progress: '#22c55e',
  completed: '#16a34a',
  paused: '#94a3b8',
};

export default function AdminCRM() {
  const [students, setStudents] = useState<CRMStudent[]>([]);
  const [bookings, setBookings] = useState<{ id: string; name: string; email: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', preferredContactTime: '', lineId: '' });
  const [filterTag, setFilterTag] = useState<string>('all');
  const [tagColors, setTagColors] = useState<Record<string, string>>(() => loadTagColors());
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'compact'>('cards');

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMembers(), fetchBookings()]).then(([members, bookingList]) => {
      if (!cancelled) {
        setStudents(members);
        setBookings(bookingList.map((b) => ({ id: b.id, name: b.name, email: b.email, status: b.status })));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const addFromBooking = async (b: { name: string; email: string }) => {
    if (students.some((s) => s.email === b.email)) return;
    const next = await createMember({
      name: b.name,
      email: b.email,
      source: 'booking',
      status: 'new',
    });
    setStudents((prev) => [next, ...prev]);
  };

  const addManual = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const next = await createMember({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      preferredContactTime: form.preferredContactTime.trim() || undefined,
      lineId: form.lineId.trim() || undefined,
      source: 'manual',
      status: 'new',
    });
    setStudents((prev) => [next, ...prev]);
    setForm({ name: '', email: '', phone: '', preferredContactTime: '', lineId: '' });
    setShowForm(false);
  };

  const updateStatus = async (id: string, status: CRMStudent['status']) => {
    const now = new Date().toISOString();
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status, updatedAt: now } : s)));
    await updateMemberStatus(id, status);
  };

  const updateNote = async (id: string, progressNote: string) => {
    const now = new Date().toISOString();
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, progressNote, updatedAt: now } : s)));
    await updateMemberNote(id, progressNote);
  };

  const insertNoteTemplate = (studentId: string, indexStr: string) => {
    const s = students.find((x) => x.id === studentId);
    if (!s) return;
    const idx = Number(indexStr);
    const template = PROGRESS_NOTE_TEMPLATES[idx];
    if (!template) return;
    const current = s.progressNote ?? '';
    const sep = current && !current.endsWith('\n') ? '\n' : '';
    updateNote(studentId, current + sep + template.text);
  };

  const pendingBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && !students.some((s) => s.email === b.email)
  );

  const allTags = Array.from(new Set(students.flatMap((s) => s.tags ?? []))).sort();
  const filteredStudents = filterTag === 'all'
    ? students
    : students.filter((s) => (s.tags ?? []).includes(filterTag));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">CRM 學員</h1>
        <p className="text-muted-foreground font-body mt-1">追蹤學員進度，填寫表單後可在此記錄狀態與備註。</p>
      </div>

      {!loading && pendingBookings.length > 0 && (
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-xl">從預約轉入</CardTitle>
            <CardDescription className="font-body">將預約轉為學員以便追蹤</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-body">{b.name} · {b.email}</span>
                <Button size="sm" variant="soft" onClick={() => addFromBooking(b)} className="min-h-[44px]">
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
            <CardDescription className="font-body">可切換卡片／表格／精簡檢視；依標籤篩選；狀態與備註可在此維護</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded ${viewMode === 'cards' ? 'bg-secondary' : 'hover:bg-muted'}`}
                title="卡片（含備註）"
                aria-label="卡片檢視"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-secondary' : 'hover:bg-muted'}`}
                title="表格"
                aria-label="表格檢視"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded ${viewMode === 'compact' ? 'bg-secondary' : 'hover:bg-muted'}`}
                title="精簡列表"
                aria-label="精簡檢視"
              >
                <Rows3 className="w-4 h-4" />
              </button>
            </div>
            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[130px] min-h-[44px]">
                  <SelectValue placeholder="依標籤" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部學員</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setShowForm(!showForm)} variant="golden" className="min-h-[44px] min-w-[44px]">
              {showForm ? '取消' : '新增學員'}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="border-t pt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="min-h-[44px]" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="min-h-[44px]" />
              </div>
              <div className="space-y-2">
                <Label>電話（選填）</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="min-h-[44px]" />
              </div>
              <div className="space-y-2">
                <Label>方便聯絡時段（選填）</Label>
                <Input placeholder="如週末上午、平日晚上" value={form.preferredContactTime} onChange={(e) => setForm((f) => ({ ...f, preferredContactTime: e.target.value }))} className="min-h-[44px]" />
              </div>
              <div className="space-y-2">
                <Label>Line ID（選填）</Label>
                <Input placeholder="Line 帳號或 ID" value={form.lineId} onChange={(e) => setForm((f) => ({ ...f, lineId: e.target.value }))} className="min-h-[44px]" />
              </div>
            </div>
            <Button onClick={addManual} className="min-h-[44px]">儲存</Button>
          </CardContent>
        )}
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">載入中…</p>
          ) : filteredStudents.length === 0 ? (
            students.length === 0 ? (
              <EmptyState
                title="尚無學員"
                description="可從預約管理將預約轉入學員，或在此手動新增學員。"
                action={
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Link to={ADMIN_ROUTES.BOOKINGS}>
                      <Button variant="outline" className="min-h-[44px]">前往預約管理</Button>
                    </Link>
                    <Button variant="golden" onClick={() => setShowForm(true)} className="min-h-[44px]">新增學員</Button>
                  </div>
                }
              />
            ) : (
              <p className="text-muted-foreground font-body text-sm">沒有符合標籤的學員，可調整上方標籤篩選。</p>
            )
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>標籤</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>更新日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link to={ADMIN_ROUTES.CRM_MEMBER(s.id)} className="text-primary hover:underline">
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_BADGE_CLASS[s.status]}>{STATUS_MAP[s.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(s.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-normal text-white"
                            style={{ backgroundColor: tagColors[tag] ?? DEFAULT_TAG_COLOR }}
                          >
                            {tag}
                          </span>
                        ))}
                        {(s.tags ?? []).length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as CRMStudent['status'])}>
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(STATUS_MAP) as [CRMStudent['status'], string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={ADMIN_ROUTES.CRM_MEMBER(s.id)}>詳情</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : viewMode === 'compact' ? (
            <div className="space-y-1">
              {filteredStudents.map((s) => {
                const firstTag = (s.tags ?? [])[0];
                const barColor = firstTag ? (tagColors[firstTag] ?? DEFAULT_TAG_COLOR) : STATUS_BAR_HEX[s.status];
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border border-l-4 py-2 px-3"
                    style={{ borderLeftColor: barColor }}
                  >
                    <Link
                      to={ADMIN_ROUTES.CRM_MEMBER(s.id)}
                      className="font-medium text-primary hover:underline min-w-0 truncate"
                    >
                      {s.name}
                    </Link>
                    <Badge variant="outline" className={STATUS_BADGE_CLASS[s.status]}>{STATUS_MAP[s.status]}</Badge>
                    <div className="flex flex-wrap gap-1">
                      {(s.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full px-2 py-0.5 text-xs text-white"
                          style={{ backgroundColor: tagColors[tag] ?? DEFAULT_TAG_COLOR }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-muted-foreground text-xs truncate flex-1 min-w-0">{s.email}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={ADMIN_ROUTES.CRM_MEMBER(s.id)}>進入</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            filteredStudents.map((s) => {
              const firstTag = (s.tags ?? [])[0];
              const barColor = firstTag ? (tagColors[firstTag] ?? DEFAULT_TAG_COLOR) : STATUS_BAR_HEX[s.status];
              return (
              <div
                key={s.id}
                className="rounded-xl border border-border p-4 space-y-3 border-l-4"
                style={{ borderLeftColor: barColor }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={ADMIN_ROUTES.CRM_MEMBER(s.id)}
                        className="font-display text-foreground hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded min-h-[44px] inline-flex items-center"
                      >
                        {s.name}
                      </Link>
                      <Badge variant="outline" className={STATUS_BADGE_CLASS[s.status]}>{STATUS_MAP[s.status]}</Badge>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">
                    {s.email}
                    {s.phone && ` · ${s.phone}`}
                    {(s.preferredContactTime || s.lineId) && (
                      <span className="block text-xs mt-0.5">
                        {s.preferredContactTime && `聯絡時段：${s.preferredContactTime}`}
                        {s.preferredContactTime && s.lineId && ' · '}
                        {s.lineId && `Line: ${s.lineId}`}
                      </span>
                    )}
                    {(s.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(s.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-normal text-white"
                            style={{ backgroundColor: tagColors[tag] ?? DEFAULT_TAG_COLOR }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </p>
                  </div>
                  <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as CRMStudent['status'])}>
                    <SelectTrigger className="w-28 min-h-[44px]">
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
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Label className="text-xs text-muted-foreground">進度備註</Label>
                    <Select value="" onValueChange={(v) => insertNoteTemplate(s.id, v)}>
                      <SelectTrigger className="w-[140px] h-7 text-xs" aria-label="插入備註範本">
                        <SelectValue placeholder="插入範本" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRESS_NOTE_TEMPLATES.map((t, idx) => (
                          <SelectItem key={idx} value={String(idx)}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="記錄學員狀況..."
                    value={s.progressNote ?? ''}
                    onChange={(e) => updateNote(s.id, e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">來源：{s.source === 'booking' ? '預約表單' : s.source === 'line' ? 'Line 官方帳號' : '手動新增'} · 更新於 {s.updatedAt}</p>
              </div>
            );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
