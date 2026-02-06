/**
 * 媒體庫服務：有 Supabase 時讀寫 hsiangyun_media，否則使用 localStorage store
 */
import { hasSupabase } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase';
import { getTableName } from '@/config/supabase-naming';
import type { MediaItem } from '@/admin/types';
import * as store from '@/admin/store';

function rowToMedia(row: Record<string, unknown>): MediaItem {
  return {
    id: String(row.id),
    name: String(row.name),
    url: String(row.url),
    alt: row.alt != null ? String(row.alt) : undefined,
    usage: (row.usage as MediaItem['usage']) ?? undefined,
    createdAt: String(row.created_at),
  };
}

export async function fetchMedia(): Promise<MediaItem[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (!supabase) return store.loadMedia();
    const table = getTableName('MEDIA');
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) return store.loadMedia();
    return (data ?? []).map(rowToMedia);
  }
  return store.loadMedia();
}

export async function createMedia(
  data: Omit<MediaItem, 'id' | 'createdAt'>
): Promise<MediaItem> {
  const item: MediaItem = {
    ...data,
    id: store.generateId(),
    createdAt: new Date().toISOString(),
  };
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEDIA');
      const { data: inserted, error } = await supabase
        .from(table)
        .insert({
          name: data.name,
          url: data.url,
          alt: data.alt ?? null,
          usage: data.usage ?? null,
        })
        .select('*')
        .single();
      if (!error && inserted) return rowToMedia(inserted as Record<string, unknown>);
    }
  }
  const list = [...store.loadMedia(), item];
  store.saveMedia(list);
  return item;
}

export async function updateMediaUsage(id: string, usage: MediaItem['usage']): Promise<void> {
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEDIA');
      const { error } = await supabase.from(table).update({ usage: usage ?? null }).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadMedia().map((m) => (m.id === id ? { ...m, usage } : m));
  store.saveMedia(list);
}

export async function deleteMedia(id: string): Promise<void> {
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEDIA');
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadMedia().filter((m) => m.id !== id);
  store.saveMedia(list);
}
