/**
 * 後台資料儲存（目前使用 localStorage，之後可改為 Supabase API）
 */

import type {
  SiteTheme,
  MediaItem,
  BookingSubmission,
  CRMStudent,
  StudentTask,
  PushMessage,
} from './types';
import { DEFAULT_THEME } from './theme-defaults';

const KEYS = {
  THEME: 'admin_site_theme',
  MEDIA: 'admin_media',
  BOOKINGS: 'admin_bookings',
  CRM: 'admin_crm',
  TASKS: 'admin_tasks',
  PUSH: 'admin_push',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    void 0; /* ignore parse errors, use fallback */
  }
  return fallback;
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Theme
export function loadTheme(): SiteTheme {
  return load(KEYS.THEME, DEFAULT_THEME);
}

export function saveTheme(theme: SiteTheme): void {
  save(KEYS.THEME, theme);
}

// Media
export function loadMedia(): MediaItem[] {
  return load(KEYS.MEDIA, []);
}

export function saveMedia(items: MediaItem[]): void {
  save(KEYS.MEDIA, items);
}

// Bookings
export function loadBookings(): BookingSubmission[] {
  return load(KEYS.BOOKINGS, []);
}

export function saveBookings(items: BookingSubmission[]): void {
  save(KEYS.BOOKINGS, items);
}

// CRM
export function loadCRM(): CRMStudent[] {
  return load(KEYS.CRM, []);
}

export function saveCRM(items: CRMStudent[]): void {
  save(KEYS.CRM, items);
}

// Tasks
export function loadTasks(): StudentTask[] {
  return load(KEYS.TASKS, []);
}

export function saveTasks(items: StudentTask[]): void {
  save(KEYS.TASKS, items);
}

// Push
export function loadPushMessages(): PushMessage[] {
  return load(KEYS.PUSH, []);
}

export function savePushMessages(items: PushMessage[]): void {
  save(KEYS.PUSH, items);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
