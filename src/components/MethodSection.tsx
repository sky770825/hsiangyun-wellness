import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import petalPattern from '@/assets/petal-pattern.jpg';
import { SafeImage } from '@/components/SafeImage';
import { METHOD_PILLARS } from '@/data';

const MethodSection = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-10">
        <SafeImage src={petalPattern} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            五金剛覺醒系統
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            這不是一套「減肥方法」，而是五個理解自己的入口。<br />
            每一個金剛，都是一把溫柔的鑰匙。
          </p>
        </div>

        {/* 五金剛展開列表 */}
        <div className="max-w-2xl mx-auto space-y-4">
          {METHOD_PILLARS.map((pillar) => (
            <div 
              key={pillar.id}
              className="card-pearl rounded-2xl overflow-hidden transition-all duration-500"
            >
              <button
                onClick={() => setActiveId(activeId === pillar.id ? null : pillar.id)}
                className="w-full p-6 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-display text-lg text-accent">
                    {pillar.id}
                  </span>
                  <span className="font-display text-lg text-foreground group-hover:text-accent transition-colors">
                    {pillar.title}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                    activeId === pillar.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div 
                className={`transition-all duration-500 overflow-hidden ${
                  activeId === pillar.id ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-border">
                  <p className="font-display text-accent italic mb-4">
                    「{pillar.quote}」
                  </p>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodSection;
