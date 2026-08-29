import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Building2,
  CalendarDays,
  Download,
  Eye,
  Share2,
  Tag,
  User as UserIcon,
  Star,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { pickLang, formatNumber } from '@/lib/utils';
import { contentFilePreviewUrl, isImageStoragePath } from '@/lib/storageFiles';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
import { useContentMetrics } from '@/hooks/useInteractions';
import { interactionService } from '@/services/interactionService';
import { queryKeys } from '@/services/queryKeys';
import type { ResearchPaper } from '@/types';

/**
 * 3D-styled Academic Book & Quill Vector Icon matching Reference Design.
 */
function BookQuillEmblem({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Book Shadow & Base */}
      <path d="M12 40V16C12 16 22 14 32 18C42 14 52 16 52 16V40C52 40 42 38 32 42C22 38 12 40 12 40Z" fill="#35145C" />
      <path d="M12 40V44C12 44 22 42 32 46C42 42 52 44 52 44V40C52 40 42 38 32 42C22 38 12 40 12 40Z" fill="#250C42" />
      {/* Book Pages */}
      <path d="M14 18V38C22 36 30 38 32 40V20C30 18 22 16 14 18Z" fill="#F8F5FA" />
      <path d="M50 18V38C42 36 34 38 32 40V20C34 18 42 16 50 18Z" fill="#FFFDF8" />
      <path d="M32 20V42" stroke="#D89A16" strokeWidth="1.5" strokeLinecap="round" />
      {/* Golden Quill Pen */}
      <path d="M42 8C42 8 36 18 34 26L31 34L37 32L41 24C43 18 45 10 42 8Z" fill="#D89A16" />
      <path d="M31 34L28 38L33 36L31 34Z" fill="#F3C06B" />
      <path d="M39 12C37 16 36 21 34 26" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

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
  const toast = useToast();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

  const title = pickLang(paper.title_ar, paper.title_en, locale) || paper.title_ar || '';
  const author =
    pickLang(paper.author_ar, paper.author_en, locale) ||
    paper.author_ar ||
    'أ.د. سارة بنت عزيز الشهري';
  const institution =
    pickLang(paper.institution_ar, paper.institution_en, locale) ||
    paper.institution_ar ||
    'جامعة الإمام عبدالرحمن بن فيصل';

  const { data: metrics } = useContentMetrics(contentType, paper.id);

  const hasImage = paper.image_path && isImageStoragePath(paper.image_path) && !imageError;
  const imageUrl = hasImage ? contentFilePreviewUrl(paper.image_path as string) : '';

  const researchBadgeText =
    paper.research_type ||
    (contentType === 'publication'
      ? t('home.researchType.publication')
      : t('home.researchType.research'));

  const publicationYear = paper.publication_year
    ? `${paper.publication_year}م`
    : paper.published_at
      ? `${new Date(paper.published_at).getFullYear()}م`
      : '2024م';

  const specialization = paper.research_type || (contentType === 'publication' ? 'مؤلف علمي' : 'الحديث وعلومه');

  const detailUrl = `/${detailPrefix}/${paper.slug}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await interactionService.recordShare(contentType, paper.id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.metrics(contentType, paper.id) });
    } catch {
      /* ignore share count logging failure */
    }

    const shareUrl = `${window.location.origin}${detailUrl}`;
    const shareData = {
      title: title ?? '',
      text: paper.abstract_ar ? paper.abstract_ar.slice(0, 100) : title ?? '',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success(t('common.copied'));
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('common.copied'));
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!paper.document_path) {
      toast.error(t('research.noDocument'));
      return;
    }

    try {
      await interactionService.triggerDownload(contentType, paper.id, paper.document_path);
      void queryClient.invalidateQueries({ queryKey: queryKeys.metrics(contentType, paper.id) });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('errors.')) toast.error(t(message));
      else toast.error(t('common.error'));
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5DEEC] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D89A16]/40 hover:shadow-md">
      {/* ── Top Header / Decorative Cover Section ── */}
      <div className="relative w-full bg-gradient-to-b from-[#FAF8FC] via-white to-[#FDFBFD] p-5 sm:p-6 pb-4">
        {/* Top Controls Strip: Ribbon (Left) + Emblem Badge + Research Type Pill (Right) */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Top Left Ribbon + Arched Emblem */}
          <div className="flex items-start gap-2 z-10">
            {/* Hanging Bookmark Ribbon */}
            <div
              className="relative w-7 sm:w-8 h-11 sm:h-12 bg-[#35145C] text-[#D89A16] flex items-center justify-center pb-2 shadow-xs transition-transform group-hover:scale-105"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
              }}
              title={t('research.title')}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D89A16]" />
            </div>

            {/* Arched Emblem Badge */}
            <div className="flex flex-col items-center justify-center rounded-t-full rounded-b-xl border border-[#E5DEEC] bg-white px-3 py-1.5 shadow-2xs">
              <BookQuillEmblem className="h-8 w-8 sm:h-9 sm:w-9" />
              <span className="mt-0.5 text-[10px] font-extrabold text-[#35145C]">
                الإنتاج العلمي
              </span>
            </div>
          </div>

          {/* Top Right Pill & Favorite Button */}
          <div className="flex items-center gap-2 z-10">
            {/* Favorite Button */}
            <div className="shrink-0">
              <FavoriteButton contentType={contentType} contentId={paper.id} />
            </div>

            {/* Type Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E7DFED] bg-[#F7F5FA] px-3.5 py-1 text-xs font-bold text-[#35145C] shadow-2xs">
              <Sparkles className="h-3 w-3 text-[#D89A16]" />
              <span>{researchBadgeText}</span>
            </div>
          </div>
        </div>

        {/* Optional Research Cover Image Banner */}
        {hasImage && (
          <div className="mb-4 aspect-[21/9] w-full overflow-hidden rounded-xl border border-[#E5DEEC] bg-[#250C42]">
            <img
              src={imageUrl}
              alt={title}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Center Research Title */}
        <h3 className="text-center font-display text-lg sm:text-xl font-extrabold leading-snug text-[#35145C] transition-colors group-hover:text-[#5B2D8E]">
          <Link to={detailUrl} className="focus-visible:outline-none focus-visible:underline">
            {title}
          </Link>
        </h3>

        {/* Golden Floral Ornament Line Divider */}
        <div className="relative my-3 flex h-px w-full items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/50 to-transparent">
          <span className="absolute bg-white px-2 text-xs text-[#D89A16]">❖</span>
        </div>
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* 2x2 Details Inset Box */}
        <div className="overflow-hidden rounded-2xl border border-[#E8E2EE] bg-[#FAF9FC] shadow-2xs">
          <div className="grid grid-cols-2 divide-x divide-y divide-[#E5DEEC] rtl:divide-x-reverse">
            {/* Top Right: Author */}
            <div className="p-3 sm:p-3.5 text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#C8962A]">
                <UserIcon className="h-3.5 w-3.5 text-[#35145C]" />
                <span>الباحث</span>
              </div>
              <p className="line-clamp-1 text-xs sm:text-sm font-bold text-[#35145C]" title={author}>
                {author}
              </p>
            </div>

            {/* Top Left: Publication Year */}
            <div className="p-3 sm:p-3.5 text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#C8962A]">
                <CalendarDays className="h-3.5 w-3.5 text-[#35145C]" />
                <span>سنة النشر</span>
              </div>
              <p className="line-clamp-1 text-xs sm:text-sm font-bold text-[#35145C]">
                {publicationYear}
              </p>
            </div>

            {/* Bottom Right: Institution */}
            <div className="p-3 sm:p-3.5 text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#C8962A]">
                <Building2 className="h-3.5 w-3.5 text-[#35145C]" />
                <span>الجامعة</span>
              </div>
              <p className="line-clamp-1 text-xs sm:text-sm font-bold text-[#35145C]" title={institution}>
                {institution}
              </p>
            </div>

            {/* Bottom Left: Specialization */}
            <div className="p-3 sm:p-3.5 text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold text-[#C8962A]">
                <Tag className="h-3.5 w-3.5 text-[#35145C]" />
                <span>التخصص</span>
              </div>
              <p className="line-clamp-1 text-xs sm:text-sm font-bold text-[#35145C]" title={specialization}>
                {specialization}
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Arch Divider */}
        <div className="my-3 flex h-3 w-full items-center justify-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E5DEEC] to-transparent" />
        </div>

        {/* ── Metrics Bar (4 Columns matching Reference Image 2) ── */}
        <div className="mt-auto grid grid-cols-4 items-center rounded-xl border border-[#E5DEEC] bg-[#FAF9FC] py-2.5 px-1 text-center shadow-2xs divide-x divide-[#E5DEEC] rtl:divide-x-reverse">
          {/* Downloads */}
          <div className="px-1" title={t('common.downloads')}>
            <Download className="mx-auto mb-1 h-4 w-4 text-[#35145C]" />
            <span className="block text-xs sm:text-sm font-extrabold text-[#D89A16]">
              {formatNumber(metrics?.downloads ?? 0, locale)}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-500">
              التنزيلات
            </span>
          </div>

          {/* Share */}
          <div className="px-1" title={t('common.shares')}>
            <Share2 className="mx-auto mb-1 h-4 w-4 text-[#35145C]" />
            <span className="block text-xs sm:text-sm font-extrabold text-[#35145C]">
              {formatNumber(metrics?.shares ?? 0, locale)}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-500">
              المشاركة
            </span>
          </div>

          {/* Views */}
          <div className="px-1" title={t('common.views')}>
            <Eye className="mx-auto mb-1 h-4 w-4 text-[#35145C]" />
            <span className="block text-xs sm:text-sm font-extrabold text-[#35145C]">
              {formatNumber(metrics?.views ?? 0, locale)}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-500">
              المشاهدة
            </span>
          </div>

          {/* Favorites */}
          <div className="px-1" title={t('common.favorites')}>
            <Star className="mx-auto mb-1 h-4 w-4 fill-[#D89A16] text-[#D89A16]" />
            <span className="block text-xs sm:text-sm font-extrabold text-[#D89A16]">
              {formatNumber(metrics?.favorites ?? 0, locale)}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-500">
              عدد من فضل البحث
            </span>
          </div>
        </div>

        {/* ── Actions Bar (Bottom Full Width Bar) ── */}
        <div className="mt-3 overflow-hidden rounded-xl bg-[#35145C] text-white shadow-xs">
          <div className="flex items-center divide-x divide-white/20 rtl:divide-x-reverse">
            {/* Read Paper Button */}
            <Link
              to={detailUrl}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-xs font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold-400"
            >
              <BookOpen className="h-4 w-4 text-[#D89A16]" />
              <span>{t('research.readPaper')}</span>
            </Link>

            {/* Share Paper Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-xs font-bold text-white transition-colors hover:bg-white/10"
            >
              <Share2 className="h-4 w-4 text-[#D89A16]" />
              <span>{t('research.sharePaper')}</span>
            </button>

            {/* Download Paper Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!paper.document_path}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-xs font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              title={paper.document_path ? t('research.downloadPaper') : t('research.noDocument')}
            >
              <Download className="h-4 w-4 text-[#D89A16]" />
              <span>{t('research.downloadPaper')}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

