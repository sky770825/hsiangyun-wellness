import type { LucideIcon } from 'lucide-react';
import { Heart, Clock, Shield, Sparkles } from 'lucide-react';

/**
 * 預約頁：在陪跑中你會經歷什麼
 */
export interface BookingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const BOOKING_FEATURES: BookingFeature[] = [
  {
    icon: Heart,
    title: '深度陪伴',
    description: '不是教你方法，而是陪你找到屬於你的答案。每個人的身體都是獨特的，我們一起探索。',
  },
  {
    icon: Clock,
    title: '尊重節奏',
    description: '沒有進度壓力，沒有必須達成的目標。你的節奏，就是最好的節奏。',
  },
  {
    icon: Shield,
    title: '安全空間',
    description: '這裡沒有評判，只有理解。你可以說出那些從來不敢說的話。',
  },
  {
    icon: Sparkles,
    title: '整合轉化',
    description: '身心靈的整合，不只是體重的改變，而是與自己關係的轉化。',
  },
];
