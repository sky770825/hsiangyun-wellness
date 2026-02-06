import { Link } from 'react-router-dom';
import ProfilePhoto from '@/components/ProfilePhoto';
import { SITE_NAME, DEFAULT_DESCRIPTION, LINE_OFFICIAL_URL, LINE_BRAND_LABEL, LINE_TAGLINE } from '@/config';
import { ROUTES } from '@/config/routes';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand with Profile Photo */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProfilePhoto size="md" className="hover-scale-subtle" />
              <h3 className="font-display text-2xl text-foreground">{SITE_NAME}</h3>
            </div>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              {DEFAULT_DESCRIPTION}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg text-foreground">探索更多</h4>
            <div className="space-y-2">
              <Link to={ROUTES.ABOUT} className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                關於我
              </Link>
              <Link to={ROUTES.METHOD} className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                五金剛系統
              </Link>
              <Link to={ROUTES.STORIES} className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                學員故事
              </Link>
              <Link to={ROUTES.RESOURCES} className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                免費資源
              </Link>
              <Link to={ROUTES.QUIZ} className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                假瘦語言測驗
              </Link>
              <Link to={ROUTES.PRIVACY} className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                隱私權政策
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg text-foreground">聯繫我</h4>
            <p className="text-sm text-muted-foreground font-body">{LINE_BRAND_LABEL}</p>
            <p className="text-xs text-muted-foreground font-body">{LINE_TAGLINE}</p>
            <div className="space-y-1 text-sm">
              <a
                href={LINE_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground border-b border-primary pb-1 hover:text-accent transition-colors w-fit"
              >
                加 LINE 好友 →
              </a>
              <Link
                to={ROUTES.BOOKING}
                className="block text-foreground border-b border-primary pb-1 hover:text-accent transition-colors w-fit"
              >
                預約一對一陪跑 →
              </Link>
            </div>
            <p className="text-muted-foreground text-xs mt-2">每一個想改變的念頭，都值得被認真對待。</p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {SITE_NAME}. 用溫柔陪你回到自己.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
