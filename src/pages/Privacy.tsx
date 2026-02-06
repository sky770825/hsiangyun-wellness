import { useLocation, Link } from 'react-router-dom';
import { PageLayout } from '@/layouts';
import { ROUTES, LINE_OFFICIAL_URL } from '@/config';
import { getBreadcrumbsForPath } from '@/components/Breadcrumbs';
import { usePageMeta } from '@/hooks/usePageMeta';

const Privacy = () => {
  const location = useLocation();
  usePageMeta('隱私權政策', '我們如何蒐集、使用與保護您的個人資料。');
  const breadcrumbs = getBreadcrumbsForPath(location.pathname);

  return (
  <PageLayout breadcrumbs={breadcrumbs}>
    <section className="pt-32 pb-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="font-display text-4xl text-foreground mb-8">隱私權政策</h1>
        <div className="font-body text-muted-foreground space-y-6">
          <p>歡迎使用本網站。我們重視您的隱私，以下說明我們如何蒐集、使用與保護您的個人資料。</p>
          <h2 className="font-display text-xl text-foreground mt-8">一、蒐集之資料</h2>
          <p>當您填寫預約表單或訂閱時，我們可能蒐集：姓名、電子信箱、您主動填寫的訊息內容。</p>
          <h2 className="font-display text-xl text-foreground mt-8">二、使用目的</h2>
          <p>僅用於回覆您的預約、提供您所請求的服務與資訊，以及改善我們的服務品質。</p>
          <h2 className="font-display text-xl text-foreground mt-8">三、保護與保存</h2>
          <p>您的資料將被安全保管，不會出售或提供給無關第三人。我們僅在必要範圍內保存資料。</p>
          <h2 className="font-display text-xl text-foreground mt-8">四、您的權利</h2>
          <p>您可要求查詢、更正或刪除您的個人資料，請透過預約表單或網站所載聯絡方式與我們聯繫。您亦可透過<a href={LINE_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">官方 LINE</a>與我們聯繫。</p>
          <p className="mt-8">
            <Link to={ROUTES.HOME} className="text-primary underline hover:no-underline">返回首頁</Link>
          </p>
        </div>
      </div>
    </section>
  </PageLayout>
  );
};

export default Privacy;
