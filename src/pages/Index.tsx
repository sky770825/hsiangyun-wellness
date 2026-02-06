import Navigation from '@/components/Navigation';
import { FloatingSocialBar } from '@/components/FloatingSocialBar';
import HeroSection from '@/components/HeroSection';
import IntroSection from '@/components/IntroSection';
import MethodSection from '@/components/MethodSection';
import TestimonialSection from '@/components/TestimonialSection';
import ShortVideoSection from '@/components/ShortVideoSection';
import ResourcesSection from '@/components/ResourcesSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { usePageMeta } from '@/hooks/usePageMeta';

const Index = () => {
  usePageMeta('首頁', '陪你回到身體的安全感，找回與自己和解的力量。');
  return (
    <div className="min-h-screen">
      <Navigation />
      <FloatingSocialBar />
      <HeroSection />
      <IntroSection />
      <MethodSection />
      <TestimonialSection />
      <ShortVideoSection />
      <ResourcesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
