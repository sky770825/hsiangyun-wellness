/**
 * 導覽列與頁面路徑設定
 */

export const NAV_ITEMS = [
  { label: '首頁', path: '/' },
  { label: '關於我', path: '/about' },
  { label: '五金剛系統', path: '/method' },
  { label: '學員故事', path: '/stories' },
  { label: '免費資源', path: '/resources' },
  { label: '預約陪跑', path: '/booking' },
] as const;

export type NavPath = (typeof NAV_ITEMS)[number]['path'];
