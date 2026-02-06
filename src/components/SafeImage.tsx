import { useState } from 'react';
import { cn } from '@/lib/utils';

const FALLBACK_SRC = '/placeholder.svg';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * 圖片載入失敗時顯示 fallback，避免破圖
 */
export function SafeImage({ src, alt, className, fallbackSrc = FALLBACK_SRC, onError, ...props }: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  const effectiveSrc = errored ? fallbackSrc : src;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setErrored(true);
    onError?.(e);
  };

  if (!effectiveSrc) return null;

  return (
    <img
      src={effectiveSrc}
      alt={alt ?? ''}
      className={cn(className)}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
