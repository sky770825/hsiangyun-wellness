/**
 * 服務層共用型別（與 admin/types 對齊，之後 API 回傳可沿用）
 */
export type BookingStatus = 'pending' | 'contacted' | 'confirmed' | 'cancelled';
export type CRMStatus = 'new' | 'following' | 'in_progress' | 'completed' | 'paused';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type PushStatus = 'draft' | 'scheduled' | 'sent';

export interface BookingSubmission {
  id: string;
  name: string;
  email: string;
  message?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

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
