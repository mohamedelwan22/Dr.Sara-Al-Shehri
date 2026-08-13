import { ArticleListPage } from '@/features/articles/ArticleListPage';
import { ArticleDetailPage } from '@/features/articles/ArticleDetailPage';
import { newsService } from '@/services';

export function InsightsPage() {
  return (
    <ArticleListPage
      kind="insight"
      listFn={newsService.listInsights}
      titleKey="insights.title"
      subtitleKey="insights.subtitle"
      emptyKey="insights.noItems"
      seoTitleKey="insights.title"
    />
  );
}

export function InsightDetailPage() {
  return <ArticleDetailPage kind="insight" />;
}
