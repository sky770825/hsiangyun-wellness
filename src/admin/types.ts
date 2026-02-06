/**
 * 後台資料型別（預留與 Supabase / API 對接）
 */

/** 網站視覺設定（字形、字級、顏色）*/
export interface SiteTheme {
  fontDisplay: string;
  fontBody: string;
  fontSizeBase: string;
  fontSizeHeading: string;
  colorBackground: string;
  colorForeground: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
}

/** 媒體庫項目 */
export interface MediaItem {
  id: string;
  name: string;
  url: string; // 目前可為 object URL 或 base64，之後改為 Supabase Storage URL
  alt?: string;
  usage?: 'hero' | 'profile' | 'petal' | 'other';
  createdAt: string;
}

/** 預約表單提交 */
export interface BookingSubmission {
  id: string;
  name: string;
  email: string;
  message?: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/** CRM 學員（由預約轉入或手動建立）*/
export interface CRMStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'booking' | 'manual';
  status: 'new' | 'following' | 'in_progress' | 'completed' | 'paused';
  progressNote?: string;
  createdAt: string;
  updatedAt: string;
}

/** 學員任務（任務板）*/
export interface StudentTask {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** 推播訊息 */
export interface PushMessage {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}
