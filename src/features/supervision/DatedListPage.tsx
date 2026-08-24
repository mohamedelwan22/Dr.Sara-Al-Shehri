import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  User as UserIcon,
  GraduationCap,
  UserCheck,
  Eye,
  Download,
  Share2,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { supervisionService, queryKeys } from '@/services';
import { SkeletonGrid, ErrorState, EmptyState, Pagination } from '@/components/ui';
import { pickLang, formatDate, formatNumber } from '@/lib/utils';
import { useContentMetrics } from '@/hooks/useInteractions';
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
  supervisionTypeLabel,
  completionDateLabel,
}: {
  listFn: typeof supervisionService.listSupervision;
  titleKey: string;
  subtitleKey: string;
  emptyKey: string;
  detailPrefix: string;
  contentType: string;
  seoTitleKey: string;
  supervisionTypeLabel?: string;
  completionDateLabel?: string;
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
      <div className="container-page py-8 sm:py-10">
        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t(emptyKey)} />
        ) : (
          <>
            {/* 3 Cards per row on Desktop, 2 on Tablet, 1 on Mobile */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <DatedCard
                  key={item.id}
                  item={item as ScientificSupervision}
                  locale={locale}
                  detailPrefix={detailPrefix}
                  contentType={contentType}
                  supervisionTypeLabel={supervisionTypeLabel}
                  completionDateLabel={completionDateLabel}
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
  supervisionTypeLabel,
  completionDateLabel,
}: {
  item: ScientificSupervision;
  locale: 'ar' | 'en';
  detailPrefix: string;
  contentType: string;
  supervisionTypeLabel?: string;
  completionDateLabel?: string;
}) {
  const { t } = useTranslation();
  const { data: metrics } = useContentMetrics(contentType, item.id);

  const researcher = pickLang(item.researcher_ar, item.researcher_en, locale);
  const university = pickLang(item.university_ar, item.university_en, locale);
  const titleText = pickLang(item.title_ar, item.title_en, locale);
  const degreeText = (item.degree ? pickLang(item.degree, null, locale) : null) || t('supervision.degree') || 'دكتوراة';
  const statusText = item.status === 'published' ? (t('supervision.awarded') || 'مجازة') : (t('supervision.inProgress') || 'قيد الدراسة');
  const typeText = detailPrefix === 'supervision' ? (t('supervision.thesisType') || 'رسالة علمية') : (t('supervision.discussionType') || 'مناقشة علمية');
  
  const supervisorLabel = supervisionTypeLabel || t('supervision.supervisor') || 'نوع الإشراف';
  const dateLabel = completionDateLabel || t('supervision.completionDate') || 'سنة الإجازة';
  
  const supervisorText = degreeText.includes('ماجستير')
    ? (detailPrefix === 'discussions' ? 'عضو مناقش' : (t('supervision.assistantSupervision') || 'إشراف مساعد'))
    : (detailPrefix === 'discussions' ? 'مناقش رئيسي' : (t('supervision.mainSupervision') || 'إشراف رئيس'));

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E7DFED] bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
      {/* Bookmark Ribbon (Top Left in RTL) */}
      <div className="absolute top-0 start-4 z-10 flex flex-col items-center pointer-events-none">
        <div
          className="flex h-11 w-8 items-start justify-center pt-1.5 bg-[#35145C] text-[#D89A16] shadow-2xs"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)' }}
        >
          <span className="text-xs font-bold">❖</span>
        </div>
      </div>

      {/* Header Bar Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 ps-7 pt-1">
        {/* Type Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#F3E5C8] bg-[#FDF9F0] px-3 py-1 text-[11px] font-bold text-[#35145C]">
          <span>❖</span>
          <span>{typeText}</span>
          <FileText className="h-3.5 w-3.5 text-[#D89A16]" />
        </div>

        {/* Status & Degree Badges */}
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-[#E7DFED] bg-[#F5F0FA] px-2.5 py-0.5 text-[10px] font-bold text-[#35145C]">
            {statusText}
          </span>
          <span className="flex items-center gap-1 rounded-lg border border-[#E7DFED] bg-[#F5F0FA] px-2 py-0.5 text-[10px] font-bold text-[#35145C]">
            <GraduationCap className="h-3 w-3 text-[#35145C]" />
            {degreeText}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="my-4 text-center">
        <h3 className="line-clamp-2 min-h-[3rem] flex items-center justify-center font-display text-base sm:text-lg font-bold leading-snug text-[#35145C]">
          <Link to={`/${detailPrefix}/${item.slug}`} className="transition-colors hover:text-primary-600">
            {titleText}
          </Link>
        </h3>

        {/* Gold Divider Line */}
        <div className="relative my-3 flex h-px w-full items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/40 to-transparent">
          <span className="absolute bg-white px-1.5 text-[9px] text-[#D89A16]">❖</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="my-2 rounded-2xl border border-[#E7DFED]/80 bg-[#FAF8FC] p-3.5">
        <div className="grid grid-cols-2 gap-3 text-start">
          {/* Item 1: الباحث */}
          <div className="border-b border-[#E7DFED]/50 pb-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
              <UserIcon className="h-3 w-3 text-[#35145C]" />
              {t('supervision.researcher') || 'الباحث'}
            </span>
            <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">
              {researcher || 'أحمد محمد'}
            </span>
          </div>

          {/* Item 2: صفة المشاركة / نوع الإشراف */}
          <div className="border-b border-[#E7DFED]/50 pb-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
              <UserCheck className="h-3 w-3 text-[#35145C]" />
              {supervisorLabel}
            </span>
            <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">
              {supervisorText}
            </span>
          </div>

          {/* Item 3: الجامعة */}
          <div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
              <Building2 className="h-3 w-3 text-[#35145C]" />
              {t('supervision.university') || 'الجامعة'}
            </span>
            <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">
              {university || 'جامعة الإمام عبد الرحمن'}
            </span>
          </div>

          {/* Item 4: تاريخ المناقشة / سنة الإجازة */}
          <div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
              <CalendarDays className="h-3 w-3 text-[#35145C]" />
              {dateLabel}
            </span>
            <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">
              {item.completion_date ? formatDate(item.completion_date, locale) : '2024م'}
            </span>
          </div>
        </div>
      </div>

      {/* View Summary Button */}
      <div className="my-3 text-center">
        <Link
          to={`/${detailPrefix}/${item.slug}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#35145C] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#2A104A] hover:shadow-md active:scale-95"
        >
          <Eye className="h-4 w-4" />
          <span>{t('supervision.viewSummary') || 'عرض الملخص'}</span>
        </Link>
      </div>

      {/* Statistics Strip */}
      <div className="-mx-5 -mb-5 mt-2 flex items-center justify-around border-t border-[#E7DFED]/80 bg-[#FAF8FC] px-3 py-2.5 text-center rounded-b-3xl">
        {/* Downloads */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600" title={t('common.downloads') || 'التنزيلات'}>
          <Download className="h-3.5 w-3.5 text-[#35145C]" />
          <span>{formatNumber(metrics?.downloads ?? 0)}</span>
        </div>

        <div className="h-3 w-px bg-[#E7DFED]" />

        {/* Shares */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600" title={t('common.shares') || 'المشاركات'}>
          <Share2 className="h-3.5 w-3.5 text-[#35145C]" />
          <span>{formatNumber(metrics?.shares ?? 0)}</span>
        </div>

        <div className="h-3 w-px bg-[#E7DFED]" />

        {/* Views */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600" title={t('common.views') || 'المشاهدات'}>
          <Eye className="h-3.5 w-3.5 text-[#35145C]" />
          <span>{formatNumber(metrics?.views ?? 0)}</span>
        </div>

        <div className="h-3 w-px bg-[#E7DFED]" />

        {/* Favorite Button */}
        <div className="flex items-center gap-1">
          <FavoriteButton contentType={contentType} contentId={item.id} />
          <span className="text-[11px] font-bold text-slate-600">{formatNumber(metrics?.favorites ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
