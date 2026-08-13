import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Newspaper, Sparkles } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { newsService, queryKeys } from '@/services';
import { Card, CardBody, ErrorState, LoadingState, Badge } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { RecordView, MetricsRow } from '@/features/interactions/Interactions';

export function ArticleDetailPage({ kind }: { kind: 'news' | 'insight' }) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const { slug } = useParams<{ slug: string }>();

  const getFn = kind === 'news' ? newsService.getNewsBySlug : newsService.getInsightBySlug;
  const query = useQuery({
    queryKey: kind === 'news' ? queryKeys.newsItem(slug ?? '') : queryKeys.insights({ detail: slug }),
    queryFn: () => getFn(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />;

  const item = query.data;
  if (!item) return <ErrorState message={t('common.notFound')} />;

  const title = pickLang(item.title_ar, item.title_en, locale);
  const body = pickLang(item.body_ar, item.body_en, locale);
  const Icon = kind === 'news' ? Newspaper : Sparkles;
  const prefix = kind === 'news' ? 'news' : 'insights';

  return (
    <>
      <Seo title={title ?? ''} description={pickLang(item.excerpt_ar, item.excerpt_en, locale) ?? undefined} />
      <RecordView contentType={kind} contentId={item.id} />

      <div className="container-page py-10">
        <Link to={`/${prefix}`} className="btn-ghost px-0">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('common.back')}
        </Link>

        <Card className="mt-4">
          <CardBody className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">
                <Icon className="h-3.5 w-3.5" />
                {t(kind === 'news' ? 'nav.news' : 'nav.insights')}
              </Badge>
              {item.published_at && (
                <Badge tone="ivory">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(item.published_at, locale)}
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold leading-relaxed text-primary-900 sm:text-3xl">{title}</h1>

            {body ? (
              <div className="prose-arabic">
                {body.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-slateGray-dark">{pickLang(item.excerpt_ar, item.excerpt_en, locale)}</p>
            )}

            <div className="border-t border-primary-100 pt-4">
              <MetricsRow contentType={kind} contentId={item.id} />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
