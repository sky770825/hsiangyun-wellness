import { ADMIN_ROUTES } from '@/config/routes';

/**
 * 後台側邊導覽（路徑集中從 config 讀取，方便維修）
 */
export const ADMIN_NAV = [
  { label: '總覽', path: ADMIN_ROUTES.HOME, icon: 'LayoutDashboard' },
  { label: '網站設定', path: ADMIN_ROUTES.SETTINGS, icon: 'Palette' },
  { label: '媒體庫', path: ADMIN_ROUTES.MEDIA, icon: 'Image' },
  { label: '預約管理', path: ADMIN_ROUTES.BOOKINGS, icon: 'CalendarCheck' },
  { label: 'CRM 學員', path: ADMIN_ROUTES.CRM, icon: 'Users' },
  { label: '學員任務板', path: ADMIN_ROUTES.TASKS, icon: 'Kanban' },
  { label: '本週行事曆', path: ADMIN_ROUTES.CALENDAR, icon: 'CalendarDays' },
  { label: '推播發送', path: ADMIN_ROUTES.PUSH, icon: 'Send' },
] as const;
