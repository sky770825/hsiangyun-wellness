import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { loadMedia, saveMedia, generateId } from '../store';
import type { MediaItem } from '../types';
import { EmptyState } from '../components/EmptyState';
import { SafeImage } from '@/components/SafeImage';

type Usage = 'hero' | 'profile' | 'petal' | 'other';

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>(() => loadMedia());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newItems: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newItems.push({
        id: generateId(),
        name: file.name,
        url,
        usage: 'other',
        createdAt: new Date().toISOString(),
      });
    }
    const next = [...newItems, ...items];
    setItems(next);
    saveMedia(next);
    e.target.value = '';
  };

  const updateUsage = (id: string, usage: Usage) => {
    const next = items.map((m) => (m.id === id ? { ...m, usage } : m));
    setItems(next);
    saveMedia(next);
  };

  const remove = (id: string) => {
    const found = items.find((m) => m.id === id);
    if (!found) return;
    setDeleteTarget(found);
  };

  const confirmRemove = () => {
    if (!deleteTarget) return;
    const next = items.filter((m) => m.id !== deleteTarget.id);
    if (deleteTarget.url?.startsWith('blob:')) URL.revokeObjectURL(deleteTarget.url);
    setItems(next);
    saveMedia(next);
    setDeleteTarget(null);
    toast.success('已刪除');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">媒體庫</h1>
        <p className="text-muted-foreground font-body mt-1">上傳與管理圖片，可指定用途（如首頁 Hero、形象照）。</p>
      </div>

      <Card className="card-pearl">
        <CardHeader>
          <CardTitle className="font-display text-xl">上傳圖片</CardTitle>
          <CardDescription className="font-body">
            目前儲存於瀏覽器本地，之後接 Supabase Storage 可改為雲端儲存。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFile}
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="golden">
            選擇檔案上傳
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display text-xl text-foreground mb-4">已上傳項目</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="card-pearl overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <SafeImage
                  src={item.url}
                  alt={item.alt || item.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <CardHeader className="py-3">
                <CardTitle className="font-body text-sm truncate">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground shrink-0">用途</Label>
                  <Select
                    value={item.usage || 'other'}
                    onValueChange={(v) => updateUsage(item.id, v as Usage)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">首頁 Hero</SelectItem>
                      <SelectItem value="profile">形象照</SelectItem>
                      <SelectItem value="petal">裝飾圖</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => remove(item.id)}
                  aria-label={`刪除 ${item.name}`}
                >
                  刪除
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {items.length === 0 && (
          <EmptyState
            title="尚無圖片"
            description="點擊「選擇檔案上傳」加入第一張圖片。"
            action={
              <Button variant="golden" onClick={() => fileInputRef.current?.click()}>
                選擇檔案上傳
              </Button>
            }
          />
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除這張圖片嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground">
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
