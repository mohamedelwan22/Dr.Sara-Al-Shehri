import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BookMarked, BookOpen, FileText, GraduationCap, Sparkles } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { Skeleton } from '@/components/ui';
import { selectionsService, queryKeys } from '@/services';
import { ScientificSelectionCard } from '@/features/selections/ScientificSelectionCard';
import type { ScientificSelection } from '@/types';

export function ScientificSelectionsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const selectionsQuery = useQuery({
    queryKey: queryKeys.scientificSelections(),
    queryFn: () => selectionsService.listAll(),
    retry: 1,
  });

  const allSelections = selectionsQuery.data ?? [];

  const researchItems = allSelections.filter((item) => item.section === 'selected_research');
  const publicationItems = allSelections.filter((item) => item.section === 'selected_publications');
  const thesisItems = allSelections.filter((item) => item.section === 'distinguished_theses');

  return (
    <>
      <Seo
        title={`${t('selections.pageTitle')} | ${t('seo.homeTitle')}`}
        description={t('selections.pageDescription')}
      />

      <div className="container-page py-6">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E7DFED] bg-gradient-to-r from-[#35145C] via-[#451C75] to-[#35145C] p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D89A16_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D89A16]/40 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#F3E7C4] backdrop-blur-sm">
              <BookMarked className="h-4 w-4 text-[#D89A16]" />
              <span>{t('selections.badge')}</span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl text-white">
              {t('selections.pageTitle')}
            </h1>

            <p className="mt-2 text-xs font-bold leading-relaxed text-[#E5D7F2] sm:text-sm">
              {t('selections.pageDescription')}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-0.5 w-12 bg-[#D89A16]" />
              <span className="text-xs text-[#D89A16]">❖</span>
              <span className="h-0.5 w-12 bg-[#D89A16]" />
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {selectionsQuery.isPending ? (
          <div className="mt-8 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-44 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : selectionsQuery.isError ? (
          <div className="mt-8 rounded-xl border border-red-100 bg-red-50/60 p-6 text-center text-xs font-bold text-red-800">
            <p>{t('errors.generic')}</p>
            <button
              type="button"
              onClick={() => void selectionsQuery.refetch()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs text-red-700 hover:bg-red-50"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            {/* 1. Selected Research Section */}
            <SelectionSectionGroup
              title={t('selections.sections.selected_research')}
              subtitle={t('selections.subtitles.selected_research')}
              icon={FileText}
              items={researchItems}
              locale={locale}
              emptyText={t('selections.empty.selected_research')}
            />

            {/* 2. Selected Publications Section */}
            <SelectionSectionGroup
              title={t('selections.sections.selected_publications')}
              subtitle={t('selections.subtitles.selected_publications')}
              icon={BookOpen}
              items={publicationItems}
              locale={locale}
              emptyText={t('selections.empty.selected_publications')}
            />

            {/* 3. Distinguished Theses Section */}
            <SelectionSectionGroup
              title={t('selections.sections.distinguished_theses')}
              subtitle={t('selections.subtitles.distinguished_theses')}
              icon={GraduationCap}
              items={thesisItems}
              locale={locale}
              emptyText={t('selections.empty.distinguished_theses')}
            />
          </div>
        )}
      </div>
    </>
  );
}

function SelectionSectionGroup({
  title,
  subtitle,
  icon: Icon,
  items,
  locale,
  emptyText,
}: {
  title: string;
  subtitle: string;
  icon: typeof FileText;
  items: ScientificSelection[];
  locale: 'ar' | 'en';
  emptyText: string;
}) {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-[#E7DFED] pb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#35145C] text-white shadow-sm">
          <Icon className="h-5 w-5 text-[#D89A16]" />
        </div>
        <div>
          <h2 className="font-display text-xl font-extrabold text-[#35145C]">{title}</h2>
          <p className="text-xs font-medium text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Section Content */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E7DFED] bg-[#FDFBF7] p-8 text-center text-xs font-bold text-slate-500">
          <Sparkles className="mx-auto h-8 w-8 text-[#35145C]/30" />
          <p className="mt-2">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {items.map((item) => (
            <ScientificSelectionCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
