import { Flower2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScrollReveal from '@/components/ScrollReveal';
import { INTRO_FEATURES, INTRO_TRANSFORMATION_PREVIEW } from '@/data';
import { ROUTES } from '@/config/routes';

const IntroSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        {/* 品牌理念 */}
        <ScrollReveal className="max-w-2xl mx-auto text-center mb-20">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
            這裡不是健身房，是你的避風港
          </h2>
          <p className="text-muted-foreground font-body leading-loose">
            多年來，你可能已經嘗試過無數方法——節食、運動、各種計畫。<br />
            但身體的改變，從來不是靠「更努力」就能達成。<br />
            <span className="text-foreground">真正的轉變，從被理解開始。</span>
          </p>
        </ScrollReveal>

        {/* 特色卡片 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {INTRO_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={index} delay={index * 0.15}>
                <div className="card-pearl p-8 rounded-2xl hover-lift text-center h-full">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center hover-glow transition-all">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* 轉化語言預覽 */}
        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto bg-secondary/50 rounded-3xl p-10 md:p-14 hover-scale-subtle">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Flower2 className="w-5 h-5 text-accent" />
              <span className="font-display text-lg text-foreground">語言的轉化</span>
              <Flower2 className="w-5 h-5 text-accent" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Before</span>
                <p className="font-body text-foreground/80 italic">
                  {INTRO_TRANSFORMATION_PREVIEW.before}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-xs text-accent uppercase tracking-widest">After</span>
                <p className="font-body text-foreground">
                  {INTRO_TRANSFORMATION_PREVIEW.after}
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link to={ROUTES.ABOUT}>
                <Button variant="gentle" size="lg" className="hover-lift">
                  了解更多我的故事
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntroSection;
