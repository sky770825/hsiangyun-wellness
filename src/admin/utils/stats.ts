/**
 * 後台統計工具（預約、學員、任務、推播狀態分布）
 * 模組化抽出，方便 Dashboard 與未來報表使用
 */

import type { BookingSubmission, CRMStudent, StudentTask, PushMessage } from '../types';

export interface BookingStats {
  pending: number;
  contacted: number;
  confirmed: number;
  cancelled: number;
  total: number;
}

export interface CRMStats {
  new: number;
  following: number;
  in_progress: number;
  completed: number;
  paused: number;
  total: number;
}

export interface TaskStats {
  todo: number;
  in_progress: number;
  done: number;
  total: number;
}

export interface PushStats {
  draft: number;
  scheduled: number;
  sent: number;
  total: number;
}

export function getBookingStats(bookings: BookingSubmission[]): BookingStats {
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const contacted = bookings.filter((b) => b.status === 'contacted').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
  return { pending, contacted, confirmed, cancelled, total: bookings.length };
}

export function getCRMStats(students: CRMStudent[]): CRMStats {
  const new_ = students.filter((s) => s.status === 'new').length;
  const following = students.filter((s) => s.status === 'following').length;
  const in_progress = students.filter((s) => s.status === 'in_progress').length;
  const completed = students.filter((s) => s.status === 'completed').length;
  const paused = students.filter((s) => s.status === 'paused').length;
  return { new: new_, following, in_progress, completed, paused, total: students.length };
}

export function getTaskStats(tasks: StudentTask[]): TaskStats {
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const in_progress = tasks.filter((t) => t.status === 'in_progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  return { todo, in_progress, done, total: tasks.length };
}

export function getPushStats(messages: PushMessage[]): PushStats {
  const draft = messages.filter((p) => p.status === 'draft').length;
  const scheduled = messages.filter((p) => p.status === 'scheduled').length;
  const sent = messages.filter((p) => p.status === 'sent').length;
  return { draft, scheduled, sent, total: messages.length };
}

/** 預約轉化率：已確認 / 非取消總數（%），用於決策指標 */
export function getBookingConversionRate(bookings: BookingSubmission[]): number {
  const nonCancelled = bookings.filter((b) => b.status !== 'cancelled').length;
  if (nonCancelled === 0) return 0;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  return Math.round((confirmed / nonCancelled) * 100);
}

/** 任務完成率（%） */
export function getTaskCompletionRate(tasks: StudentTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

/** 學員活躍比：跟進中+進行中 / 總學員（%） */
export function getActiveMemberRate(students: CRMStudent[]): number {
  if (students.length === 0) return 0;
  const active = students.filter((s) => s.status === 'following' || s.status === 'in_progress').length;
  return Math.round((active / students.length) * 100);
}

/** 近 N 天內的預約數（依 createdAt） */
export function getBookingsInDays(bookings: BookingSubmission[], days: number): number {
  const cut = Date.now() - days * 24 * 60 * 60 * 1000;
  return bookings.filter((b) => new Date(b.createdAt).getTime() >= cut).length;
}

/** 預約數：從 fromDays 到 toDays 天前（用於本週 vs 上週對比，如 getBookingsBetweenDays(b, 7, 14) = 上週） */
export function getBookingsBetweenDays(bookings: BookingSubmission[], fromDays: number, toDays: number): number {
  const now = Date.now();
  const start = now - toDays * 24 * 60 * 60 * 1000;
  const end = now - fromDays * 24 * 60 * 60 * 1000;
  return bookings.filter((b) => {
    const t = new Date(b.createdAt).getTime();
    return t >= start && t < end;
  }).length;
}

/** 近 N 天內新增學員數 */
export function getMembersAddedInDays(students: CRMStudent[], days: number): number {
  const cut = Date.now() - days * 24 * 60 * 60 * 1000;
  return students.filter((s) => new Date(s.createdAt).getTime() >= cut).length;
}

/** 新增學員數：fromDays 到 toDays 天前（上週等） */
export function getMembersAddedBetweenDays(students: CRMStudent[], fromDays: number, toDays: number): number {
  const now = Date.now();
  const start = now - toDays * 24 * 60 * 60 * 1000;
  const end = now - fromDays * 24 * 60 * 60 * 1000;
  return students.filter((s) => {
    const t = new Date(s.createdAt).getTime();
    return t >= start && t < end;
  }).length;
}

/** 超過 N 天未更新備註的活躍學員（跟進中/進行中），用於建議跟進 */
export function getMembersStaleDays(students: CRMStudent[], days: number): CRMStudent[] {
  const cut = Date.now() - days * 24 * 60 * 60 * 1000;
  return students.filter((s) => {
    if (s.status !== 'following' && s.status !== 'in_progress') return false;
    const updated = new Date(s.updatedAt).getTime();
    return updated < cut;
  });
}
