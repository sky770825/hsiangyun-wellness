/**
 * Supabase 資料庫命名設定
 * 以導師「許湘芸」的英文命名作為主目錄／前綴，供會員名單、預約資訊等表名使用。
 *
 * 五個命名選項（擇一使用，填入下方 DB_SCHEMA_PREFIX）：
 * 1. xiangyun         - 湘芸，簡短好記
 * 2. xu_xiangyun     - 許湘芸 全名 snake_case
 * 3. xiangyun_xu     - 名_姓
 * 4. hsiangyun       - 湘芸 威妥瑪拼法
 * 5. xiangyun_wellness - 湘芸 + 領域
 */

/** 導師中文名稱 */
export const COACH_NAME_ZH = '許湘芸';

/** 導師英文名稱（顯示用） */
export const COACH_NAME_EN = 'Xu Xiangyun';

/**
 * 資料庫主目錄英文名稱（表名前綴）
 * 請從 docs/SUPABASE_NAMING.md 五選一，改為你選定的值。
 */
export const DB_SCHEMA_PREFIX = 'xiangyun';

/** 預計使用的資料表名稱（前綴 + 功能） */
export const TABLE_NAMES = {
  /** 會員／學員名單 */
  MEMBERS: `${DB_SCHEMA_PREFIX}_members`,
  /** 預約資訊 */
  BOOKINGS: `${DB_SCHEMA_PREFIX}_bookings`,
  /** 學員任務／進度（任務板） */
  TASKS: `${DB_SCHEMA_PREFIX}_tasks`,
  /** 推播訊息 */
  PUSH_MESSAGES: `${DB_SCHEMA_PREFIX}_push_messages`,
  /** 媒體庫 */
  MEDIA: `${DB_SCHEMA_PREFIX}_media`,
  /** 網站設定（主題等） */
  SITE_SETTINGS: `${DB_SCHEMA_PREFIX}_site_settings`,
} as const;

/**
 * 依功能取得 Supabase 表名（之後 API 層可統一使用）
 */
export function getTableName(key: keyof typeof TABLE_NAMES): string {
  return TABLE_NAMES[key];
}
