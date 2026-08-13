import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card, CardBody, CardTitle, Badge } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { AxisTagsForItems } from '@/features/scientific-map/AxisTags';
import type { ResearchPaper } from '@/types';

export function ResearchCard({
  paper,
  contentType,
  detailPrefix,
  locale,
}: {
  paper: ResearchPaper;
  contentType: 'research' | 'publication';
  detailPrefix: string;
  locale: 'ar' | 'en';
}) {
  const { t } = useTranslation();
  const title = pickLang(paper.title_ar, paper.title_en, locale);
  const institution = pickLang(paper.institution_ar, paper.institution_en, locale);

  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-400" />
            <Badge tone="primary">{paper.publication_year ?? t('common.unknown')}</Badge>
          </div>
          {institution && (
            <Badge tone="ivory" className="max-w-[55%] truncate">
              {institution}
            </Badge>
          )}
        </div>

        <CardTitle className="mb-2 line-clamp-2 min-h-[3.5rem]">
          <Link to={`/${detailPrefix}/${paper.slug}`} className="transition-colors hover:text-primary-600">
            {title}
          </Link>
        </CardTitle>

        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slateGray-dark">
          {pickLang(paper.abstract_ar, paper.abstract_en, locale) ?? ''}
        </p>

        <div className="mt-auto space-y-3">
          <AxisTagsForItems contentType={contentType} contentIds={[paper.id]} renderContentId={paper.id} />
          <p className="text-xs text-slateGray">{formatDate(paper.published_at, locale)}</p>
          <Link to={`/${detailPrefix}/${paper.slug}`} className="btn-ghost px-0">
            {t('common.readMore')} <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
