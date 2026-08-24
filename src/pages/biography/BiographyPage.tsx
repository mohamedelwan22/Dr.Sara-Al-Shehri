import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  GraduationCap,
  Landmark,
  User,
  FileText,
  UserCircle2,
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
    title: 'الخبرة الأكاديمية والبحثية',
    icon: GraduationCap,
    fallbackText:
      'باحثة متخصصة في الدراسات الحديثية ونقد الرواية النبوية، تمتد خبرتي الأكاديمية لأكثر من خمسة وعشرين عاماً في التدريس الجامعي والبحث العلمي والإشراف على الدراسات العليا، مع اهتمام خاص بمنهج المحدثين في نقد الرواية، وتحقيق التراث الحديثي، والدراسات التطبيقية في علوم السنة النبوية.',
  },
  {
    title: 'القيادة المؤسسية والمشاركات العلمية',
    icon: Landmark,
    fallbackText:
      'جمعت بين العمل الأكاديمي والقيادة المؤسسية، حيث توليت إدارة مركز النشر العلمي والترجمة بجامعة الإمام عبدالرحمن بن فيصل، وأسهمت في تطوير منظومة النشر العلمي، وشاركت في عدد من المجالس واللجان العلمية، إضافة إلى عضويتي في هيئات تحرير المجلات العلمية وتحكيم البحوث في عدد من المجلات المحكمة داخل المملكة العربية السعودية وخارجها.',
  },
  {
    title: 'الإنتاج العلمي وإشراف الدراسات',
    icon: BookOpen,
    fallbackText:
      'نشرت العديد من الأبحاث العلمية المحكمة في مجالات علوم الحديث ونقد الأسانيد والمتون، وأسهمت في الإشراف على رسائل الماجستير والدكتوراه، وإعداد الخطط الدراسية وتطوير البرامج الأكاديمية، مع اهتمام مستمر ببناء بيئة بحثية تُعنى بإعداد الباحثين وتأهيلهم وفق المنهج العلمي الرصين.',
  },
];

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */

export function BiographyPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const query = useQuery({
    queryKey: queryKeys.profileContent('biography'),
    queryFn: () => profileContentService.getSection('biography'),
  });

  const content = query.data;
  const body = content ? pickLang(content.body_ar, content.body_en, locale) : null;
  const paragraphs = body ? body.split(/\n{2,}/).filter((p) => p.trim().length > 0) : [];

  return (
    <>
      <Seo title={t('nav.biography')} />

      {/* ── PAGE HEADER ── */}
      <section className="border-b border-[#E7DFED] bg-gradient-to-b from-[#F8F4FC] to-white py-3 sm:py-5">
        <div className="container-page text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#D89A16]/50 sm:w-12" />
            <div className="flex items-center gap-2.5">
              <UserCircle2 className="h-5 w-5 text-[#5B2D8E] sm:h-6 sm:w-6" />
              <h1 className="font-display text-xl font-bold text-[#35145C] sm:text-2xl">
                {t('nav.biography')}
              </h1>
            </div>
            <span className="h-px w-8 bg-[#D89A16]/50 sm:w-12" />
          </div>
          <div className="mx-auto mt-1.5 h-0.5 w-10 rounded-full bg-[#D89A16]" />
          <p className="mx-auto mt-1.5 max-w-md text-xs font-bold text-[#35145C]/70 sm:text-sm">
            {t('biography.subtitle')}
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
              {/* ── RIGHT COLUMN (cv.png Image) ── */}
              <div className="flex h-full justify-center lg:col-span-5">
                <div className="flex h-full w-full max-w-md overflow-hidden rounded-2xl border border-[#E7DFED] bg-white shadow-sm lg:max-w-none">
                  <img
                    src="/images/cv.png"
                    alt="السيرة الذاتية - أ.د. سارة بنت عزيز الشهري"
                    loading="eager"
                    className="h-full w-full object-contain sm:object-cover lg:object-cover"
                  />
                </div>
              </div>

              {/* ── LEFT COLUMN (Profile Card + 3 Academic Cards) ── */}
              <div className="flex flex-col justify-between space-y-3.5 lg:col-span-7">
                {/* 1. Main Profile Identification Card */}
                <div className="shrink-0 rounded-2xl border border-[#E7DFED] bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col items-center gap-3.5 sm:flex-row-reverse sm:items-center sm:justify-between">
                    {/* Text Details */}
                    <div className="flex-1 text-center sm:text-right">
                      <h2 className="font-display text-lg font-extrabold text-[#35145C] sm:text-xl">
                        أ.د. سارة بنت عزيز الشهري
                      </h2>
                      <p className="mt-0.5 text-xs font-bold text-[#D89A16] sm:text-sm">
                        أستاذ الحديث وعلومه
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-[#5C4A70] sm:text-xs">
                        بكلية الشريعة والقانون في جامعة الإمام عبدالرحمن بن فيصل
                      </p>
                      <div className="mt-2.5 flex items-center justify-center gap-2 sm:justify-start">
                        <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#D89A16]/60" />
                        <GoldKnotIcon className="h-3 w-3 text-[#D89A16]" />
                        <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#D89A16]/60" />
                      </div>
                    </div>

                    {/* Avatar Circle with Badge */}
                    <div className="relative flex h-18 w-18 shrink-0 items-center justify-center rounded-full border border-[#E7DFED] bg-[#F3EEFA] shadow-xs sm:h-20 sm:w-20">
                      <User className="h-10 w-10 text-[#5B2D8E] sm:h-11 sm:w-11" />
                      <div className="absolute bottom-0 left-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#5B2D8E] text-white shadow-xs">
                        <FileText className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 3 Academic Cards taking equal flex height */}
                <div className="flex flex-1 flex-col space-y-3.5">
                  {FALLBACK_CARDS.map((card, index) => {
                    const text = paragraphs[index] || card.fallbackText;
                    return (
                      <AcademicCard
                        key={card.title}
                        title={card.title}
                        icon={card.icon}
                        text={text}
                      />
                    );
                  })}
                </div>

                {/* Remaining paragraphs (if CMS has more than 3) */}
                {paragraphs.length > 3 &&
                  paragraphs.slice(3).map((p, i) => (
                    <div
                      key={`extra-${i}`}
                      className="shrink-0 rounded-2xl border border-[#E7DFED] bg-white p-4 shadow-sm"
                    >
                      <p className="text-xs font-medium leading-relaxed text-[#35145C]">{p}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ───────────────────────── ACADEMIC CARD ───────────────────────── */

function AcademicCard({
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
      <div className="flex flex-1 items-center p-3.5 sm:p-4">
        <p className="text-xs font-medium leading-[1.85] text-[#35145C] text-justify sm:text-right sm:text-[13px]">
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
      <div className="flex w-full shrink-0 flex-col items-center justify-center gap-1.5 border-b border-[#E7DFED] bg-[#F5F0FA] p-3 text-center sm:w-32 sm:border-b-0 sm:border-r-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7DFED]/60 bg-white text-[#5B2D8E] shadow-xs">
          <Icon className="h-5 w-5 text-[#5B2D8E]" />
        </div>
        <span className="text-[11px] font-bold leading-snug text-[#35145C] sm:max-w-[100px]">
          {title}
        </span>
      </div>
    </div>
  );
}


