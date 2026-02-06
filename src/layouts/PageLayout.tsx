import { type ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FloatingSocialBar } from '@/components/FloatingSocialBar';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';

interface PageLayoutProps {
  children: ReactNode;
  /** 麵包屑項目（選填），不傳則不顯示 */
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * 內頁共用版型：固定導覽 + 可選麵包屑 + 內容 + 頁尾
 */
const PageLayout = ({ children, breadcrumbs }: PageLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <FloatingSocialBar />
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;
