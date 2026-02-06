/**
 * 右側浮動社群快捷列（LINE / Instagram / Facebook）
 * 小圖示來源：Simple Icons (simpleicons.org)，CC0-1.0 公眾領域
 * 預設：淺底 + 品牌色小圖示；hover：展開 + 品牌底 + 白字
 */
import { LINE_OFFICIAL_URL, FACEBOOK_URL, INSTAGRAM_URL } from '@/config';

// LINE 官方 logo（Simple Icons）
const LineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor" aria-hidden>
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.039 1.085l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

// Instagram 官方 logo（圓角方框＋相機，Simple Icons）
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

// Facebook 官方 f logo（Simple Icons）
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor" aria-hidden>
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

const items = [
  {
    href: LINE_OFFICIAL_URL,
    label: '加 LINE',
    ariaLabel: '加 LINE 好友',
    icon: <LineIcon />,
    iconColor: 'text-[#06C755]',
    idleBg: 'bg-[#06C755]/15',
    hoverBg: 'md:group-hover:bg-[#06C755] md:group-hover:text-white md:group-hover:border-transparent',
  },
  {
    href: INSTAGRAM_URL,
    label: 'Instagram',
    ariaLabel: '追蹤 Instagram',
    icon: <InstagramIcon />,
    iconColor: 'text-[#E4405F]',
    idleBg: 'bg-[#E4405F]/15',
    hoverBg: 'md:group-hover:bg-gradient-to-br md:group-hover:from-[#833AB4] md:group-hover:via-[#FD1D1D] md:group-hover:to-[#F77737] md:group-hover:text-white md:group-hover:border-transparent',
  },
  {
    href: FACEBOOK_URL,
    label: 'Facebook',
    ariaLabel: '前往 Facebook',
    icon: <FacebookIcon />,
    iconColor: 'text-[#1877F2]',
    idleBg: 'bg-[#1877F2]/15',
    hoverBg: 'md:group-hover:bg-[#1877F2] md:group-hover:text-white md:group-hover:border-transparent',
  },
];

export function FloatingSocialBar() {
  return (
    <aside
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      aria-label="社群與聯絡快捷列"
    >
      <div className="group flex flex-col gap-2 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20 shadow-lg p-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.ariaLabel}
            className={`flex items-center justify-center md:justify-end gap-2 w-11 md:w-11 md:group-hover:w-[7.5rem] h-11 rounded-xl border border-transparent ${item.idleBg} ${item.iconColor} ${item.hoverBg} transition-all duration-300 hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden`}
            title={item.label}
          >
            <span className="flex-shrink-0 flex items-center justify-center w-11 h-11">
              {item.icon}
            </span>
            <span className="hidden md:inline text-xs font-body whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
