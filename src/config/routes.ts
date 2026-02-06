/**
 * 路由路徑常數（與 React Router 對應）
 * 全站連結請由此讀取，方便維修與模組化
 */

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  METHOD: '/method',
  STORIES: '/stories',
  RESOURCES: '/resources',
  BOOKING: '/booking',
  PRIVACY: '/privacy',
  QUIZ: '/quiz',
} as const;

/** 後台路徑（與 admin 側欄及 App 路由一致） */
export const ADMIN_ROUTES = {
  HOME: '/admin',
  SETTINGS: '/admin/settings',
  MEDIA: '/admin/media',
  BOOKINGS: '/admin/bookings',
  CRM: '/admin/crm',
  TASKS: '/admin/tasks',
  PUSH: '/admin/push',
} as const;
