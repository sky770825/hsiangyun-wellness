import { useEffect } from 'react';

const DEFAULT_TITLE = '身心靈瘦身教練';
const DEFAULT_DESCRIPTION = '陪你回到身體的安全感，找回與自己和解的力量。';

/**
 * 設定當前頁的 document.title 與 meta description（SEO）
 * 模組化：每頁在開頭呼叫並傳入該頁標題與描述
 */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', description ?? DEFAULT_DESCRIPTION);
    } else {
      const el = document.createElement('meta');
      el.name = 'description';
      el.content = description ?? DEFAULT_DESCRIPTION;
      document.head.appendChild(el);
    }
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description]);
}
