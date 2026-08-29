import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookMarked,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import type { ScientificSelection } from '@/types';
import { contentFilePreviewUrl } from '@/lib/storageFiles';
import { pickLang } from '@/lib/utils';
import { useToast } from '@/components/ui';
import { interactionService } from '@/services/interactionService';
import { ScientificSelectionActions } from './ScientificSelectionActions';

interface ScientificSelectionCardProps {
  item: ScientificSelection;
  locale: 'ar' | 'en';
}

export function ScientificSelectionCard({ item, locale }: ScientificSelectionCardProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const title = pickLang(item.title_ar, item.title_en, locale) || item.title_ar;
  const subtitle = pickLang(item.subtitle_ar, item.subtitle_en, locale);
  const author = pickLang(item.author_ar, item.author_en, locale);
  const university = pickLang(item.university_ar, item.university_en, locale);
  const journal = pickLang(item.journal_ar, item.journal_en, locale);
  const summary = pickLang(item.summary_ar, item.summary_en, locale);

  const coverUrl = item.image_path ? contentFilePreviewUrl(item.image_path) : null;
  const hasDocument = Boolean(item.document_path);
  const readTargetUrl = item.read_url || null;

  const handleSummary = () => {
    if (summary && summary.trim().length > 0) {
      setShowSummaryModal(true);
    } else {
      toast.info(t('selections.noSummaryAvailable'));
    }
  };

  const openDocument = async () => {
    if (!item.document_path) {
      toast.info(t('selections.noDocumentAttached'));
      return;
    }
    try {
      const { url } = await interactionService.getDocumentUrl('selection', item.id, item.document_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('errors.')) toast.error(t(message));
      else toast.error(t('errors.uploadFailed'));
    }
  };

  const handleDownload = async () => {
    if (!item.document_path) {
      toast.info(t('selections.noDocumentAttached'));
      return;
    }
    try {
      await interactionService.triggerDownload('selection', item.id, item.document_path);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('errors.')) toast.error(t(message));
      else toast.error(t('errors.uploadFailed'));
    }
  };

  const handleRead = () => {
    if (readTargetUrl) {
      window.open(readTargetUrl, '_blank', 'noopener,noreferrer');
    } else if (item.document_path) {
      void openDocument();
    } else {
      toast.info(t('selections.noReadLinkAvailable'));
    }
  };

  // 1. Render Variant: Selected Research (أبحاث مختارة - Ref Image 1)
  if (item.section === 'selected_research') {
    return (
      <>
        <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-[#E7DFED] bg-white p-5 shadow-[0_4px_20px_rgb(53_20_92_/_0.05)] transition-all duration-300 hover:border-[#D89A16]/50 hover:shadow-[0_10px_30px_rgb(53_20_92_/_0.12)]">
          <div>
            {/* Header Badge & Section Tag */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#E3D7F4] bg-[#F2EBFA] px-3.5 py-1.5 text-xs font-extrabold text-[#35145C]">
                <Sparkles className="h-4 w-4 text-[#D89A16]" />
                <span>{t('selections.sections.selected_research')}</span>
              </div>

              {/* Decorative Gold Ornament */}
              <div className="flex items-center gap-1 text-[#D89A16]">
                <span className="text-[9px]">❖</span>
                <span className="h-px w-6 bg-[#D89A16]/40" />
              </div>
            </div>

            {/* Title */}
            <h3 className="mt-4 font-display text-base font-extrabold leading-snug text-[#2C114C] line-clamp-3 group-hover:text-[#35145C] sm:text-lg">
              {title}
            </h3>

            {subtitle && (
              <p className="mt-1.5 text-xs font-semibold leading-normal text-slate-500 line-clamp-2">
                {subtitle}
              </p>
            )}

            {/* Golden Divider */}
            <div className="my-4 flex items-center justify-center gap-2">
              <span className="h-px w-full bg-gradient-to-r from-transparent via-[#E7DFED] to-transparent" />
              <span className="text-[8px] text-[#D89A16]">❖</span>
              <span className="h-px w-full bg-gradient-to-r from-transparent via-[#E7DFED] to-transparent" />
            </div>

            {/* Details Table List */}
            <div className="space-y-2 text-xs">
              {author && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-[#FAF7FD] px-3 py-2">
                  <div className="flex items-center gap-2 text-[#35145C]">
                    <User className="h-4 w-4 text-[#D89A16]" />
                    <span className="font-extrabold">{t('selections.labels.author')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] text-[#D89A16]">●</span>
                    <span className="font-bold text-[#35145C] text-end line-clamp-1">{author}</span>
                  </div>
                </div>
              )}

              {university && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-[#FAF7FD] px-3 py-2">
                  <div className="flex items-center gap-2 text-[#35145C]">
                    <Building2 className="h-4 w-4 text-[#D89A16]" />
                    <span className="font-extrabold">{t('selections.labels.university')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] text-[#D89A16]">●</span>
                    <span className="font-bold text-[#35145C] text-end line-clamp-1">{university}</span>
                  </div>
                </div>
              )}

              {journal && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-[#FAF7FD] px-3 py-2">
                  <div className="flex items-center gap-2 text-[#35145C]">
                    <FileText className="h-4 w-4 text-[#D89A16]" />
                    <span className="font-extrabold">{t('selections.labels.journal')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] text-[#D89A16]">●</span>
                    <span className="font-bold text-[#35145C] text-end line-clamp-1">{journal}</span>
                  </div>
                </div>
              )}

              {item.publication_year && (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-[#FAF7FD] px-3 py-2">
                  <div className="flex items-center gap-2 text-[#35145C]">
                    <Calendar className="h-4 w-4 text-[#D89A16]" />
                    <span className="font-extrabold">{t('selections.labels.pubYear')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#D89A16]">●</span>
                    <span className="font-extrabold text-[#D89A16]">{item.publication_year}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reusable Action Bar matching Reference Image */}
          <ScientificSelectionActions
            section={item.section}
            onSummary={handleSummary}
            onRead={handleRead}
            onDownload={handleDownload}
            hasSummary={Boolean(summary && summary.trim())}
            hasReadUrl={Boolean(readTargetUrl)}
            hasDocUrl={hasDocument}
          />
        </div>

        {showSummaryModal && (
          <SummaryModal
            title={title}
            summary={summary || ''}
            sectionTitle={t('selections.sections.selected_research')}
            onClose={() => setShowSummaryModal(false)}
          />
        )}
      </>
    );
  }

  // 2 & 3. Render Variant: Selected Publications & Distinguished Theses (Ref Images 2 & 3)
  const isPublication = item.section === 'selected_publications';
  const badgeTitle = isPublication
    ? t('selections.sections.selected_publications')
    : t('selections.sections.distinguished_theses');
  const BadgeIcon = isPublication ? BookMarked : GraduationCap;
  const yearText = isPublication ? item.publication_year : item.grant_year;
  const yearLabel = isPublication ? t('selections.labels.pubYear') : t('selections.labels.grantYear');

  return (
    <>
      <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-[#E7DFED] bg-white p-5 shadow-[0_4px_20px_rgb(53_20_92_/_0.05)] transition-all duration-300 hover:border-[#D89A16]/50 hover:shadow-[0_10px_30px_rgb(53_20_92_/_0.12)]">
        <div>
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#E3D7F4] bg-[#F2EBFA] px-3.5 py-1.5 text-xs font-extrabold text-[#35145C]">
              <BadgeIcon className="h-4 w-4 text-[#D89A16]" />
              <span>{badgeTitle}</span>
            </div>

            <div className="flex items-center gap-1 text-[#D89A16]">
              <span className="text-[9px]">❖</span>
              <span className="h-px w-6 bg-[#D89A16]/40" />
            </div>
          </div>

          {/* Main Card Body (Artwork + Details) */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Cover Image / Artwork */}
            <div className="relative shrink-0 overflow-hidden rounded-xl border border-[#E8E1EF] bg-[#F9F6FC] sm:w-32">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={title}
                  loading="lazy"
                  className="h-44 w-full object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-44 w-full flex-col items-center justify-center border-2 border-dashed border-[#D89A16]/30 bg-white p-3 text-center">
                  <BadgeIcon className="h-8 w-8 text-[#35145C]/40" />
                  <span className="mt-2 text-[10px] font-bold text-[#35145C]/60">{badgeTitle}</span>
                </div>
              )}

              {yearText && (
                <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded-lg bg-black/75 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-md">
                  <Calendar className="h-3 w-3 text-[#D89A16]" />
                  <span className="line-clamp-1">{yearLabel}: {yearText}</span>
                </div>
              )}
            </div>

            {/* Right Details */}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-extrabold leading-snug text-[#2C114C] line-clamp-3 group-hover:text-[#35145C]">
                  {title}
                </h3>

                {subtitle && (
                  <p className="mt-1 text-xs font-semibold leading-normal text-slate-500 line-clamp-2">
                    {subtitle}
                  </p>
                )}

                <div className="mt-3 space-y-1.5 text-xs">
                  {author && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <User className="h-3.5 w-3.5 shrink-0 text-[#D89A16]" />
                      <span className="font-extrabold text-[#35145C]">{t('selections.labels.author')}:</span>
                      <span className="font-bold text-slate-700 line-clamp-1">{author}</span>
                    </div>
                  )}

                  {university && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[#D89A16]" />
                      <span className="font-extrabold text-[#35145C]">{t('selections.labels.university')}:</span>
                      <span className="font-bold text-slate-700 line-clamp-1">{university}</span>
                    </div>
                  )}

                  {journal && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#D89A16]" />
                      <span className="font-extrabold text-[#35145C]">{t('selections.labels.journal')}:</span>
                      <span className="font-bold text-slate-700 line-clamp-1">{journal}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reusable Action Bar matching Reference Image */}
        <ScientificSelectionActions
          section={item.section}
          onSummary={handleSummary}
          onRead={handleRead}
          onDownload={handleDownload}
          hasSummary={Boolean(summary && summary.trim())}
          hasReadUrl={Boolean(readTargetUrl)}
          hasDocUrl={hasDocument}
        />
      </div>

      {showSummaryModal && (
        <SummaryModal
          title={title}
          summary={summary || ''}
          sectionTitle={badgeTitle}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </>
  );
}

function SummaryModal({
  title,
  summary,
  sectionTitle,
  onClose,
}: {
  title: string;
  summary: string;
  sectionTitle: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0EAF5] bg-[#FAF8FC] px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#D89A16]" />
            <h4 className="font-display text-base font-extrabold text-[#35145C]">{sectionTitle} — {t('selections.summaryTitle')}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <h3 className="font-display text-lg font-bold leading-relaxed text-[#35145C]">{title}</h3>
          <div className="h-0.5 w-12 bg-[#D89A16]" />
          <p className="text-sm font-medium leading-relaxed text-slate-700 whitespace-pre-line">{summary}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#F0EAF5] bg-[#FAF8FC] px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#35145C] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#481c7c]"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
