import { useLocation } from 'react-router-dom';
import { PageLayout } from '@/layouts';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles, Sun } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import ProfilePhoto from '@/components/ProfilePhoto';
import { ABOUT_TRANSFORMATIONS } from '@/data';
import { ROUTES } from '@/config/routes';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';

const About = () => {
  const location = useLocation();
  usePageMeta('關於我', '我不是減肥教練，是你的身體翻譯師。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      {/* Hero Section with Profile Photo */}
      <section className="pt-32 pb-20 bg-background">
        <div className="section-container">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <ScrollReveal direction="left" className="flex-shrink-0">
              <ProfilePhoto size="xl" showGlow className="image-float" />
            </ScrollReveal>

            <div className="text-center md:text-left">
              <ScrollReveal>
                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                  我不是減肥教練，<br />
                  是你的身體翻譯師
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-muted-foreground font-body text-lg leading-loose">
                  我曾經和你一樣，用盡所有方法想改變身體。<br />
                  直到我發現，身體不是需要被征服的敵人，<br />
                  而是需要被聆聽的老朋友。
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-card">
        <div className="section-container">
          <div className="max-w-2xl mx-auto space-y-12">
            <ScrollReveal>
              <div className="space-y-6 hover-scale-subtle p-6 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover-glow">
                    <Heart className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl text-foreground">從壓抑開始的故事</h2>
                </div>
                <p className="font-body text-muted-foreground leading-loose">
                  很長一段時間，我相信「瘦」等於「被愛」。我節食、運動、計算每一卡路里。
                  體重計上的數字，是我每天心情的開關。我以為這是自律，後來才明白那是自我傷害。
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="space-y-6 hover-scale-subtle p-6 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover-glow">
                    <Sun className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl text-foreground">身體的反撲</h2>
                </div>
                <p className="font-body text-muted-foreground leading-loose">
                  身體終於累了。代謝變慢、情緒失控、暴食又自責。
                  那些年的「努力」，換來的是更深的內耗。直到我停下來問自己：
                  <span className="text-foreground block mt-4 italic">「如果身體是一個朋友，它現在想告訴我什麼？」</span>
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="space-y-6 hover-scale-subtle p-6 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover-glow">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl text-foreground">轉化的開始</h2>
                </div>
                <p className="font-body text-muted-foreground leading-loose">
                  當我開始理解身體的語言，一切都不一樣了。
                  不再是對抗，而是對話。不再是控制，而是陪伴。
                  現在，我想把這份理解，帶給每一個像曾經的我一樣的你。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Language Transformation */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl text-foreground mb-4">
              我會陪你鬆動的語言
            </h2>
            <p className="text-muted-foreground font-body">
              從自我責備，到溫柔理解
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {ABOUT_TRANSFORMATIONS.map((item, index) => (
              <div 
                key={index}
                className="card-pearl rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center"
              >
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Before</span>
                  <p className="font-body text-foreground/70 italic">「{item.before}」</p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-accent uppercase tracking-widest">After</span>
                  <p className="font-body text-foreground">「{item.after}」</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/50">
        <div className="section-container text-center">
          <h2 className="font-display text-3xl text-foreground mb-6">
            準備好被理解了嗎？
          </h2>
          <p className="text-muted-foreground font-body mb-10">
            我陪你走過我曾經走不過的路。
          </p>
          <Link to={ROUTES.BOOKING}>
            <Button variant="golden" size="xl" className="group">
              預約陪跑
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
