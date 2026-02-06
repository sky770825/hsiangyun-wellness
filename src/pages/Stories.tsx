import { useLocation } from 'react-router-dom';
import { PageLayout } from '@/layouts';
import { Quote } from 'lucide-react';
import { STORIES, STORY_GALLERY_PHOTOS } from '@/data';
import { SafeImage } from '@/components/SafeImage';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';

const Stories = () => {
  const location = useLocation();
  usePageMeta('學員故事', '這些是真實的轉變故事，語言的改變是療癒的開始。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              語言被鬆動的地方
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-loose">
              這些是真實的轉變故事。<br />
              語言的改變，是療癒的開始；<br />
              若你願意，也可以在這裡看見他們經歷中的模樣。
            </p>
          </div>
        </div>
      </section>

      {/* Stories：每則故事可搭配一張「經歷照片」 */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            {STORIES.map((story, index) => (
              <div 
                key={index}
                className="bg-background rounded-3xl p-8 md:p-10 relative overflow-hidden"
              >
                <Quote className="absolute top-8 right-8 w-10 h-10 text-primary/10" />

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                    <span className="font-display text-2xl text-accent">{story.initial}</span>
                  </div>
                  <span className="text-muted-foreground font-body text-sm">{story.journey}</span>
                </div>

                <div className="mb-8">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-3">
                    曾經的自我對話
                  </span>
                  <p className="font-body text-foreground/70 italic text-lg leading-relaxed">
                    「{story.before}」
                  </p>
                </div>

                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs">轉化</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div>
                  <span className="text-xs text-accent uppercase tracking-widest block mb-3">
                    現在的自我理解
                  </span>
                  <p className="font-body text-foreground text-lg leading-relaxed">
                    「{story.after}」
                  </p>
                </div>

                {/* 經歷照片：瘦下來／轉變後的勵志照，可選 */}
                {story.imageUrl && (
                  <div className="mt-10 pt-8 border-t border-border">
                    <div className="rounded-2xl overflow-hidden shadow-lg bg-muted/50">
                      <SafeImage
                        src={story.imageUrl}
                        alt={story.imageCaption || '經歷的模樣'}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      {story.imageCaption && (
                        <p className="font-body text-sm text-muted-foreground text-center py-3 px-4">
                          {story.imageCaption}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 改變的模樣：勵志照片牆（不綁定單一故事） */}
      {STORY_GALLERY_PHOTOS.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="font-display text-3xl text-foreground mb-4">
                改變的模樣
              </h2>
              <p className="text-muted-foreground font-body">
                這些是願意分享的經歷——不是數字，而是活出來的樣子。
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {STORY_GALLERY_PHOTOS.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl overflow-hidden shadow-md bg-card border border-border card-hover"
                >
                  <SafeImage
                    src={photo.imageUrl}
                    alt={photo.caption || '經歷分享'}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  {photo.caption && (
                    <p className="font-body text-sm text-muted-foreground text-center py-3 px-4">
                      {photo.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Note */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground font-body text-sm italic">
              * 所有故事皆為真實個案分享，經本人同意使用。<br />
              為保護隱私，姓名以代號呈現，細節略有調整。
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Stories;
