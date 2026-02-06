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
