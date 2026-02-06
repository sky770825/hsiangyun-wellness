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
  /** 方便聯絡時段（如週末上午、平日晚上）*/
  preferredContactTime?: string;
  /** Line ID（選填，手動填寫或一鍵複製用）*/
  lineId?: string;
  /** Line 用戶 ID（從 Line OA API 取得，用於推播與識別）*/
  lineUserId?: string;
  /** Line 顯示名稱（從 Line OA 取得）*/
  lineDisplayName?: string;
  /** Line 大頭貼 URL */
  linePictureUrl?: string;
  /** 標籤（分群、篩選用）*/
  tags?: string[];
  source: 'booking' | 'manual' | 'line';
  status: 'new' | 'following' | 'in_progress' | 'completed' | 'paused';
  progressNote?: string;
  createdAt: string;
  updatedAt: string;
}

/** 諮詢紀錄（單次諮詢重點）*/
export interface SessionNote {
  id: string;
  memberId: string;
  noteDate: string;
  content: string;
  createdAt: string;
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

/** 推播發送對象篩選（依學員狀態） */
export type PushAudienceFilter = 'all' | 'active' | 'new' | 'following' | 'in_progress' | 'completed' | 'paused';

/** 推播訊息 */
export interface PushMessage {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sent';
  /** 發送對象篩選（接推播服務時使用） */
  audienceFilter?: PushAudienceFilter;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Line 官方帳號 (OA) 設定與串接預留 ==========

/** 預設關鍵字回覆類型 */
export type LineKeywordReplyType = 'text' | 'flex' | 'none';

/** 一筆預設關鍵字設定（用戶輸入關鍵字時的回應）*/
export interface LineDefaultKeyword {
  id: string;
  /** 觸發關鍵字（可多個用逗號分隔，或單一關鍵字）*/
  keyword: string;
  replyType: LineKeywordReplyType;
  /** 文字回覆內容（replyType === 'text' 時使用）*/
  replyText?: string;
  /** Flex Message 範本 ID 或 JSON 路徑（replyType === 'flex' 時使用）*/
  flexTemplateId?: string;
}

/** Flex 選單項目動作類型 */
export type LineFlexActionType = 'message' | 'uri' | 'postback';

/** Flex Message 選單單一項目（Rich Menu / 自訂選單項目）*/
export interface LineFlexMenuItem {
  id: string;
  /** 顯示標題 */
  label: string;
  actionType: LineFlexActionType;
  /** 動作資料：message 為文字、uri 為網址、postback 為 data 字串 */
  actionData: string;
  /** 選填，排序用 */
  order?: number;
}

/** Line 官方帳號設定（儲存於網站設定，供後續 Webhook / 推播串接）*/
export interface LineOAConfig {
  /** 是否啟用 Line OA 功能 */
  enabled: boolean;
  /** Line Developers Channel ID */
  channelId: string;
  /** Line Developers Channel Secret */
  channelSecret: string;
  /** Webhook URL（選填，後端串接時使用）*/
  webhookUrl?: string;
  /** 預設關鍵字與回覆 */
  defaultKeywords: LineDefaultKeyword[];
  /** Flex Message 選單項目（如：預約、方案、聯絡我們）*/
  flexMenuItems: LineFlexMenuItem[];
  /** 最後更新時間（前端寫入用）*/
  updatedAt?: string;
}
