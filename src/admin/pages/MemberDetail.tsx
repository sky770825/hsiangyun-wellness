import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { fetchMembers, updateMemberStatus, updateMemberNote, updateMemberContact, updateMemberTags } from '@/services/crm';
import { fetchTasks } from '@/services/tasks';
import { fetchBookings } from '@/services/booking';
import { fetchSessionNotes, createSessionNote, deleteSessionNote } from '@/services/session-notes';
import { ADMIN_ROUTES } from '@/config/routes';
import { PROGRESS_NOTE_TEMPLATES } from '../constants/progress-note-templates';
import { loadTagColors } from '../store';
import { DEFAULT_TAG_COLOR } from '../constants/tag-colors';
import type { CRMStudent } from '../types';
import type { StudentTask } from '../types';
import type { BookingSubmission } from '../types';
import type { SessionNote } from '../types';
import { ArrowLeft, CalendarCheck, Kanban, Mail, Phone, Copy, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const STATUS_MAP: Record<CRMStudent['status'], string> = {
  new: '新進',
  following: '跟進中',
  in_progress: '進行中',
  completed: '已完成',
  paused: '暫停',
};

const STATUS_BAR_HEX: Record<CRMStudent['status'], string> = {
  new: '#64748b',
  following: '#3b82f6',
  in_progress: '#22c55e',
  completed: '#16a34a',
  paused: '#94a3b8',
};

const TASK_STATUS_MAP: Record<StudentTask['status'], string> = {
  todo: '待處理',
  in_progress: '進行中',
  done: '已完成',
};

function formatDate(s: string | undefined) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return s;
  }
}

