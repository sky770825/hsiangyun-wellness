import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { SHORT_VIDEOS, getTikTokEmbedUrl, isEmbedVideo } from '@/data';
import { SafeImage } from '@/components/SafeImage';
import { ExternalLink } from 'lucide-react';

const ShortVideoSection = () => {
  if (SHORT_VIDEOS.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            更多片刻
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            短影音與日常分享——用另一種方式，陪你靠近身體與自己。
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {SHORT_VIDEOS.map((item) => {
                const embedUrl = getTikTokEmbedUrl(item);
                const isEmbed = isEmbedVideo(item);

                return (
                  <CarouselItem
                    key={item.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-md hover:shadow-lg transition-shadow">
                      {isEmbed && embedUrl ? (
                        <div className="aspect-[9/16] max-h-[480px] w-full bg-muted">
                          <iframe
                            src={embedUrl}
                            title={item.title || '短影音'}
                            className="w-full h-full"
                            allowFullScreen
                            allow="encrypted-media; fullscreen"
                          />
                        </div>
                      ) : (
                        <a
                          href={item.linkUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-[9/16] max-h-[480px] w-full bg-muted relative group"
                        >
                          {item.thumbnail ? (
                            <SafeImage
                              src={item.thumbnail}
                              alt={item.title || '短影音'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ExternalLink className="w-12 h-12 opacity-50 group-hover:opacity-80" />
                            </div>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="font-body text-sm text-white bg-black/50 px-3 py-2 rounded-lg">
                              前往觀看
                            </span>
                          </span>
                        </a>
                      )}
                      {item.title && (
                        <p className="font-body text-sm text-foreground text-center py-3 px-4 line-clamp-2">
                          {item.title}
                        </p>
                      )}
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-2 md:-left-12" />
            <CarouselNext className="-right-2 md:-right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ShortVideoSection;
