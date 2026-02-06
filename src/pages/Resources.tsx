import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { PageLayout } from '@/layouts';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, MessageCircle, Download, ArrowRight } from 'lucide-react';
import { RESOURCES, DAILY_QUOTES } from '@/data';
import { ROUTES, SECTION_IDS, PDF_DOWNLOAD_URL, SUBSCRIBE_QUOTES_URL } from '@/config';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';

const Resources = () => {
  const location = useLocation();
  usePageMeta('免費資源', '小測驗、免費下載、每日語錄，溫柔的開始。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              溫柔的開始
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-loose">
              不需要承諾什麼，不需要準備好。<br />
              只要願意，就可以開始。
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section id={SECTION_IDS.QUIZ} className="py-20 bg-card scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="card-pearl rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">小測驗</span>
                  <h2 className="font-display text-2xl text-foreground">你是哪一種假瘦語言？</h2>
                </div>
              </div>

              <p className="text-muted-foreground font-body mb-8 leading-relaxed">
                我們對自己說的話，往往藏著沒被聽見的需要。<br />
                透過這個小測驗，你會發現：那些自責的語言，其實是身體在說什麼。<br />
                5 分鐘，開始一場與自己的對話。
              </p>

              <Button variant="golden" size="lg" className="group" asChild>
                <Link to={ROUTES.QUIZ}>
                  開始測驗
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id={SECTION_IDS.DOWNLOAD} className="py-20 bg-background scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="card-pearl rounded-3xl p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">免費下載</span>
                  <h2 className="font-display text-2xl text-foreground">鬆動設定點的三個小行動</h2>
                </div>
              </div>

              <p className="text-muted-foreground font-body mb-6 leading-relaxed">
                不是減肥計畫，不是飲食清單。<br />
                是三個溫柔的邀請，幫助你的身體開始覺得：可以放鬆了。
              </p>

              <div className="bg-secondary/50 rounded-2xl p-6 mb-8 space-y-3">
                <p className="text-foreground font-body text-sm">📌 什麼是設定點？為什麼它控制著你的體重</p>
                <p className="text-foreground font-body text-sm">📌 三個每天可以做的微小行動</p>
                <p className="text-foreground font-body text-sm">📌 一個自我觀察的小練習</p>
              </div>

              {PDF_DOWNLOAD_URL ? (
                <Button variant="golden" size="lg" className="group" asChild>
                  <a href={PDF_DOWNLOAD_URL} download>
                    <Download className="w-5 h-5" aria-hidden />
                    免費下載 PDF
                  </a>
                </Button>
              ) : (
                <Button
                  variant="golden"
                  size="lg"
                  className="group"
                  onClick={() => toast.info('PDF 準備中，敬請期待。之後可於後台設定實際下載連結。')}
                  aria-label="免費下載 PDF（準備中）"
                >
                  <Download className="w-5 h-5" aria-hidden />
                  免費下載 PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Daily Quotes Section */}
      <section id={SECTION_IDS.QUOTES} className="py-20 bg-card scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">每日語錄</span>
              <h2 className="font-display text-2xl text-foreground mt-2">給身體的一句話</h2>
              <p className="text-muted-foreground font-body mt-4">
                每天一句，溫柔地提醒自己。
              </p>
            </div>

            <div className="space-y-4">
              {DAILY_QUOTES.map((quote, index) => (
                <div 
                  key={index}
                  className="bg-background rounded-2xl p-6 text-center card-hover"
                >
                  <p className="font-display text-lg text-foreground italic">
                    「{quote}」
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              {SUBSCRIBE_QUOTES_URL ? (
                <Button variant="soft" size="lg" asChild>
                  <a href={SUBSCRIBE_QUOTES_URL} target="_blank" rel="noopener noreferrer">
                    訂閱每日語錄
                  </a>
                </Button>
              ) : (
                <Button variant="soft" size="lg" asChild>
                  <Link to={`${ROUTES.RESOURCES}#${SECTION_IDS.QUOTES}`}>
                    訂閱每日語錄
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Resources;
