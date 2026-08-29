import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Building2, User as UserIcon } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { researchService, queryKeys } from '@/services';
import { Card, CardBody, ErrorState, LoadingState, Badge } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { contentFilePreviewUrl, isImageStoragePath } from '@/lib/storageFiles';
import { AxisTagsForSingle } from '@/features/scientific-map/AxisTags';
import { RecordView, MetricsRow, DocumentDownloadButton } from '@/features/interactions/Interactions';
import type { ResearchPaper } from '@/types';

export function WorkDetailPage({
  table,
  contentType,
  detailPrefix,
}: {
  table: 'research_papers' | 'publications';
  contentType: 'research' | 'publication';
  detailPrefix: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const { slug } = useParams<{ slug: string }>();

  const query = useQuery({
    queryKey: queryKeys.researchItem(slug ?? ''),
    queryFn: () => researchService.getBySlug(table, slug ?? ''),
    enabled: Boolean(slug),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />;

  const paper = query.data as ResearchPaper | null;
  if (!paper) {
    return <ErrorState message={t('common.notFound')} />;
  }

  const title = pickLang(paper.title_ar, paper.title_en, locale);
  const author = pickLang(paper.author_ar, paper.author_en, locale);
  const institution = pickLang(paper.institution_ar, paper.institution_en, locale);
  const abstract = pickLang(paper.abstract_ar, paper.abstract_en, locale);

  const hasImage = paper.image_path && isImageStoragePath(paper.image_path);
  const imageUrl = hasImage ? contentFilePreviewUrl(paper.image_path as string) : '';

  const researchBadgeText =
    paper.research_type ||
    (contentType === 'publication'
      ? t('home.researchType.publication')
      : t('home.researchType.research'));

  return (
    <>
      <Seo title={title ?? ''} description={abstract ?? undefined} />
      <RecordView contentType={contentType} contentId={paper.id} />

      <div className="container-page py-10">
        <Link to={detailPrefix === 'research' ? '/research' : '/research?tab=publication'} className="btn-ghost px-0 mb-4 inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('common.back')}
        </Link>

        <Card className="overflow-hidden">
          {hasImage && (
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-primary-950/10 border-b border-primary-100/60">
              <img src={imageUrl} alt={title ?? ''} className="h-full w-full object-cover" />
            </div>
          )}

          <CardBody className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">{researchBadgeText}</Badge>
              {paper.publication_year && (
                <Badge tone="primary">{paper.publication_year}</Badge>
              )}
              {paper.status === 'published' && <Badge tone="green">{t('common.published')}</Badge>}
            </div>

            <h1 className="font-display text-2xl font-bold leading-relaxed text-primary-900 sm:text-3xl">{title}</h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slateGray-dark">
              {author && (
                <span className="flex items-center gap-1.5 font-medium text-primary-800">
                  <UserIcon className="h-4 w-4 text-primary-500" />
                  {author}
                </span>
              )}
              {institution && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary-400" />
                  {institution}
                </span>
              )}
              {paper.published_at && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary-400" />
                  {formatDate(paper.published_at, locale)}
                </span>
              )}
            </div>

            {abstract && (
              <div>
                <h2 className="mb-2 font-display text-lg font-bold text-primary-900">{t('research.abstract')}</h2>
                <div className="prose-arabic">
                  <p className="leading-relaxed text-slateGray-dark">{abstract}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-display text-base font-bold text-primary-900">{t('research.relatedAxes')}</h3>
              <AxisTagsForSingle contentType={contentType} contentId={paper.id} />
            </div>

            <div className="border-t border-primary-100 pt-4">
              <MetricsRow contentType={contentType} contentId={paper.id} />
            </div>

            {paper.document_path && (
              <div className="border-t border-primary-100 pt-4">
                <DocumentDownloadButton
                  contentType={contentType}
                  contentId={paper.id}
                  storagePath={paper.document_path}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
