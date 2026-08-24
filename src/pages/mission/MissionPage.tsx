import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  FileSearch,
  Users,
  Landmark,
  ScrollText,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { profileContentService } from '@/services/contentService';
import { queryKeys } from '@/services';
import { ErrorState, LoadingState } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/* ───────────────────────── DECORATIVE GOLD KNOT ───────────────────────── */

function GoldKnotIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" opacity="0.9" />
      <circle cx="12" cy="12" r="2" fill="#FFF" />
    </svg>
  );
}

/* ───────────────────────── CARD CONFIG ───────────────────────── */

const FALLBACK_CARDS: Array<{
  title: string;
  icon: LucideIcon;
  fallbackText: string;
}> = [
  {
    title: 'مصدر أصيل للمعرفة الشرعية',
    icon: BookOpen,
    fallbackText:
      'أؤمن بأن السنة النبوية تمثل مصدراً أصيلاً للمعرفة الشرعية، وأن خدمة هذا التراث العظيم لا تقتصر على حفظه وروايته، بل تمتد إلى دراسته دراسة نقدية رصينة، تكشف دقة منهج المحدثين وثراءه، وتبرز قدرته على الإسهام في معالجة القضايا العلمية والفكرية المعاصرة.',
  },
  {
    title: 'منهج نقدي ورؤى متجددة',
    icon: FileSearch,
    fallbackText:
      'تنطلق مسيرتي البحثية من العناية بالمنهج النقدي الذي أسسه أئمة الحديث، واستثمار أدواته في تحليل الروايات، ودراسة الأسانيد والمتون، وتحقيق النصوص التراثية، مع السعي إلى بناء جسور معرفية بين علوم السنة النبوية والتخصصات الحديثة، ولا سيما التقنيات الرقمية والذكاء الاصطناعي، بما يفتح آفاقاً جديدة للبحث العلمي دون الإخلال بالأصول المنهجية التيتميزت بها المدرسة الحديثية.',
  },
  {
    title: 'رعاية الباحثين وبناء الأجيال',
    icon: Users,
    fallbackText:
      'ولا تنحصر رسالتي العلمية في الإنتاج البحثي فحسب، بل تمتد إلى رعاية الباحثين، وتنمية قدراتهم العلمية، والإسهام في إعداد جيل من المتخصصين القادرين على مواصلة البناء المعرفي؛ إيماناً بأن الاستثمار في الباحث هو الاستثمار الأكثر أثراً واستدامة، ومن هذا المنطلق أحرص على الإشراف العلمي، وتطوير البرامج الأكاديمية، ودعم المبادرات البحثية التي تسهم في الارتقاء بالدراسات الحديثية وجودة مخرجاتها.',
  },
  {
    title: 'أثر معرفي وحضاري ومتطلبات العصر',
    icon: Landmark,
    fallbackText:
      'وأطمح إلى أن تكون أبحاثي ومشروعاتي العلمية لبنة في تطوير الدراسات الحديثية، وإبراز قيمتها المعرفية والحضارية، والإسهام في تقديم السنة النبوية بمنهج علمي يجمع بين أصالة التراث، ودقة البحث، ومتطلبات العصر، بما يخدم المجتمع العلمي ويعزز مكانة الدراسات الإسلامية في البيئة الأكاديمية العالمية.',
  },
];

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */

