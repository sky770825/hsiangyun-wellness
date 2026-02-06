import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/layouts';
import { Button } from '@/components/ui/button';
import { BOOKING_FEATURES } from '@/data';
import { createBooking } from '@/services';
import { ROUTES, LINE_OFFICIAL_URL } from '@/config';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useLocation } from 'react-router-dom';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Booking = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  usePageMeta('預約陪跑', '預約一對一陪跑，留下你的資料，我會在 48 小時內回覆你。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('請填寫名字與 Email');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('請填寫有效的 Email');
      return;
    }
    if (!agreePrivacy) {
      setError('請先閱讀並同意隱私權政策');
      return;
    }
    setLoading(true);
    try {
      await createBooking({ name: name.trim(), email: email.trim(), message: message.trim() || undefined });
      setName('');
      setEmail('');
      setMessage('');
      setAgreePrivacy(false);
      setSubmitted(true);
    } catch (_) {
      setError('送出失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError('');
  };

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <section className="pt-32 pb-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-[40px] text-foreground mb-6 leading-relaxed">
              我不會幫你變乖<br />
              而是陪你找回你原本就很珍貴的樣子
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-loose">
              這不是減肥課程不是健身計畫<br />
              這是一段陪伴你回到自己的旅程
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-foreground mb-4">
              在陪跑中，你會經歷什麼
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {BOOKING_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-pearl rounded-2xl p-8 card-hover">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl text-foreground mb-4">
                預約一對一陪跑
              </h2>
              <p className="text-muted-foreground font-body">
                留下你的資料，我會在 48 小時內回覆你。<br />
                沒有壓力，只是開始一段對話。
              </p>
              <p className="text-muted-foreground font-body text-sm mt-2">
                想先聊聊？可<a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">加我的 LINE</a>。
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {submitted ? (
                <div className="rounded-xl bg-secondary/50 p-6 text-center space-y-4">
                  <p className="font-display text-lg text-foreground">感謝你的預約</p>
                  <p className="text-muted-foreground font-body text-sm">我會在 48 小時內回覆你。</p>
                  <Button type="button" variant="soft" onClick={handleReset}>
                    再預約一筆
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-foreground font-body text-sm">你的名字</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="可以用暱稱"
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors font-body"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-foreground font-body text-sm">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="我會用這個信箱聯繫你"
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors font-body"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-foreground font-body text-sm">想對我說的話（選填）</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="任何你想分享的，或是你現在的狀態..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors font-body resize-none"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="agree-privacy"
                      checked={agreePrivacy}
                      onChange={(e) => setAgreePrivacy(e.target.checked)}
                      disabled={loading}
                      className="mt-1 rounded border-border"
                    />
                    <label htmlFor="agree-privacy" className="text-foreground font-body text-sm">
                      我已閱讀並同意
                      <Link to={ROUTES.PRIVACY} className="text-primary underline ml-1" target="_blank" rel="noopener noreferrer">
                        隱私權政策
                      </Link>
                    </label>
                  </div>
                  {error && <p className="text-sm text-destructive font-body">{error}</p>}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="golden"
                      size="xl"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? '送出中…' : '送出預約'}
                    </Button>
                  </div>
                </>
              )}
              <p className="text-center text-muted-foreground text-xs mt-4">
                你的資料會被安全保管，不會用於任何其他用途。
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-display text-xl text-foreground italic mb-4">
              「每一個想改變的念頭都值得被認真對待」
            </p>
            <p className="text-muted-foreground font-body text-sm">
              不管你現在在哪裡不管你嘗試過多少次<br />
              這一次讓我陪你
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Booking;
