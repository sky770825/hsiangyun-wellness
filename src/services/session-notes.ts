/**
 * 諮詢紀錄服務：有 Supabase 時讀寫 hsiangyun_session_notes
 */
import { hasSupabase } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase';
import { getTableName } from '@/config/supabase-naming';
import type { SessionNote } from '@/admin/types';


function rowToNote(row: Record<string, unknown>): SessionNote {
  return {
    id: String(row.id),
    memberId: String(row.member_id),
    noteDate: String(row.note_date),
    content: String(row.content),
    createdAt: String(row.created_at),
  };
}

export async function fetchSessionNotes(memberId: string): Promise<SessionNote[]> {
  if (!hasSupabase()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const table = getTableName('SESSION_NOTES');
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('member_id', memberId)
    .order('note_date', { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToNote);
}

export async function createSessionNote(
  memberId: string,
  data: { noteDate: string; content: string }
): Promise<SessionNote> {
  const supabase = getSupabaseClient();
  if (!hasSupabase() || !supabase) {
    return {
      id: '',
      memberId,
      noteDate: data.noteDate,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
  }
  const table = getTableName('SESSION_NOTES');
  const { data: inserted, error } = await supabase
    .from(table)
    .insert({
      member_id: memberId,
      note_date: data.noteDate,
      content: data.content,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToNote(inserted as Record<string, unknown>);
}

export async function deleteSessionNote(id: string): Promise<void> {
  if (!hasSupabase()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const table = getTableName('SESSION_NOTES');
  await supabase.from(table).delete().eq('id', id);
}
