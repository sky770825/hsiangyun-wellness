/**
 * 學員任務服務：有 Supabase 時走 API，否則使用 localStorage store
 */
import { hasSupabase } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase';
import { getTableName } from '@/config/supabase-naming';
import type { StudentTask } from '@/admin/types';
import * as store from '@/admin/store';

function rowToTask(row: Record<string, unknown>): StudentTask {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    title: String(row.title),
    description: row.description != null ? String(row.description) : undefined,
    status: row.status as StudentTask['status'],
    dueDate: row.due_date != null ? String(row.due_date) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function fetchTasks(): Promise<StudentTask[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (!supabase) return store.loadTasks();
    const table = getTableName('TASKS');
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) return store.loadTasks();
    return (data ?? []).map(rowToTask);
  }
  return store.loadTasks();
}

export async function createTask(
  data: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StudentTask> {
  const now = new Date().toISOString();
  const item: StudentTask = {
    ...data,
    id: store.generateId(),
    createdAt: now,
    updatedAt: now,
  };
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('TASKS');
      const { data: inserted, error } = await supabase
        .from(table)
        .insert({
          student_id: data.studentId,
          title: data.title,
          description: data.description ?? null,
          status: data.status,
          due_date: data.dueDate ?? null,
        })
        .select('*')
        .single();
      if (!error && inserted) return rowToTask(inserted as Record<string, unknown>);
    }
  }
  store.saveTasks([...store.loadTasks(), item]);
  return item;
}

export async function updateTaskStatus(id: string, status: StudentTask['status']): Promise<void> {
  const updatedAt = new Date().toISOString();
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('TASKS');
      const { error } = await supabase.from(table).update({ status, updated_at: updatedAt }).eq('id', id);
      if (!error) return;
    }
  }
  const list = store.loadTasks().map((t) => (t.id === id ? { ...t, status, updatedAt } : t));
  store.saveTasks(list);
}
