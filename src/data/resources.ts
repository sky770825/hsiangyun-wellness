import type { LucideIcon } from 'lucide-react';
import { Sparkles, BookOpen, MessageCircle } from 'lucide-react';

/**
 * 免費資源區塊（首頁 + Resources 頁共用）
 */
export interface ResourceItem {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  link: string;
}

export const RESOURCES: ResourceItem[] = [
  {
    icon: Sparkles,
    title: '小測驗',
    subtitle: '你是哪一種假瘦語言？',
    description: '5 分鐘了解你的身體正在說什麼',
    cta: '開始測驗',
    link: '/quiz',
  },
  {
    icon: BookOpen,
    title: '免費下載',
    subtitle: '鬆動設定點的三個小行動',
    description: '開始溫柔改變的第一步',
    cta: '免費下載',
    link: '/resources#download',
  },
  {
    icon: MessageCircle,
    title: '每日語錄',
    subtitle: '給身體的一句話',
    description: '每天一句，重新認識自己',
    cta: '訂閱語錄',
    link: '/resources#quotes',
  },
];

/** 每日語錄（Resources 頁）*/
export const DAILY_QUOTES = [
  '你的身體不是問題，它是解答的入口。',
  '慢下來，不是放棄，是選擇用身體能接受的速度前進。',
  '今天，允許自己不完美。',
  '渴望是身體的語言，學著翻譯它。',
  '你已經走了很遠，記得回頭看看。',
];
