/**
 * 預約服務：有 Supabase 時走 API，否則使用 localStorage store
 * 表名使用 getTableName('BOOKINGS')，對應 config/supabase-naming
 */
import { hasSupabase } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase';
import { getTableName } from '@/config/supabase-naming';
import type { BookingSubmission } from '@/admin/types';
import * as store from '@/admin/store';

/** DB 欄位為 snake_case，轉成前端型別 */
function rowToBooking(row: Record<string, unknown>): BookingSubmission {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    message: row.message != null ? String(row.message) : undefined,
    status: row.status as BookingSubmission['status'],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function fetchBookings(): Promise<BookingSubmission[]> {
  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (!supabase) return store.loadBookings();
    const table = getTableName('BOOKINGS');
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      // RLS：後台未用 Supabase Auth 時為 anon，無法 SELECT，先回傳本地
      if (error.code === 'PGRST301' || error.message.includes('row-level')) {
        return store.loadBookings();
      }
      throw new Error(error.message);
    }
    return (data ?? []).map(rowToBooking);
  }
  return store.loadBookings();
}

export async function createBooking(
  data: Omit<BookingSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<BookingSubmission> {
  const now = new Date().toISOString();
  const item: BookingSubmission = {
    ...data,
    id: store.generateId(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('BOOKINGS');
      const { data: inserted, error } = await supabase
        .from(table)
        .insert({
          name: data.name,
          email: data.email,
          message: data.message ?? null,
          status: 'pending',
        })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      return rowToBooking(inserted as Record<string, unknown>);
    }
  }

  store.saveBookings([...store.loadBookings(), item]);
  return item;
}

export async function updateBookingStatus(
  id: string,
  status: BookingSubmission['status']
): Promise<void> {
  const updatedAt = new Date().toISOString();

  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const table = getTableName('BOOKINGS');
      const { error } = await supabase
        .from(table)
        .update({ status, updated_at: updatedAt })
        .eq('id', id);
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('row-level')) {
          const list = store.loadBookings().map((b) =>
            b.id === id ? { ...b, status, updatedAt } : b
          );
          store.saveBookings(list);
          return;
        }
        throw new Error(error.message);
      }
      return;
    }
  }

  const list = store.loadBookings().map((b) =>
    b.id === id ? { ...b, status, updatedAt } : b
  );
  store.saveBookings(list);
}
