import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RESOURCES } from '@/data';

const ResourcesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            溫柔的開始
          </h2>
          <p className="text-muted-foreground font-body">
            不需要承諾什麼，只要願意，就可以開始。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {RESOURCES.map((resource, index) => {
            const Icon = resource.icon;
            return (
            <Link 
              key={index}
              to={resource.link}
              className="group"
            >
              <div className="card-pearl rounded-3xl p-8 h-full card-hover text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  {resource.title}
                </span>
                
                <h3 className="font-display text-xl text-foreground mt-2 mb-3">
                  {resource.subtitle}
                </h3>
                
                <p className="text-muted-foreground font-body text-sm mb-6">
                  {resource.description}
                </p>

                <span className="inline-flex items-center gap-2 text-accent font-body text-sm group-hover:gap-3 transition-all">
                  {resource.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
