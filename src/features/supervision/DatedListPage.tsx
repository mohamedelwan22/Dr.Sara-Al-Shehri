import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, User as UserIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { supervisionService, queryKeys } from '@/services';
import { Card, CardBody, CardTitle, Badge, SkeletonGrid, ErrorState, EmptyState, Pagination } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
import type { ScientificSupervision } from '@/types';

export function DatedListPage({
  listFn,
  titleKey,
  subtitleKey,
  emptyKey,
  detailPrefix,
  contentType,
  seoTitleKey,
}: {
  listFn: typeof supervisionService.listSupervision;
  titleKey: string;
  subtitleKey: string;
  emptyKey: string;
  detailPrefix: string;
  contentType: string;
  seoTitleKey: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const query = useQuery({
    queryKey: queryKeys.supervision({ page }),
    queryFn: () => listFn({ page }),
  });

  const items = query.data?.data ?? [];

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
              {items.map((item) => (
                <DatedCard
                  key={item.id}
                  item={item as ScientificSupervision}
                  locale={locale}
                  detailPrefix={detailPrefix}
                  contentType={contentType}
                />
              ))}
            </div>
            {query.data && query.data.totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={query.data.totalPages}
                  onChange={(next) => {
                    const params = new URLSearchParams(searchParams);
                    if (next === 1) params.delete('page');
                    else params.set('page', String(next));
                    setSearchParams(params);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function DatedCard({
  item,
  locale,
  detailPrefix,
  contentType,
}: {
  item: ScientificSupervision;
  locale: 'ar' | 'en';
  detailPrefix: string;
  contentType: string;
}) {
  const { t } = useTranslation();
  const researcher = pickLang(item.researcher_ar, item.researcher_en, locale);
  const university = pickLang(item.university_ar, item.university_en, locale);
  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Badge tone="gold">{pickLang(item.degree ?? t('common.unknown'), null, locale)}</Badge>
          <div className="flex items-center gap-2">
            {item.completion_date && (
              <span className="flex items-center gap-1 text-xs font-bold text-slateGray">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(item.completion_date, locale)}
              </span>
            )}
            <FavoriteButton contentType={contentType} contentId={item.id} />
          </div>
        </div>
        <CardTitle className="mb-2 line-clamp-2 min-h-[3.5rem]">
          <Link to={`/${detailPrefix}/${item.slug}`} className="transition-colors hover:text-primary-600">
            {pickLang(item.title_ar, item.title_en, locale)}
          </Link>
        </CardTitle>
        <div className="mt-auto space-y-1.5 text-sm text-slateGray-dark">
          {researcher && (
            <p className="flex items-center gap-1.5">
              <UserIcon className="h-4 w-4 text-primary-400" />
              <span>
                <b className="text-primary-900">{t('supervision.researcher')}:</b> {researcher}
              </span>
            </p>
          )}
          {university && (
            <p className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary-400" />
              <span>{university}</span>
            </p>
          )}
        </div>
        <Link to={`/${detailPrefix}/${item.slug}`} className="btn-ghost mt-3 px-0">
          {t('common.readMore')} <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </CardBody>
    </Card>
  );
}
