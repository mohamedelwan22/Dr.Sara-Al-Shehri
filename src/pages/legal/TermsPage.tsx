import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, ShieldCheck, Copyright, Quote, UserCheck, FileText, FilePenLine,
  Shield, Lock, Users, Edit3, FileEdit, RefreshCw, HelpCircle, Info,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { termsService, queryKeys, DEFAULT_TERMS_INFO, DEFAULT_TERMS_SECTIONS } from '@/services';
import { LoadingState } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { TermsSection } from '@/services/termsService';

const TERMS_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  ShieldCheck,
  Copyright,
  Quote,
  UserCheck,
  FileText,
  FilePenLine,
  Shield,
  Lock,
  Users,
  Edit3,
  FileEdit,
  RefreshCw,
  HelpCircle,
  Info,
};

function renderTermsIcon(iconName: string, className = 'h-5 w-5') {
  const IconComponent = TERMS_ICON_MAP[iconName] ?? FileText;
  return <IconComponent className={className} />;
}

function GoldOrnament({ className = 'my-2.5' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-[#C8962A] ${className}`}>
      <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#C8962A]/70 to-[#C8962A]" />
      <div className="flex items-center gap-1 text-[#C8962A]">
        <span className="text-[10px]">❖</span>
        <span className="text-xs">◆</span>
        <span className="text-[10px]">❖</span>
      </div>
      <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-[#C8962A]/70 to-[#C8962A]" />
    </div>
  );
}

export function TermsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const infoQuery = useQuery({
    queryKey: queryKeys.termsInfo,
    queryFn: () => termsService.getTermsInfo(),
  });

  const sectionsQuery = useQuery({
    queryKey: queryKeys.termsSections,
    queryFn: () => termsService.getTermsSections(),
  });

  const isLoading = infoQuery.isLoading || sectionsQuery.isLoading;

  const info = infoQuery.data ?? DEFAULT_TERMS_INFO;
  const rawSections = sectionsQuery.data ?? [];
  const sections = rawSections.length > 0 ? rawSections : DEFAULT_TERMS_SECTIONS;

  const title = pickLang(info?.title_ar, info?.title_en, locale) || t('nav.terms');
  const subtitle = pickLang(info?.subtitle_ar, info?.subtitle_en, locale) ?? undefined;
  const quoteText = pickLang(info?.quote_ar, info?.quote_en, locale);
  const artworkUrl = info?.artwork_url || '/images/terms.png';

  if (isLoading) {
    return (
      <>
        <Seo title={t('nav.terms')} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <LoadingState />
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={title} description={subtitle} />

      {/* Page Header matching Legal Pages Theme */}
      <header className="relative bg-gradient-to-b from-[#F5F0FA]/80 via-white to-white pb-6 pt-10 border-b border-[#E7DFED]/60 overflow-hidden text-center">
        {/* Hanging bookmark ribbon */}
        <div className="absolute top-0 right-6 sm:right-10 z-10 hidden sm:block">
          <div
            className="flex h-16 w-10 items-center justify-center bg-[#35145C] text-[#C8962A] shadow-sm"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
          >
            <span className="text-base font-bold">❖</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F0FA] ring-4 ring-[#F5F0FA]/60 shadow-inner">
              <FileText className="h-6 w-6 text-[#35145C]" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#35145C]">{title}</h1>
          </div>
          <GoldOrnament />
          {subtitle && (
            <p className="mx-auto max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-[#4A3B5C]">
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {/* Main 2-Column Responsive Layout matching IMAGE 3 Reference */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

          {/* ── Right Column: Terms Artwork Card (In 12-col grid in RTL: col 1..4 = RIGHT SIDE) ── */}
          <div className="lg:col-span-4 order-last lg:order-first flex flex-col">
            <div className="h-full rounded-3xl border border-[#E7DFED] bg-gradient-to-b from-[#F5F0FA]/70 via-white to-[#F5F0FA]/40 p-6 sm:p-7 shadow-2xs flex flex-col justify-between items-center text-center overflow-hidden">
              
              {/* Header inside Image Card */}
              <div className="w-full flex flex-col items-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#F4ECFA] text-[#35145C] border border-[#E7DFED] shadow-xs mb-3">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-[#35145C]" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#35145C]">
                  {title}
                </h2>
                <GoldOrnament />
              </div>

              {/* Terms Artwork Frame */}
              <div className="flex-1 w-full flex items-center justify-center min-h-[320px] sm:min-h-[440px] mt-4">
                <img
                  src={artworkUrl}
                  alt={title}
                  className="w-full h-full max-h-[720px] object-contain drop-shadow-xs transition-transform duration-300 hover:scale-[1.01]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + '/images/terms.png') {
                      target.src = '/images/terms.png';
                    }
                  }}
                />
              </div>

            </div>
          </div>

          {/* ── Left Column: Intro + 7 Section Cards (In 12-col grid in RTL: col 5..12 = LEFT SIDE) ── */}
          <div className="lg:col-span-8 order-first lg:order-last flex flex-col space-y-5">
            
            {/* Intro Text Block */}
            <div className="rounded-2xl border border-[#E7DFED] bg-[#FCFAFE] p-5 sm:p-6 text-center shadow-2xs">
              <p className="text-base sm:text-lg font-bold leading-relaxed text-[#35145C]">
                مرحبًا بكم في منصة أ.د. سارة بنت عزيز الشهري.
                <br className="hidden sm:inline" />
                يعد استخدام الموقع موافقة ضمنية على الالتزام بالشروط الآتية:
              </p>
            </div>

            {/* 7 Section Cards (01 to 07) */}
            {sections.map((section: TermsSection) => {
              const secTitle = pickLang(section.title_ar, section.title_en, locale) || '';
              const secContent = pickLang(section.content_ar, section.content_en, locale) || '';

              return (
                <div
                  key={section.id}
                  className="rounded-2xl border border-[#E7DFED] bg-white p-5 sm:p-6 shadow-2xs relative overflow-hidden transition-all hover:border-[#35145C]/30 hover:shadow-md"
                >
                  {/* Section Header Row */}
                  <div className="flex items-center justify-between gap-4 border-b border-[#F5EDFA] pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center rounded-xl bg-[#FFF9EB] border border-[#F5E6C4] px-3.5 py-1 text-sm font-extrabold text-[#C8962A] shadow-2xs">
                        {section.section_number}
                      </span>
                      <h2 className="font-display text-lg sm:text-xl font-bold text-[#35145C]">
                        {secTitle}
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F4ECFA] text-[#35145C] border border-[#E7DFED] shadow-2xs">
                      {renderTermsIcon(section.icon)}
                    </div>
                  </div>

                  {/* Section Content */}
                  <p className="text-sm sm:text-base font-medium leading-relaxed text-[#4A3B5C]">
                    {secContent}
                  </p>
                </div>
              );
            })}

          </div>

        </div>

        {/* ── Bottom Quote Card matching IMAGE 3 Reference ── */}
        {quoteText && (
          <div className="mt-8">
            <div className="relative rounded-2xl border border-[#E9DCF5] bg-[#FCFAFE] px-6 sm:px-8 py-5 text-center shadow-2xs overflow-hidden flex items-center justify-between gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-[#C8962A] shrink-0">
                <div className="hidden sm:block h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C8962A]" />
                <span className="font-serif text-3xl font-extrabold text-[#35145C] select-none">“</span>
              </div>

              <p className="flex-1 text-base sm:text-lg font-bold leading-relaxed text-[#35145C] px-1">
                {quoteText}
              </p>

              <div className="flex items-center gap-2 text-[#C8962A] shrink-0">
                <span className="font-serif text-3xl font-extrabold text-[#35145C] select-none">”</span>
                <div className="hidden sm:block h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C8962A]" />
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
