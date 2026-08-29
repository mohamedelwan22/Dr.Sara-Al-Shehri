import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  FileSearch,
  Puzzle,
  BookOpen,
  FileText,
  Microscope,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { requireSupabase } from '@/lib/supabase';
import { queryKeys } from '@/services';
import { ErrorState, LoadingState } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { ResearchInterest } from '@/types';
import type { LucideIcon } from 'lucide-react';

/* ───────────────────────── DECORATIVE COMPONENTS ───────────────────────── */

function GoldKnotIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" opacity="0.9" />
      <circle cx="12" cy="12" r="2" fill="#FFF" />
    </svg>
  );
}

/* Islamic Floral Rosette Mandala Watermark matching Reference Image 2 */
function MandalaWatermark({ className = 'h-14 w-14 text-[#5B2D8E]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8" className={className}>
      <circle cx="50" cy="50" r="42" strokeWidth="0.8" opacity="0.3" />
      <circle cx="50" cy="50" r="32" strokeWidth="0.6" opacity="0.25" />
      <circle cx="50" cy="50" r="22" strokeWidth="0.6" opacity="0.2" />
      <circle cx="50" cy="50" r="12" strokeWidth="0.6" opacity="0.2" />
      <g opacity="0.35" strokeWidth="0.7">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="50"
            rx="11"
            ry="28"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </g>
    </svg>
  );
}

/* AI Chip Icon matching Reference Image 2 */
function AiChipIcon({ className = 'h-5 w-5 text-[#5B2D8E]' }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
      </svg>
      <span className="absolute text-[8px] font-black leading-none text-[#5B2D8E]">AI</span>
    </div>
  );
}

/* ───────────────────────── CARD CONFIG ───────────────────────── */

interface InterestItem {
  title: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}

const FALLBACK_INTERESTS: InterestItem[] = [
  {
    title: 'دراسة العلل الحديثية إسناداً ومتناً.',
    icon: FileSearch,
  },
  {
    title: 'دراسة الروايات المشكلة وتحليلها في ضوء منهج المحدثين.',
    icon: Puzzle,
  },
  {
    title: 'مناهج المحدثين في نقد الروايات وتمحيصها، وإبراز دورها في صيانة السنة النبوية.',
    icon: BookOpen,
  },
  {
    title: 'تحقيق المخطوطات الحديثية ودراستها.',
    icon: FileText,
  },
  {
    title: 'توظيف التقنيات الحديثة والذكاء الاصطناعي في خدمة السنة النبوية.',
    icon: AiChipIcon,
  },
];

/* ───────────────────────── FETCH FUNCTION ───────────────────────── */

async function fetchInterests(): Promise<ResearchInterest[]> {
  const { data, error } = await requireSupabase()
    .from('research_interests')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as ResearchInterest[]) ?? [];
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */

export function InterestsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const query = useQuery({ queryKey: queryKeys.interests, queryFn: fetchInterests });
  const dbInterests = query.data ?? [];

  return (
    <>
      <Seo title={t('interests.title')} description={t('interests.subtitle')} />

      {/* ── PAGE HEADER ── */}
      <section className="border-b border-[#E7DFED] bg-gradient-to-b from-[#F8F4FC] to-white py-3 sm:py-5">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#D89A16]/50 sm:w-12" />
            <div className="flex items-center gap-2.5">
              <Microscope className="h-5 w-5 text-[#5B2D8E] sm:h-6 sm:w-6" />
              <h1 className="font-display text-xl font-bold text-[#35145C] sm:text-2xl">
                {t('interests.title')}
              </h1>
            </div>
            <span className="h-px w-8 bg-[#D89A16]/50 sm:w-12" />
          </div>
          <div className="mx-auto mt-1.5 h-0.5 w-10 rounded-full bg-[#D89A16]" />
          {/* <p className="mx-auto mt-1.5 max-w-md text-xs font-bold text-[#35145C]/70 sm:text-sm">
            {t('interests.subtitle')}
          </p> */}
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="container-page py-4 sm:py-5">
        {query.isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <LoadingState />
          </div>
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : (
          <div className="mx-auto max-w-6xl">
            {/* Grid container with lg:items-stretch to synchronize column heights */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
              {/* ── RIGHT COLUMN (search-interests.png Image in RTL) ── */}
              <div className="flex h-full justify-center lg:col-span-5">
                <div className="flex h-full w-full max-w-md overflow-hidden rounded-2xl border border-[#E7DFED] bg-white shadow-sm lg:max-w-none">
                  <img
                    src="/images/search-interests.png"
                    alt="الاهتمامات البحثية - أ.د. سارة بنت عزيز الشهري"
                    loading="eager"
                    className="h-full w-full object-contain sm:object-cover lg:object-cover"
                  />
                </div>
              </div>

              {/* ── LEFT COLUMN (Header + 5 Research Interest Cards) ── */}
              <div className="flex flex-col justify-between space-y-3.5 lg:col-span-7">
                {/* Section Heading */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center gap-2 text-[#D89A16]">
                    <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D89A16]/60" />
                    <GoldKnotIcon className="h-3.5 w-3.5 text-[#D89A16]" />
                    <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D89A16]/60" />
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-xs text-[#D89A16]">✦</span>
                    <h2 className="font-display text-base font-bold text-[#35145C] sm:text-lg">
                      وتركز اهتماماتي البحثية في المجالات الآتية:
                    </h2>
                    <span className="text-xs text-[#D89A16]">✦</span>
                  </div>
                </div>

                {/* 5 Research Interest Cards (Icon on Right, Text in Middle, Watermark on Far Left) */}
                <div className="flex flex-1 flex-col space-y-3">
                  {FALLBACK_INTERESTS.map((item, index) => {
                    const dbItem = dbInterests[index];
                    const dbTitle = dbItem
                      ? pickLang(dbItem.title_ar, dbItem.title_en, locale)
                      : null;
                    const titleText = dbTitle || item.title;

                    return (
                      <InterestCard
                        key={index}
                        title={titleText}
                        icon={item.icon}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── INTEREST CARD ───────────────────────── */

function InterestCard({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative flex flex-1 items-center overflow-hidden rounded-2xl border border-[#E7DFED] bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs transition-shadow hover:shadow-sm">
      {/* 1. RIGHT SIDE in RTL: Lavender Circular Icon Container */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7DFED]/80 bg-[#F5F0FA] text-[#5B2D8E] shadow-xs">
        <Icon className="h-5 w-5 text-[#5B2D8E]" />
      </div>

      {/* 2. Gold Vertical Divider Line with Diamond Ornament */}
      <div className="relative mx-3.5 flex h-8 w-px shrink-0 items-center justify-center bg-gradient-to-b from-transparent via-[#D89A16]/60 to-transparent sm:mx-4">
        <span className="absolute bg-white text-[8px] text-[#D89A16]">
          ❖
        </span>
      </div>

      {/* 3. MIDDLE / MAIN: Research Interest Text (RTL text-right) */}
      <div className="relative z-10 flex-1 pr-1">
        <p className="text-xs font-bold leading-relaxed text-[#35145C] sm:text-[13px] text-right">
          {title}
        </p>
      </div>

      {/* 4. FAR LEFT in RTL: Subtle Islamic Rosette Mandala Watermark */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-25">
        <MandalaWatermark className="h-14 w-14 text-[#5B2D8E]" />
      </div>
    </div>
  );
}
