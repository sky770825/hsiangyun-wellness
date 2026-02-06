import { useLocation } from 'react-router-dom';
import { PageLayout } from '@/layouts';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';
import { QuizFlow } from '@/components/QuizFlow';

const Quiz = () => {
  const location = useLocation();
  usePageMeta('假瘦語言測驗', '你是哪一種假瘦語言？5 分鐘了解你的身體正在說什麼。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <section className="pt-32 pb-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              你是哪一種假瘦語言？
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              5 分鐘，透過幾個選擇題，發現你對自己常說的語言類型。<br />
              沒有對錯，只是更認識自己。
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <QuizFlow />
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Quiz;
