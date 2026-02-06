/**
 * 預約服務：目前使用 localStorage store，接上 Supabase 後可改為 API
 * 表名請使用 getTableName('BOOKINGS')，以配合 config/supabase-naming 前綴
 */
import { hasSupabase } from '@/lib/env';
import { getTableName } from '@/config/supabase-naming';
import type { BookingSubmission } from '@/admin/types';
import * as store from '@/admin/store';

export async function fetchBookings(): Promise<BookingSubmission[]> {
  if (hasSupabase()) {
    // TODO: const table = getTableName('BOOKINGS'); return (await supabase.from(table).select('*').order('createdAt', { ascending: false })).data ?? [];
  }
  return store.loadBookings();
}

export async function createBooking(data: Omit<BookingSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BookingSubmission> {
  const now = new Date().toISOString();
  const item: BookingSubmission = {
    ...data,
    id: store.generateId(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  if (hasSupabase()) {
    // TODO: const table = getTableName('BOOKINGS'); await supabase.from(table).insert(item);
  }
  const list = [...store.loadBookings(), item];
  store.saveBookings(list);
  return item;
}

export async function updateBookingStatus(id: string, status: BookingSubmission['status']): Promise<void> {
  const list = store.loadBookings().map((b) =>
    b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b,
  );
  if (hasSupabase()) {
    // TODO: const table = getTableName('BOOKINGS'); await supabase.from(table).update({ status, updatedAt }).eq('id', id);
  }
  store.saveBookings(list);
}
