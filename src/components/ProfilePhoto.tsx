import { useState } from 'react';
import { cn } from '@/lib/utils';

/** 示範用形象照（可於後台媒體庫替換為真實上傳） */
const DEMO_PROFILE_IMAGE = '/demo-profile.jpg';

interface ProfilePhotoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showGlow?: boolean;
  /** 自訂圖片網址，未提供則使用示範圖 */
  src?: string | null;
}

const ProfilePhoto = ({ size = 'md', className, showGlow = false, src }: ProfilePhotoProps) => {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    hero: 'w-64 h-64 md:w-80 md:h-80',
  };

  const imageUrl = src ?? DEMO_PROFILE_IMAGE;
  const showFallback = imgError;

  return (
    <div className={cn('relative', className)}>
      {showGlow && (
        <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-breathe" />
      )}
      <div 
        className={cn(
          'relative rounded-full overflow-hidden border-4 border-champagne-light shadow-lg',
          'bg-gradient-to-br from-secondary to-muted',
          'flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {showFallback ? (
          <div className="text-center p-4">
            <svg className="w-1/2 h-1/2 mx-auto text-accent opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="教練形象照"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePhoto;