export default function AdminMemberDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<CRMStudent | null>(null);
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [sourceBooking, setSourceBooking] = useState<BookingSubmission | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [sessionForm, setSessionForm] = useState({ noteDate: new Date().toISOString().slice(0, 10), content: '' });
  const [tagColors] = useState<Record<string, string>>(() => loadTagColors());

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([fetchMembers(), fetchTasks(), fetchBookings()]).then(
      ([members, taskList, bookingList]) => {
        if (cancelled) return;
        const m = members.find((x) => x.id === memberId) ?? null;
        setMember(m);
        setTasks(taskList.filter((t) => t.studentId === memberId));
        const booking = m?.source === 'booking'
          ? bookingList.find((b) => b.email === m.email) ?? null
          : null;
        setSourceBooking(booking);
        setLoading(false);
      }
    );
    return () => { cancelled = true; };
  }, [memberId]);

  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    fetchSessionNotes(memberId).then((notes) => {
      if (!cancelled) setSessionNotes(notes);
    });
    return () => { cancelled = true; };
  }, [memberId]);

  const updateStatus = async (id: string, status: CRMStudent['status']) => {
    if (id !== member?.id) return;
    const now = new Date().toISOString();
    setMember((prev) => (prev ? { ...prev, status, updatedAt: now } : null));
    await updateMemberStatus(id, status);
  };

  const updateNote = async (id: string, progressNote: string) => {
    if (id !== member?.id) return;
    const now = new Date().toISOString();
    setMember((prev) => (prev ? { ...prev, progressNote, updatedAt: now } : null));
    await updateMemberNote(id, progressNote);
  };

  const updateContact = async (data: { preferredContactTime?: string; lineId?: string }) => {
    if (!member) return;
    const now = new Date().toISOString();
    setMember((prev) => (prev ? { ...prev, ...data, updatedAt: now } : null));
    await updateMemberContact(member.id, data);
  };

  const copyLineId = () => {
    if (!member?.lineId) return;
    navigator.clipboard.writeText(member.lineId);
    toast.success('已複製 Line ID');
  };

  const saveTags = async (tags: string[]) => {
    if (!member) return;
    setMember((prev) => (prev ? { ...prev, tags } : null));
    await updateMemberTags(member.id, tags);
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t || !member) return;
    const next = [...(member.tags ?? []), t];
    setNewTag('');
    saveTags(next);
  };

  const removeTag = (tag: string) => {
    if (!member) return;
    saveTags((member.tags ?? []).filter((x) => x !== tag));
  };

  const addSessionNote = async () => {
    if (!memberId || !sessionForm.content.trim()) return;
    const note = await createSessionNote(memberId, { noteDate: sessionForm.noteDate, content: sessionForm.content.trim() });
    setSessionNotes((prev) => [note, ...prev]);
    setSessionForm((f) => ({ ...f, content: '' }));
    toast.success('已新增諮詢紀錄');
  };

  const removeSessionNote = async (id: string) => {
    await deleteSessionNote(id);
    setSessionNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success('已刪除');
  };

  const insertProgressTemplate = (indexStr: string) => {
    if (!member) return;
    const idx = Number(indexStr);
    const template = PROGRESS_NOTE_TEMPLATES[idx];
    if (!template) return;
    const current = member.progressNote ?? '';
    const sep = current && !current.endsWith('\n') ? '\n' : '';
    const next = current + sep + template.text;
    setMember((prev) => (prev ? { ...prev, progressNote: next } : null));
    updateNote(member.id, next);
    toast.success('已插入範本');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground font-body">載入中…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground font-body">找不到該學員。</p>
        <Button variant="soft" asChild>
          <Link to={ADMIN_ROUTES.CRM}>返回學員列表</Link>
        </Button>
      </div>
    );
  }

  const tasksTodo = tasks.filter((t) => t.status !== 'done');
  const addTaskUrl = `${ADMIN_ROUTES.TASKS}?studentId=${member.id}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]" asChild>
          <Link to={ADMIN_ROUTES.CRM} aria-label="返回學員列表">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-2xl text-foreground">學員詳情</h1>
          <p className="text-muted-foreground font-body text-sm mt-0.5">{member.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          className="card-pearl border-l-4"
          style={{
            borderLeftColor: (member.tags ?? [])[0]
              ? (tagColors[(member.tags ?? [])[0]] ?? DEFAULT_TAG_COLOR)
              : STATUS_BAR_HEX[member.status],
          }}
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">基本資料</CardTitle>
            <CardDescription className="font-body">
            來源：{member.source === 'booking' ? '預約表單' : member.source === 'line' ? 'Line 官方帳號' : '手動新增'}
          </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={member.status} onValueChange={(v) => updateStatus(member.id, v as CRMStudent['status'])}>
                <SelectTrigger className="w-[140px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_MAP) as [CRMStudent['status'], string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-body">
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-primary hover:underline min-h-[44px] items-center">
                <Mail className="w-4 h-4 shrink-0" />
                {member.email}
              </a>
              {member.phone && (
                <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-primary hover:underline min-h-[44px] items-center">
                  <Phone className="w-4 h-4 shrink-0" />
                  {member.phone}
                </a>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">方便聯絡時段</Label>
              <Input
                placeholder="如週末上午、平日晚上"
                value={member.preferredContactTime ?? ''}
                onChange={(e) => setMember((prev) => (prev ? { ...prev, preferredContactTime: e.target.value } : null))}
                onBlur={(e) => updateContact({ preferredContactTime: e.target.value || undefined })}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Line ID</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="選填"
                  value={member.lineId ?? ''}
                  onChange={(e) => setMember((prev) => (prev ? { ...prev, lineId: e.target.value } : null))}
                  onBlur={(e) => updateContact({ lineId: e.target.value || undefined })}
                  className="min-h-[44px]"
                />
                {member.lineId && (
                  <Button type="button" variant="outline" size="icon" className="min-h-[44px] min-w-[44px]" onClick={copyLineId} aria-label="複製 Line ID">
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            {(member.lineUserId ?? member.lineDisplayName ?? member.linePictureUrl) && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <Label className="text-xs text-muted-foreground">Line OA 擷取資料</Label>
                {member.lineUserId && (
                  <p className="text-xs font-mono break-all">
                    <span className="text-muted-foreground">User ID：</span>
                    {member.lineUserId}
                  </p>
                )}
                {member.lineDisplayName && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">顯示名稱：</span>
                    {member.lineDisplayName}
                  </p>
                )}
                {member.linePictureUrl && (
                  <p className="text-xs break-all">
                    <span className="text-muted-foreground">大頭貼：</span>
                    <a href={member.linePictureUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {member.linePictureUrl}
                    </a>
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">標籤（分群用）</Label>
              <div className="flex flex-wrap gap-2">
                {(member.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full pl-2 pr-1 py-0.5 text-xs font-normal text-white"
                    style={{ backgroundColor: tagColors[tag] ?? DEFAULT_TAG_COLOR }}
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="rounded hover:bg-black/20 p-0.5" aria-label={`移除 ${tag}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex gap-1">
                  <Input
                    placeholder="新增標籤"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="h-8 w-24"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addTag}>新增</Button>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Label className="text-xs text-muted-foreground">進度備註</Label>
                <Select value="" onValueChange={insertProgressTemplate}>
                  <SelectTrigger className="w-[160px] h-8 text-xs" aria-label="插入備註範本">
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
                placeholder="記錄學員狀況…"
                value={member.progressNote ?? ''}
                onChange={(e) => updateNote(member.id, e.target.value)}
                className="mt-1 min-h-[100px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">更新於 {formatDate(member.updatedAt)}</p>
          </CardContent>
        </Card>

        {sourceBooking && (
          <Card className="card-pearl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-accent" />
                來源預約
              </CardTitle>
              <Button variant="soft" size="sm" className="min-h-[44px]" asChild>
                <Link to={ADMIN_ROUTES.BOOKINGS}>查看預約管理</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-body text-sm">
                <span className="text-muted-foreground">狀態：</span>
                <Badge variant="secondary" className="ml-2">{sourceBooking.status === 'pending' ? '待處理' : sourceBooking.status === 'contacted' ? '已聯繫' : sourceBooking.status === 'confirmed' ? '已確認' : '已取消'}</Badge>
              </p>
              {sourceBooking.message && (
                <p className="text-muted-foreground font-body text-sm whitespace-pre-wrap border-l-2 border-border pl-3">{sourceBooking.message}</p>
              )}
              <p className="text-xs text-muted-foreground">預約時間 {formatDate(sourceBooking.createdAt)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="card-pearl">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Kanban className="w-5 h-5 text-accent" />
              此學員的任務（{tasks.length} 筆）
            </CardTitle>
            <CardDescription className="font-body">未完成 {tasksTodo.length} 筆</CardDescription>
          </div>
          <Button variant="golden" className="min-h-[44px]" asChild>
            <Link to={addTaskUrl}>新增任務</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">尚無任務，可至學員任務板新增。</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id}>
                  <Link
                    to={ADMIN_ROUTES.TASKS}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors min-h-[44px]"
                  >
                    <span className="font-body">{t.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{TASK_STATUS_MAP[t.status]}</Badge>
                      {t.dueDate && (
                        <span className="text-xs text-muted-foreground">{formatDate(t.dueDate)}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            諮詢紀錄
          </CardTitle>
          <CardDescription className="font-body">每次諮詢重點與下次目標</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              value={sessionForm.noteDate}
              onChange={(e) => setSessionForm((f) => ({ ...f, noteDate: e.target.value }))}
              className="min-h-[44px] w-[160px]"
            />
            <Input
              placeholder="紀錄內容…"
              value={sessionForm.content}
              onChange={(e) => setSessionForm((f) => ({ ...f, content: e.target.value }))}
              className="min-h-[44px] flex-1 min-w-[200px]"
            />
            <Button onClick={addSessionNote} className="min-h-[44px]" disabled={!sessionForm.content.trim()}>
              新增
            </Button>
          </div>
          {sessionNotes.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">尚無諮詢紀錄</p>
          ) : (
            <ul className="space-y-2">
              {sessionNotes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDate(n.noteDate)}</p>
                    <p className="font-body text-sm whitespace-pre-wrap">{n.content}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 min-w-[44px] min-h-[44px]" onClick={() => removeSessionNote(n.id)} aria-label="刪除此筆">
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
