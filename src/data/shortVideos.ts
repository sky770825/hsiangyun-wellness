/**
 * 短影音／TikTok 輪播資料
 * - videoId：TikTok 影片 ID（從分享連結取得，例如 tiktok.com/@用戶/video/7123456789 的數字部分）
 * - embedUrl：若不想用 videoId，可直接給完整 embed 網址
 * - linkUrl + thumbnail：其他平台（如 YouTube Shorts）可只放連結與縮圖，點擊另開
 */

export interface ShortVideoItem {
  id: string;
  /** 顯示標題（選填） */
  title?: string;
  /** TikTok 影片 ID，會自動組出 embed 網址 */
  videoId?: string;
  /** 或直接提供 embed 網址（與 videoId 二擇一） */
  embedUrl?: string;
  /** 對外連結（在 TikTok 觀看／其他平台） */
  linkUrl?: string;
  /** 縮圖 URL（無 embed 時顯示，例如 YouTube 縮圖） */
  thumbnail?: string;
}

const TIKTOK_EMBED_BASE = 'https://www.tiktok.com/embed/v2';

/** 取得 TikTok embed 網址 */
export function getTikTokEmbedUrl(item: ShortVideoItem): string | null {
  if (item.embedUrl) return item.embedUrl;
  if (item.videoId) return `${TIKTOK_EMBED_BASE}/${item.videoId}`;
  return null;
}

/** 是否為可內嵌影片（TikTok embed） */
export function isEmbedVideo(item: ShortVideoItem): boolean {
  return Boolean(getTikTokEmbedUrl(item));
}

/** 示範縮圖（可替換為真實 TikTok 或 YouTube Shorts 後改為真實縮圖） */
const DEMO_VIDEO_THUMB = '/demo-video.jpg';

export const SHORT_VIDEOS: ShortVideoItem[] = [
  {
    id: 'demo-1',
    title: '溫柔對待身體的一句話',
    linkUrl: 'https://www.tiktok.com',
    thumbnail: DEMO_VIDEO_THUMB,
  },
  {
    id: 'demo-2',
    title: '日常中的小練習',
    linkUrl: 'https://www.tiktok.com',
    thumbnail: '/demo-gallery-1.jpg',
  },
  {
    id: 'demo-3',
    title: '加入你的短影音',
    linkUrl: 'https://www.tiktok.com',
    thumbnail: '/demo-gallery-2.jpg',
  },
];
