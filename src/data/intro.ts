import type { LucideIcon } from 'lucide-react';
import { Heart, Sparkles, Sun } from 'lucide-react';

/**
 * 首頁 Intro 區塊：特色卡片
 */
export interface IntroFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const INTRO_FEATURES: IntroFeature[] = [
  {
    icon: Heart,
    title: '理解，而非改造',
    description: '你的身體一直在說話，只是沒人教你如何聆聽。',
  },
  {
    icon: Sparkles,
    title: '溫柔的轉化',
    description: '不需要意志力的戰爭，只需要理解的陪伴。',
  },
  {
    icon: Sun,
    title: '真正的安全感',
    description: '當身體感到安心，改變就會自然發生。',
  },
];

/** 語言轉化預覽（Before / After）*/
export const INTRO_TRANSFORMATION_PREVIEW = {
  before: '「我就是太懶了，沒有毅力」',
  after: '「我其實是太累了，但沒人允許我停下來」',
};