export function MissionPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const query = useQuery({
    queryKey: queryKeys.profileContent('mission'),
    queryFn: () => profileContentService.getSection('mission'),
  });

  const content = query.data;
  const body = content ? pickLang(content.body_ar, content.body_en, locale) : null;
  const paragraphs = body ? body.split(/\n{2,}/).filter((p) => p.trim().length > 0) : [];

  return (
    <>
      <Seo title={t('nav.mission')} />

      {/* ── PAGE HEADER ── */}
      <section className="border-b border-[#E7DFED] bg-gradient-to-b from-[#F8F4FC] to-white py-3 sm:py-5">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#D89A16]/50 sm:w-12" />
            <div className="flex items-center gap-2.5">
              <ScrollText className="h-5 w-5 text-[#5B2D8E] sm:h-6 sm:w-6" />
              <h1 className="font-display text-xl font-bold text-[#35145C] sm:text-2xl">
                {t('nav.mission')}
              </h1>
            </div>
            <span className="h-px w-8 bg-[#D89A16]/50 sm:w-12" />
          </div>
          <div className="mx-auto mt-1.5 h-0.5 w-10 rounded-full bg-[#D89A16]" />
          <p className="mx-auto mt-1.5 max-w-md text-xs font-bold text-[#35145C]/70 sm:text-sm">
            {t('mission.subtitle')}
          </p>
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
              {/* ── RIGHT COLUMN (mission.png Image in RTL) ── */}
              <div className="flex h-full justify-center lg:col-span-5">
                <div className="flex h-full w-full max-w-md overflow-hidden rounded-2xl border border-[#E7DFED] bg-white shadow-sm lg:max-w-none">
                  <img
                    src="/images/mission.png"
                    alt="الرسالة العلمية - أ.د. سارة بنت عزيز الشهري"
                    loading="eager"
                    className="h-full w-full object-contain sm:object-cover lg:object-cover"
                  />
                </div>
              </div>

              {/* ── LEFT COLUMN (Divider + 4 Cards + Quote Box) ── */}
              <div className="flex flex-col justify-between space-y-3 lg:col-span-7">
                {/* Decorative Top Divider */}
                <div className="flex items-center justify-center gap-2 text-[#D89A16]">
                  <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#D89A16]/60" />
                  <GoldKnotIcon className="h-3.5 w-3.5 text-[#D89A16]" />
                  <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#D89A16]/60" />
                </div>

                {/* 4 Content Cards */}
                <div className="flex flex-1 flex-col space-y-3">
                  {FALLBACK_CARDS.map((card, index) => {
                    const text = paragraphs[index] || card.fallbackText;
                    return (
                      <MissionCard
                        key={card.title}
                        title={card.title}
                        icon={card.icon}
                        text={text}
                      />
                    );
                  })}
                </div>

                {/* ── HIGHLIGHTED LAVENDER QUOTE BOX (Matching Reference Image) ── */}
                <div className="relative shrink-0 flex items-center justify-between gap-2.5 pt-1">
                  {/* Right Gold Accent (in RTL) */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[#D89A16] shrink-0">
                    <GoldKnotIcon className="h-3.5 w-3.5 text-[#D89A16]" />
                    <span className="h-px w-3 bg-[#D89A16]/50" />
                  </div>

                  {/* Main Lavender Quote Box */}
                  <div className="flex-1 rounded-2xl border border-[#E7DFED] bg-[#F5F0FA] px-4 py-3.5 sm:px-6 sm:py-4 shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      {/* Right Opening Quote Mark (RTL start) */}
                      <span className="select-none font-serif text-2xl sm:text-3xl font-extrabold text-[#35145C] leading-none shrink-0">
                        “
                      </span>

                      {/* Quote Text */}
                      <div className="flex-1 text-center font-bold text-[#35145C] text-xs sm:text-[13px] leading-relaxed">
                        <p>البحث العلمي رسالة، وخدمة السنة النبوية مسؤولية، والتميز لا يتحقق إلا بمنهج رصين،</p>
                        <p>وفكر متجدد، وأثر يمتد إلى الأجيال.</p>
                      </div>

                      {/* Left Closing Quote Mark (RTL end) */}
                      <span className="select-none font-serif text-2xl sm:text-3xl font-extrabold text-[#35145C] leading-none shrink-0">
                        ”
                      </span>
                    </div>
                  </div>

                  {/* Left Gold Accent (in RTL) */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[#D89A16] shrink-0">
                    <span className="h-px w-3 bg-[#D89A16]/50" />
                    <GoldKnotIcon className="h-3.5 w-3.5 text-[#D89A16]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── MISSION CARD ───────────────────────── */

function MissionCard({
  title,
  icon: Icon,
  text,
}: {
  title: string;
  icon: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex flex-1 flex-col-reverse items-stretch overflow-hidden rounded-2xl border border-[#E7DFED] bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      {/* Right side in RTL: Paragraph Text */}
      <div className="flex flex-1 items-center p-3 sm:p-3.5">
        <p className="text-xs font-medium leading-[1.8] text-[#35145C] text-justify sm:text-right sm:text-[12.5px]">
          {text}
        </p>
      </div>

      {/* Middle: Vertical Gold Dotted Line with Diamond Ornament */}
      <div className="hidden shrink-0 items-center justify-center px-0.5 sm:flex">
        <div className="relative flex h-[75%] w-px items-center justify-center bg-gradient-to-b from-transparent via-[#D89A16]/50 to-transparent">
          <span className="absolute bg-white text-[9px] text-[#D89A16]">
            ❖
          </span>
        </div>
      </div>

      {/* Left side in RTL: Icon & Label Box */}
      <div className="flex w-full shrink-0 flex-col items-center justify-center gap-1 border-b border-[#E7DFED] bg-[#F5F0FA] p-2.5 text-center sm:w-32 sm:border-b-0 sm:border-r-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7DFED]/60 bg-white text-[#5B2D8E] shadow-xs">
          <Icon className="h-4.5 w-4.5 text-[#5B2D8E]" />
        </div>
        <span className="text-[11px] font-bold leading-tight text-[#35145C] sm:max-w-[100px]">
          {title}
        </span>
      </div>
    </div>
  );
}
