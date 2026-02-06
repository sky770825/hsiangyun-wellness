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
  LineOAConfig,
  LineDefaultKeyword,
  LineFlexMenuItem,
} from './types';
import { DEFAULT_THEME } from './theme-defaults';

const KEYS = {
  THEME: 'admin_site_theme',
  TAG_COLORS: 'admin_tag_colors',
  STALE_DAYS: 'admin_stale_days',
  LINE_OA: 'admin_line_oa_config',
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

/** 標籤名稱 → 顏色（hex），供 CRM / 行事曆辨識用 */
export function loadTagColors(): Record<string, string> {
  return load<Record<string, string>>(KEYS.TAG_COLORS, {});
}

export function saveTagColors(map: Record<string, string>): void {
  save(KEYS.TAG_COLORS, map);
}

/** 建議跟進「久未更新」天數（3 | 7 | 14），總覽優先決策用 */
export function loadStaleDays(): 3 | 7 | 14 {
  const v = load<number>(KEYS.STALE_DAYS, 7);
  return v === 3 || v === 14 ? v : 7;
}

export function saveStaleDays(days: 3 | 7 | 14): void {
  save(KEYS.STALE_DAYS, days);
}

/** Line 官方帳號設定預設值（預設關鍵字、Flex 選單範例）*/
function getDefaultLineOAConfig(): LineOAConfig {
  return {
    enabled: false,
    channelId: '',
    channelSecret: '',
    webhookUrl: '',
    defaultKeywords: [
      { id: generateId(), keyword: '嗨,你好', replyType: 'text', replyText: '您好！歡迎聯絡身心靈瘦身教練，請問有什麼可以協助您的？' },
      { id: generateId(), keyword: '預約', replyType: 'text', replyText: '可透過官網預約或回覆「預約」由專人為您安排。' },
    ] as LineDefaultKeyword[],
    flexMenuItems: [
      { id: generateId(), label: '預約諮詢', actionType: 'uri', actionData: '/booking', order: 1 },
      { id: generateId(), label: '方案介紹', actionType: 'message', actionData: '方案', order: 2 },
      { id: generateId(), label: '聯絡我們', actionType: 'message', actionData: '聯絡', order: 3 },
    ] as LineFlexMenuItem[],
    updatedAt: new Date().toISOString(),
  };
}

export function loadLineOAConfig(): LineOAConfig {
  const loaded = load<LineOAConfig>(KEYS.LINE_OA, getDefaultLineOAConfig());
  const def = getDefaultLineOAConfig();
  return {
    enabled: loaded.enabled ?? def.enabled,
    channelId: loaded.channelId ?? def.channelId,
    channelSecret: loaded.channelSecret ?? def.channelSecret,
    webhookUrl: loaded.webhookUrl ?? def.webhookUrl ?? '',
    defaultKeywords: Array.isArray(loaded.defaultKeywords) ? loaded.defaultKeywords : def.defaultKeywords,
    flexMenuItems: Array.isArray(loaded.flexMenuItems) ? loaded.flexMenuItems : def.flexMenuItems,
    updatedAt: loaded.updatedAt ?? def.updatedAt,
  };
}

export function saveLineOAConfig(config: LineOAConfig): void {
  save(KEYS.LINE_OA, { ...config, updatedAt: new Date().toISOString() });
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
