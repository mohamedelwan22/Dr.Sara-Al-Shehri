import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, CalendarDays, User as UserIcon, GraduationCap } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { queryKeys } from '@/services';
import { Card, CardBody, ErrorState, LoadingState, Badge } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { RecordView, MetricsRow } from '@/features/interactions/Interactions';
import { AxisTagsForSingle } from '@/features/scientific-map/AxisTags';
import type { ScientificSupervision } from '@/types';

export function DatedDetailPage({
  getFn,
  contentType,
  listPrefix,
}: {
  getFn: (slug: string) => Promise<ScientificSupervision | null>;
  contentType: 'supervision' | 'discussion';
  listPrefix: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const { slug } = useParams<{ slug: string }>();

  const query = useQuery({
    queryKey: queryKeys.supervision({ detail: slug }),
    queryFn: () => getFn(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />;

  const item = query.data;
  if (!item) return <ErrorState message={t('common.notFound')} />;

  const title = pickLang(item.title_ar, item.title_en, locale);
  const researcher = pickLang(item.researcher_ar, item.researcher_en, locale);
  const university = pickLang(item.university_ar, item.university_en, locale);
  const summary = pickLang(item.summary_ar, item.summary_en, locale);

  return (
    <>
      <Seo title={title ?? ''} description={summary ?? undefined} />
      <RecordView contentType={contentType} contentId={item.id} />

      <div className="container-page py-10">
        <Link to={`/${listPrefix}`} className="btn-ghost px-0">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('common.back')}
        </Link>

        <Card className="mt-4">
          <CardBody className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">
                <GraduationCap className="h-3.5 w-3.5" />
                {pickLang(item.degree ?? t('common.unknown'), null, locale)}
              </Badge>
              {item.completion_date && (
                <Badge tone="ivory">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(item.completion_date, locale)}
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold leading-relaxed text-primary-900 sm:text-3xl">{title}</h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slateGray-dark">
              {researcher && (
                <span className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-primary-400" />
                  <span>
                    <b className="text-primary-900">{t('supervision.researcher')}:</b> {researcher}
                  </span>
                </span>
              )}
              {university && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary-400" />
                  {university}
                </span>
              )}
            </div>

            {summary && (
              <div className="prose-arabic">
                <p>{summary}</p>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-display text-base font-bold text-primary-900">{t('research.relatedAxes')}</h3>
              <AxisTagsForSingle contentType={contentType} contentId={item.id} />
            </div>

            <div className="border-t border-primary-100 pt-4">
              <MetricsRow contentType={contentType} contentId={item.id} />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
