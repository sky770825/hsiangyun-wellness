import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';
import ProfilePhoto from '@/components/ProfilePhoto';
import { HERO_QUOTES } from '@/data';
import { ROUTES } from '@/config/routes';

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_QUOTES.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景圖片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/60" />
      </div>

      {/* 發光效果 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-breathe" />
      
      {/* 內容 */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* 形象照 */}
          <div className="flex-shrink-0 image-float">
            <ProfilePhoto size="hero" showGlow />
          </div>

          {/* 文字內容 */}
          <div className="text-center lg:text-left space-y-10 flex-1">
            {/* 輪播語錄 */}
            <div className="min-h-[160px] flex items-center justify-center lg:justify-start">
              <h1 
                className={`font-display text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                「{HERO_QUOTES[currentIndex]}」
              </h1>
            </div>

            {/* 指示點 */}
            <div className="flex justify-center lg:justify-start gap-3">
              {HERO_QUOTES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                      setCurrentIndex(index);
                      setIsVisible(true);
                    }, 300);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`語錄 ${index + 1}`}
                />
              ))}
            </div>

            {/* CTA 按鈕 */}
            <div>
              <Link to={ROUTES.ABOUT}>
                <Button variant="hero" size="xl" className="group hover-lift">
                  開始認識我
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 底部漸層 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
