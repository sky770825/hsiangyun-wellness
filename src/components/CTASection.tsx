import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';

const CTASection = () => {
  return (
    <section className="py-24 bg-secondary/50 relative overflow-hidden">
      {/* 柔光背景 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 leading-relaxed">
            準備好開始這段旅程了嗎？
          </h2>
          
          <p className="text-muted-foreground font-body mb-4 leading-loose">
            我不會幫你變乖，<br />
            而是陪你找回你原本就很珍貴的樣子。
          </p>
          
          <p className="text-foreground font-body text-sm mb-10">
            每一個想改變的念頭，都值得被認真對待。
          </p>

          <Link to={ROUTES.BOOKING}>
            <Button variant="golden" size="xl" className="group">
              預約一對一陪跑
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
