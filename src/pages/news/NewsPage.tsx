import { ArticleListPage } from '@/features/articles/ArticleListPage';
import { ArticleDetailPage } from '@/features/articles/ArticleDetailPage';
import { newsService } from '@/services';

export function NewsPage() {
  return (
    <ArticleListPage
      kind="news"
      listFn={newsService.listNews}
      titleKey="news.title"
      subtitleKey="news.subtitle"
      emptyKey="news.noItems"
      seoTitleKey="news.title"
    />
  );
}

export function NewsDetailPage() {
  return <ArticleDetailPage kind="news" />;
}
