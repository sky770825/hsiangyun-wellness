import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '../ThemeProvider';
import type { SiteTheme } from '../types';

const FONT_OPTIONS = [
  { value: "'Cormorant Garamond', 'Noto Serif TC', serif", label: 'Cormorant Garamond + 思源宋體' },
  { value: "'Noto Serif TC', Georgia, serif", label: '思源宋體' },
  { value: "'Georgia', 'Noto Serif TC', serif", label: 'Georgia' },
];

const SIZE_OPTIONS = ['0.875rem', '1rem', '1.125rem', '1.25rem', '1.5rem'];

export default function SiteSettings() {
  const { theme, setTheme, resetTheme } = useTheme();

  const update = (part: Partial<SiteTheme>) => {
    setTheme({ ...theme, ...part });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl text-foreground">網站設定</h1>
        <p className="text-muted-foreground font-body mt-1">
          控制前台的字形、字體大小與顏色，修改後即時套用。
        </p>
      </div>

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
