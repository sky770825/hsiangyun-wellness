/**
 * CRM 學員服務：有 Supabase 時走 API，否則使用 localStorage store
 */
import { hasSupabase } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase';
import { getTableName } from '@/config/supabase-naming';
import type { CRMStudent } from '@/admin/types';
import * as store from '@/admin/store';

function rowToMember(row: Record<string, unknown>): CRMStudent {
  const tagsRaw = row.tags;
  const tags = Array.isArray(tagsRaw)
    ? (tagsRaw as string[]).filter(Boolean)
    : undefined;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone != null ? String(row.phone) : undefined,
    preferredContactTime: row.preferred_contact_time != null ? String(row.preferred_contact_time) : undefined,
    lineId: row.line_id != null ? String(row.line_id) : undefined,
    lineUserId: row.line_user_id != null ? String(row.line_user_id) : undefined,
    lineDisplayName: row.line_display_name != null ? String(row.line_display_name) : undefined,
    linePictureUrl: row.line_picture_url != null ? String(row.line_picture_url) : undefined,
    tags: tags?.length ? tags : undefined,
    source: row.source as CRMStudent['source'],
    status: row.status as CRMStudent['status'],
    progressNote: row.progress_note != null ? String(row.progress_note) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function fetchMembers(): Promise<CRMStudent[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (!supabase) return store.loadCRM();
    const table = getTableName('MEMBERS');
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) return store.loadCRM();
    return (data ?? []).map(rowToMember);
  }
  return store.loadCRM();
}

export async function createMember(
  data: Omit<CRMStudent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CRMStudent> {
  const now = new Date().toISOString();
  const item: CRMStudent = {
    ...data,
    id: store.generateId(),
    createdAt: now,
    updatedAt: now,
  };
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEMBERS');
      const { data: inserted, error } = await supabase
        .from(table)
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone ?? null,
          preferred_contact_time: data.preferredContactTime ?? null,
          line_id: data.lineId ?? null,
          line_user_id: data.lineUserId ?? null,
          line_display_name: data.lineDisplayName ?? null,
          line_picture_url: data.linePictureUrl ?? null,
          tags: data.tags?.length ? data.tags : null,
          source: data.source,
          status: data.status,
          progress_note: data.progressNote ?? null,
        })
        .select('*')
        .single();
      if (!error && inserted) return rowToMember(inserted as Record<string, unknown>);
    }
  }
  store.saveCRM([...store.loadCRM(), item]);
  return item;
}

export async function updateMemberStatus(id: string, status: CRMStudent['status']): Promise<void> {
  const updatedAt = new Date().toISOString();
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEMBERS');
      const { error } = await supabase.from(table).update({ status, updated_at: updatedAt }).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadCRM().map((s) => (s.id === id ? { ...s, status, updatedAt } : s));
  store.saveCRM(list);
}

export async function updateMemberNote(id: string, progressNote: string): Promise<void> {
  const updatedAt = new Date().toISOString();
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEMBERS');
      const { error } = await supabase.from(table).update({ progress_note: progressNote, updated_at: updatedAt }).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadCRM().map((s) => (s.id === id ? { ...s, progressNote, updatedAt } : s));
  store.saveCRM(list);
}

export async function updateMemberContact(
  id: string,
  data: { preferredContactTime?: string; lineId?: string }
): Promise<void> {
  const updatedAt = new Date().toISOString();
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEMBERS');
      const payload: Record<string, unknown> = { updated_at: updatedAt };
      if (data.preferredContactTime !== undefined) payload.preferred_contact_time = data.preferredContactTime || null;
      if (data.lineId !== undefined) payload.line_id = data.lineId || null;
      const { error } = await supabase.from(table).update(payload).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadCRM().map((s) =>
    s.id === id ? { ...s, ...data, updatedAt } : s
  );
  store.saveCRM(list);
}

/** 更新學員的 Line OA 擷取資料（User ID、顯示名稱、大頭貼），供會員系統從 Line 加入時寫入 */
export async function updateMemberLineProfile(
  id: string,
  data: { lineUserId?: string; lineDisplayName?: string; linePictureUrl?: string }
): Promise<void> {
  const updatedAt = new Date().toISOString();
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEMBERS');
      const payload: Record<string, unknown> = { updated_at: updatedAt };
      if (data.lineUserId !== undefined) payload.line_user_id = data.lineUserId || null;
      if (data.lineDisplayName !== undefined) payload.line_display_name = data.lineDisplayName || null;
      if (data.linePictureUrl !== undefined) payload.line_picture_url = data.linePictureUrl || null;
      const { error } = await supabase.from(table).update(payload).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadCRM().map((s) =>
    s.id === id ? { ...s, ...data, updatedAt } : s
  );
  store.saveCRM(list);
}

export async function updateMemberTags(id: string, tags: string[]): Promise<void> {
  const updatedAt = new Date().toISOString();
  const normalized = tags.filter(Boolean).map((t) => t.trim()).filter(Boolean);
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('MEMBERS');
      const { error } = await supabase.from(table).update({ tags: normalized.length ? normalized : null, updated_at: updatedAt }).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadCRM().map((s) => (s.id === id ? { ...s, tags: normalized.length ? normalized : undefined, updatedAt } : s));
  store.saveCRM(list);
}
