import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadPushMessages, savePushMessages, generateId } from '../store';
import { toast } from 'sonner';
import { fetchMembers } from '@/services/crm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { EmptyState } from '../components/EmptyState';
import type { PushMessage, PushAudienceFilter } from '../types';
import type { CRMStudent } from '../types';

const STATUS_MAP: Record<PushMessage['status'], string> = {
  draft: '草稿',
  scheduled: '已排程',
  sent: '已發送',
};

const AUDIENCE_STATUS_LABEL: Record<CRMStudent['status'], string> = {
  new: '新進',
  following: '跟進中',
  in_progress: '進行中',
  completed: '已完成',
  paused: '暫停',
};

const AUDIENCE_FILTER_OPTIONS: { value: PushAudienceFilter; label: string }[] = [
  { value: 'all', label: '全部學員' },
  { value: 'active', label: '進行中＋跟進中' },
  { value: 'new', label: '僅新進' },
  { value: 'following', label: '僅跟進中' },
  { value: 'in_progress', label: '僅進行中' },
  { value: 'completed', label: '僅已完成' },
  { value: 'paused', label: '僅暫停' },
];

export default function AdminPush() {
  const [messages, setMessages] = useState<PushMessage[]>(() => loadPushMessages());
  const [members, setMembers] = useState<CRMStudent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audienceFilter: 'all' as PushAudienceFilter });
  const [sendTargetId, setSendTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers().then(setMembers);
  }, []);

  const audienceByStatus = (status: CRMStudent['status']) => members.filter((m) => m.status === status).length;
  const activeAudience = audienceByStatus('following') + audienceByStatus('in_progress');

  const getAudienceCount = (filter: PushAudienceFilter): number => {
    if (filter === 'all') return members.length;
    if (filter === 'active') return audienceByStatus('following') + audienceByStatus('in_progress');
    if (filter === 'new' || filter === 'following' || filter === 'in_progress' || filter === 'completed' || filter === 'paused') {
      return audienceByStatus(filter);
    }
    return members.length;
  };

  const createDraft = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const msg: PushMessage = {
      id: generateId(),
      title: form.title.trim(),
      body: form.body.trim(),
      status: 'draft',
      audienceFilter: form.audienceFilter,
      createdAt: now,
      updatedAt: now,
    };
    const next = [msg, ...messages];
    setMessages(next);
    savePushMessages(next);
    setForm({ title: '', body: '', audienceFilter: 'all' });
    setShowForm(false);
  };

  const send = (id: string) => {
    const msg = messages.find((m) => m.id === id);
    const filter = msg?.audienceFilter ?? 'all';
    const count = getAudienceCount(filter);
    const now = new Date().toISOString();
    const next = messages.map((m) =>
      m.id === id ? { ...m, status: 'sent' as const, sentAt: now, updatedAt: now } : m,
    );
    setMessages(next);
    savePushMessages(next);
    const label = AUDIENCE_FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? '全部學員';
    toast.success(`已標記為已發送（對象：${label}，共 ${count} 人）`);
    setSendTargetId(null);
  };

  const sendTarget = sendTargetId ? messages.find((m) => m.id === sendTargetId) : null;
  const sendTargetAudience = sendTarget ? getAudienceCount(sendTarget.audienceFilter ?? 'all') : 0;
  const sendTargetLabel = sendTarget ? AUDIENCE_FILTER_OPTIONS.find((o) => o.value === (sendTarget.audienceFilter ?? 'all'))?.label ?? '全部學員' : '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">推播發送</h1>
        <p className="text-muted-foreground font-body mt-1">新建推播訊息並發送；實際發送需接推播服務（如 Firebase、OneSignal）。</p>
      </div>

      {members.length > 0 && (
        <Card className="card-pearl">
          <CardHeader>
            <CardTitle className="font-display text-lg">發送對象預覽</CardTitle>
            <CardDescription className="font-body">依學員狀態篩選；發送時可僅選擇部分對象（接推播服務後實作）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-3 text-sm font-body">
              {(Object.entries(AUDIENCE_STATUS_LABEL) as [CRMStudent['status'], string][]).map(([status, label]) => (
                <span key={status}>
                  <span className="text-muted-foreground">{label}</span>{' '}
                  <strong>{audienceByStatus(status)}</strong> 人
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              建議發送對象（進行中＋跟進中）：共 <strong>{activeAudience}</strong> 人
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="card-pearl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl">推播列表</CardTitle>
            <CardDescription className="font-body">建立草稿後可排程或立即發送</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="golden">
            {showForm ? '取消' : '新建推播'}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent className="border-t pt-4 space-y-3">
            <Input
              placeholder="標題"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="內文"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">發送對象（接推播服務時使用）</label>
              <Select value={form.audienceFilter} onValueChange={(v) => setForm((f) => ({ ...f, audienceFilter: v as PushAudienceFilter }))}>
                <SelectTrigger className="w-full max-w-[240px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}（{getAudienceCount(o.value)} 人）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createDraft} className="min-h-[44px]">存為草稿</Button>
          </CardContent>
        )}
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <EmptyState
              title="尚無推播"
              description="建立第一則推播訊息，存為草稿後可選擇發送對象並發送。"
              action={
                <Button variant="golden" onClick={() => setShowForm(true)} className="min-h-[44px]">
                  新建推播
                </Button>
              }
            />
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-display text-foreground">{m.title}</p>
                  <p className="text-muted-foreground font-body text-sm line-clamp-2">{m.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {m.createdAt}
                    {m.audienceFilter && m.audienceFilter !== 'all' && (
                      <span className="ml-2">· 對象：{AUDIENCE_FILTER_OPTIONS.find((o) => o.value === m.audienceFilter)?.label}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{STATUS_MAP[m.status]}</Badge>
                  {m.status === 'draft' && (
                    <Button size="sm" variant="golden" onClick={() => setSendTargetId(m.id)}>
                      發送
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!sendTargetId} onOpenChange={(open) => !open && setSendTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要發送此推播？</AlertDialogTitle>
            <AlertDialogDescription>
              {sendTarget && (
                <>
                  推播標題：{sendTarget.title}
                  <br />
                  發送對象：{sendTargetLabel}，共 {sendTargetAudience} 人。
                  <br />
                  實際推播需接 Firebase / OneSignal 等服務，目前僅會標記為已發送。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => sendTargetId && send(sendTargetId)}>確定發送</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
