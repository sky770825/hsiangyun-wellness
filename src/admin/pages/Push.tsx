import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadPushMessages, savePushMessages, generateId } from '../store';
import type { PushMessage } from '../types';

const STATUS_MAP: Record<PushMessage['status'], string> = {
  draft: '草稿',
  scheduled: '已排程',
  sent: '已發送',
};

export default function AdminPush() {
  const [messages, setMessages] = useState<PushMessage[]>(() => loadPushMessages());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '' });

  const createDraft = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const msg: PushMessage = {
      id: generateId(),
      title: form.title.trim(),
      body: form.body.trim(),
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const next = [msg, ...messages];
    setMessages(next);
    savePushMessages(next);
    setForm({ title: '', body: '' });
    setShowForm(false);
  };

  const send = (id: string) => {
    const now = new Date().toISOString();
    const next = messages.map((m) =>
      m.id === id ? { ...m, status: 'sent' as const, sentAt: now, updatedAt: now } : m,
    );
    setMessages(next);
    savePushMessages(next);
    // 實際推播需接 Firebase / OneSignal 等服務
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">推播發送</h1>
        <p className="text-muted-foreground font-body mt-1">新建推播訊息並發送；實際發送需接推播服務（如 Firebase、OneSignal）。</p>
      </div>

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
            <Button onClick={createDraft}>存為草稿</Button>
          </CardContent>
        )}
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">尚無推播，請新建。</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-display text-foreground">{m.title}</p>
                  <p className="text-muted-foreground font-body text-sm line-clamp-2">{m.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">{m.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{STATUS_MAP[m.status]}</Badge>
                  {m.status === 'draft' && (
                    <Button size="sm" variant="golden" onClick={() => send(m.id)}>
                      發送
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
