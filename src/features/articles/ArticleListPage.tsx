import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Newspaper, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { newsService, queryKeys } from '@/services';
import { Card, CardBody, CardTitle, SkeletonGrid, ErrorState, EmptyState, Pagination } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import type { News } from '@/types';

export function ArticleListPage({
  kind,
  listFn,
  titleKey,
  subtitleKey,
  emptyKey,
  seoTitleKey,
}: {
  kind: 'news' | 'insight';
  listFn: typeof newsService.listNews;
  titleKey: string;
  subtitleKey: string;
  emptyKey: string;
  seoTitleKey: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [page, setPage] = useState(1);
  const filters = useMemo(() => ({ page }), [page]);

  const query = useQuery({
    queryKey: kind === 'news' ? queryKeys.news(filters) : queryKeys.insights(filters),
    queryFn: () => listFn(filters),
  });

  const items = query.data?.data ?? [];
  const Icon = kind === 'news' ? Newspaper : Sparkles;
  const prefix = kind === 'news' ? 'news' : 'insights';

  return (
    <>
      <Seo title={t(seoTitleKey)} description={t(subtitleKey)} />
      <PageHeader title={t(titleKey)} subtitle={t(subtitleKey)} />
      <div className="container-page py-10">
        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t(emptyKey)} />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item: News) => (
                <Card key={item.id} className="flex h-full flex-col">
                  <CardBody className="flex flex-1 flex-col">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-slateGray">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(item.published_at, locale)}
                      </span>
                    </div>
                    <CardTitle className="mb-2 line-clamp-2">
                      <Link to={`/${prefix}/${item.slug}`} className="transition-colors hover:text-primary-600">
                        {pickLang(item.title_ar, item.title_en, locale)}
                      </Link>
                    </CardTitle>
                    <p className="line-clamp-3 text-sm leading-relaxed text-slateGray-dark">
                      {pickLang(item.excerpt_ar, item.excerpt_en, locale)}
                    </p>
                    <div className="mt-auto pt-3">
                      <Link to={`/${prefix}/${item.slug}`} className="btn-ghost px-0">
                        {t('common.readMore')} <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
            {query.data && query.data.totalPages > 1 && (
              <Pagination page={page} totalPages={query.data.totalPages} onChange={setPage} />
            )}
          </>
        )}
      </div>
    </>
  );
}
