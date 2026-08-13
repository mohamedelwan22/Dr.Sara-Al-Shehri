import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Layers } from 'lucide-react';
import { Card, CardBody, CardTitle, Badge } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { AxisWithCounts } from '@/services';

const GROUP_KEYS = ['research', 'publication', 'supervision', 'discussion', 'project', 'course', 'lecture'] as const;

export function AxisCard({ axis, locale }: { axis: AxisWithCounts; locale: 'ar' | 'en' }) {
  const { t } = useTranslation();
  const total = GROUP_KEYS.reduce((sum, key) => sum + (axis.counts[key] ?? 0), 0);

  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
            <Layers className="h-6 w-6" />
          </div>
          <Badge tone="ivory">
            {total} {t('map.count')}
          </Badge>
        </div>

        <CardTitle className="mb-2">{pickLang(axis.name_ar, axis.name_en, locale)}</CardTitle>
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slateGray-dark">
          {pickLang(axis.description_ar, axis.description_en, locale)}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {GROUP_KEYS.filter((key) => (axis.counts[key] ?? 0) > 0).map((key) => (
            <Badge key={key} tone="primary">
              {t(`map.groups.${key}`)}: {axis.counts[key]}
            </Badge>
          ))}
          {total === 0 && <Badge tone="gray">{t('map.noContent')}</Badge>}
        </div>

        <Link to={`/scientific-map/${axis.slug}`} className="btn-ghost mt-4 px-0">
          {t('common.view')} <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </CardBody>
    </Card>
  );
}
