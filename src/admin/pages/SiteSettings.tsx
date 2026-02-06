import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '../ThemeProvider';
import { loadTagColors, saveTagColors, loadLineOAConfig, saveLineOAConfig, generateId } from '../store';
import { TAG_COLOR_PALETTE } from '../constants/tag-colors';
import type { SiteTheme, LineOAConfig, LineDefaultKeyword, LineFlexMenuItem, LineKeywordReplyType, LineFlexActionType } from '../types';
import { Tag, Trash2, MessageCircle } from 'lucide-react';

const FONT_OPTIONS = [
  { value: "'Cormorant Garamond', 'Noto Serif TC', serif", label: 'Cormorant Garamond + 思源宋體' },
  { value: "'Noto Serif TC', Georgia, serif", label: '思源宋體' },
  { value: "'Georgia', 'Noto Serif TC', serif", label: 'Georgia' },
];

const SIZE_OPTIONS = ['0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem'];

export default function SiteSettings() {
  const { theme, setTheme, resetTheme } = useTheme();
  const [tagColors, setTagColorsState] = useState<Record<string, string>>(() => loadTagColors());
  const [lineOA, setLineOAState] = useState<LineOAConfig>(() => loadLineOAConfig());

  useEffect(() => {
    saveTagColors(tagColors);
  }, [tagColors]);

  useEffect(() => {
    saveLineOAConfig(lineOA);
  }, [lineOA]);

  const update = (part: Partial<SiteTheme>) => {
    setTheme({ ...theme, ...part });
  };

  const setTagColor = (tagName: string, color: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    setTagColorsState((prev) => {
      const next = { ...prev };
      if (prev[trimmed] !== undefined) delete next[trimmed];
      next[trimmed] = color;
      return next;
    });
  };

  const removeTagColor = (tagName: string) => {
    setTagColorsState((prev) => {
      const next = { ...prev };
      delete next[tagName];
      return next;
    });
  };

  const addNewTagRow = () => {
    const keys = Object.keys(tagColors);
    let placeholder = '新標籤';
    let n = 1;
    while (keys.includes(placeholder)) {
      placeholder = `新標籤_${n}`;
      n += 1;
    }
    setTagColorsState((prev) => ({ ...prev, [placeholder]: TAG_COLOR_PALETTE[0] }));
  };

  const entries = Object.entries(tagColors);

  const setLineOA = (part: Partial<LineOAConfig>) => {
    setLineOAState((prev) => ({ ...prev, ...part }));
  };
  const updateDefaultKeyword = (id: string, patch: Partial<LineDefaultKeyword>) => {
    setLineOAState((prev) => ({
      ...prev,
      defaultKeywords: prev.defaultKeywords.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    }));
  };
  const addDefaultKeyword = () => {
    setLineOAState((prev) => ({
      ...prev,
      defaultKeywords: [
        ...prev.defaultKeywords,
        { id: generateId(), keyword: '', replyType: 'text', replyText: '' },
      ],
    }));
  };
  const removeDefaultKeyword = (id: string) => {
    setLineOAState((prev) => ({
      ...prev,
      defaultKeywords: prev.defaultKeywords.filter((k) => k.id !== id),
    }));
  };
  const updateFlexMenuItem = (id: string, patch: Partial<LineFlexMenuItem>) => {
    setLineOAState((prev) => ({
      ...prev,
      flexMenuItems: prev.flexMenuItems.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };
  const addFlexMenuItem = () => {
    setLineOAState((prev) => ({
      ...prev,
      flexMenuItems: [
        ...prev.flexMenuItems,
        { id: generateId(), label: '', actionType: 'message', actionData: '', order: (prev.flexMenuItems.length + 1) },
      ],
    }));
  };
  const removeFlexMenuItem = (id: string) => {
    setLineOAState((prev) => ({
      ...prev,
      flexMenuItems: prev.flexMenuItems.filter((m) => m.id !== id),
    }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl text-foreground">網站設定</h1>
        <p className="text-muted-foreground font-body mt-1">
          控制前台的字形、字體大小與顏色；標籤顏色用於 CRM 與行事曆辨識；Line OA 供後續串接與會員擷取。
        </p>
      </div>

      {/* Line 官方帳號 (OA) 設定與串接預留 */}
      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" />
            Line 官方帳號 (OA) 設定
          </CardTitle>
          <CardDescription className="font-body">
            預留 Line OA 串接：Channel ID / Secret、Webhook、預設關鍵字與 Flex Message 選單。會員從 Line 加入時可擷取 User ID、名稱等並寫入 CRM。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label className="font-body text-base">啟用 Line OA 功能</Label>
              <p className="text-sm text-muted-foreground">開啟後可填寫 Channel 與選單，實際串接由後端 Webhook 使用此設定。</p>
            </div>
            <Switch checked={lineOA.enabled} onCheckedChange={(v) => setLineOA({ enabled: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="space-y-2">
              <Label className="font-body">Channel ID</Label>
              <Input
                value={lineOA.channelId}
                onChange={(e) => setLineOA({ channelId: e.target.value })}
                placeholder="Line Developers 後台取得"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Channel Secret</Label>
              <Input
                type="password"
                value={lineOA.channelSecret}
                onChange={(e) => setLineOA({ channelSecret: e.target.value })}
                placeholder="請妥善保管，勿外洩"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Webhook URL（選填）</Label>
              <Input
                value={lineOA.webhookUrl ?? ''}
                onChange={(e) => setLineOA({ webhookUrl: e.target.value || undefined })}
                placeholder="https://your-api.com/webhook/line"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-medium">預設關鍵字</h4>
                <p className="text-xs text-muted-foreground">用戶輸入關鍵字時的回應（文字 / Flex / 無）</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDefaultKeyword}>新增一筆</Button>
            </div>
            <div className="space-y-3">
              {lineOA.defaultKeywords.map((k) => (
                <div key={k.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-border p-3">
                  <Input
                    value={k.keyword}
                    onChange={(e) => updateDefaultKeyword(k.id, { keyword: e.target.value })}
                    placeholder="關鍵字（可多個以逗號分隔）"
                    className="flex-1 min-w-[140px]"
                  />
                  <Select value={k.replyType} onValueChange={(v) => updateDefaultKeyword(k.id, { replyType: v as LineKeywordReplyType })}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">文字回覆</SelectItem>
                      <SelectItem value="flex">Flex Message</SelectItem>
                      <SelectItem value="none">不回應</SelectItem>
                    </SelectContent>
                  </Select>
                  {k.replyType === 'text' && (
                    <Input
                      value={k.replyText ?? ''}
                      onChange={(e) => updateDefaultKeyword(k.id, { replyText: e.target.value })}
                      placeholder="回覆內容"
                      className="flex-1 min-w-[160px]"
                    />
                  )}
                  {k.replyType === 'flex' && (
                    <Input
                      value={k.flexTemplateId ?? ''}
                      onChange={(e) => updateDefaultKeyword(k.id, { flexTemplateId: e.target.value })}
                      placeholder="Flex 範本 ID 或路徑"
                      className="flex-1 min-w-[160px]"
                    />
                  )}
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDefaultKeyword(k.id)} aria-label="刪除">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-medium">Flex Message 選單</h4>
                <p className="text-xs text-muted-foreground">選單項目：訊息 / 網址 / Postback</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFlexMenuItem}>新增一筆</Button>
            </div>
            <div className="space-y-3">
              {lineOA.flexMenuItems.map((m, idx) => (
                <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                  <Input
                    value={m.label}
                    onChange={(e) => updateFlexMenuItem(m.id, { label: e.target.value })}
                    placeholder="顯示標題"
                    className="w-32"
                  />
                  <Select value={m.actionType} onValueChange={(v) => updateFlexMenuItem(m.id, { actionType: v as LineFlexActionType })}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="message">發送訊息</SelectItem>
                      <SelectItem value="uri">開啟網址</SelectItem>
                      <SelectItem value="postback">Postback</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={m.actionData}
                    onChange={(e) => updateFlexMenuItem(m.id, { actionData: e.target.value })}
                    placeholder={m.actionType === 'uri' ? 'https://...' : '內容或 data'}
                    className="flex-1 min-w-[120px]"
                  />
                  <span className="text-xs text-muted-foreground w-8">#{idx + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFlexMenuItem(m.id)} aria-label="刪除">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" />
            標籤與顏色（可自訂）
          </CardTitle>
          <CardDescription className="font-body">
            為學員標籤設定顏色，CRM 列表與行事曆會依此顯示，方便辨識。新增或編輯標籤名稱、點選色塊即可更換顏色。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {TAG_COLOR_PALETTE.map((hex) => (
              <div
                key={hex}
                className="w-8 h-8 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
          <div className="space-y-3">
            {entries.map(([tagName, color]) => (
              <div key={tagName} className="flex flex-wrap items-center gap-2">
                <Input
                  value={tagName}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const newName = raw.trim();
                    if (newName !== tagName) {
                      setTagColorsState((prev) => {
                        const next = { ...prev };
                        delete next[tagName];
                        if (newName) next[newName] = color;
                        return next;
                      });
                    }
                  }}
                  placeholder="標籤名稱"
                  className="w-32 font-body"
                />
                <div className="flex items-center gap-1">
                  {TAG_COLOR_PALETTE.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: hex,
                        borderColor: color === hex ? 'var(--primary)' : 'transparent',
                      }}
                      onClick={() => setTagColor(tagName, hex)}
                      title={hex}
                    />
                  ))}
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeTagColor(tagName)} aria-label="移除">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={addNewTagRow} className="min-h-[44px]">
            新增標籤顏色
          </Button>
        </CardContent>
      </Card>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl">字形</CardTitle>
          <CardDescription className="font-body">
            標題與內文使用的字體（可輸入 CSS font-family 值）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body">標題字體 (font-display)</Label>
            <Input
              value={theme.fontDisplay}
              onChange={(e) => update({ fontDisplay: e.target.value })}
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body">內文字體 (font-body)</Label>
            <Input
              value={theme.fontBody}
              onChange={(e) => update({ fontBody: e.target.value })}
              className="font-body"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FONT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  update({ fontDisplay: opt.value, fontBody: opt.value });
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl">字體大小</CardTitle>
          <CardDescription className="font-body">基礎字級與標題字級</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body">內文基礎字級</Label>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <Button
                  key={size}
                  variant={theme.fontSizeBase === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => update({ fontSizeBase: size })}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-body">標題字級</Label>
            <Input
              value={theme.fontSizeHeading}
              onChange={(e) => update({ fontSizeHeading: e.target.value })}
              placeholder="例如 1.25rem"
              className="font-body"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl">主色系（HSL 數值）</CardTitle>
          <CardDescription className="font-body">
            格式：色相 飽和% 明度%，例如 350 100% 97%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'colorBackground' as const, label: '背景' },
            { key: 'colorForeground' as const, label: '前景/文字' },
            { key: 'colorPrimary' as const, label: '主色' },
            { key: 'colorSecondary' as const, label: '次要色' },
            { key: 'colorAccent' as const, label: '強調色' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label className="font-body">{label}</Label>
              <Input
                value={theme[key]}
                onChange={(e) => update({ [key]: e.target.value })}
                className="font-body"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={resetTheme}>
          還原預設主題
        </Button>
      </div>
    </div>
  );
}
