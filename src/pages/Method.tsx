import { useLocation } from 'react-router-dom';
import { PageLayout } from '@/layouts';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import petalPattern from '@/assets/petal-pattern.jpg';
import { METHOD_PILLARS } from '@/data';
import { ROUTES } from '@/config/routes';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';

const Method = () => {
  const location = useLocation();
  usePageMeta('五金剛系統', '五個理解自己的角度，理解身體的語言。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] opacity-10">
          <img src={petalPattern} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              五金剛覺醒系統
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-loose">
              這不是五個「步驟」，而是五個理解自己的角度。<br />
              不需要照順序，不需要全部完成。<br />
              每個人的身體，都有自己的節奏。
            </p>
          </div>
        </div>
      </section>

      {/* Pillars Detail */}
      <section className="py-20 bg-card">
        <div className="section-container">
          <div className="max-w-3xl mx-auto space-y-16">
            {METHOD_PILLARS.map((pillar, index) => (
              <div key={pillar.id} className="relative">
                <div className="absolute -left-4 md:-left-16 top-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-display text-2xl text-accent">
                  {pillar.id}
                </div>

                <div className="pl-12 md:pl-0">
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                    {pillar.title}
                  </h2>

                  <blockquote className="text-accent font-display text-xl italic mb-6 pl-4 border-l-2 border-primary">
                    「{pillar.quote}」
                  </blockquote>

                  <p className="font-body text-muted-foreground leading-loose mb-6">
                    {pillar.description}
                  </p>

                  {pillar.insight && (
                    <div className="bg-secondary/50 rounded-2xl p-6">
                      <p className="font-body text-foreground text-sm leading-relaxed">
                        💡 {pillar.insight}
                      </p>
                    </div>
                  )}
                </div>

                {index < METHOD_PILLARS.length - 1 && (
                  <div className="w-px h-16 bg-border mx-auto mt-12" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-foreground mb-6">
            想更深入了解你的身體語言？
          </h2>
          <p className="text-muted-foreground font-body mb-10 max-w-xl mx-auto">
            一對一陪跑中，我會陪你找到屬於你的那把鑰匙。<br />
            不是一套方法，而是專屬於你的理解。
          </p>
          <Link to={ROUTES.BOOKING}>
            <Button variant="golden" size="xl" className="group">
              預約一對一陪跑
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default Method;
