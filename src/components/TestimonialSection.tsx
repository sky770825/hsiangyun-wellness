import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/data';

const TestimonialSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            語言被鬆動的地方
          </h2>
          <p className="text-muted-foreground font-body">
            這些是真實的轉變，來自願意相信自己值得被溫柔對待的人。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {TESTIMONIALS.map((item, index) => (
            <div 
              key={index}
              className="bg-background rounded-3xl p-8 card-hover relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              
              {/* Initial */}
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-6">
                <span className="font-display text-xl text-accent">{item.initial}</span>
              </div>

              {/* Before */}
              <div className="mb-6">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">
                  Before
                </span>
                <p className="font-body text-foreground/70 italic text-sm leading-relaxed">
                  「{item.before}」
                </p>
              </div>

              {/* Divider */}
              <div className="w-12 h-px bg-primary/30 mb-6" />

              {/* After */}
              <div>
                <span className="text-xs text-accent uppercase tracking-widest block mb-2">
                  After
                </span>
                <p className="font-body text-foreground text-sm leading-relaxed">
                  「{item.after}」
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
