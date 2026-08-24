import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Shield, Lock, ClipboardList, Target, Users, FileEdit,
  Eye, FileText, UserCheck, Share2, Edit3, HelpCircle, Info,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { privacyService, queryKeys, DEFAULT_PRIVACY_INFO, DEFAULT_PRIVACY_SECTIONS } from '@/services';
import { LoadingState } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { PrivacySection } from '@/types';

const PRIVACY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Clipboard: ClipboardList,
  Target,
  ShieldCheck,
  Shield,
  Lock,
  Users,
  UserCheck,
  Share2,
  FileEdit,
  Edit3,
  FileText,
  Eye,
  HelpCircle,
  Info,
};

function renderPrivacyIcon(iconName: string, className = 'h-5 w-5') {
  const IconComponent = PRIVACY_ICON_MAP[iconName] ?? ShieldCheck;
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

export function PrivacyPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const infoQuery = useQuery({
    queryKey: queryKeys.privacyInfo,
    queryFn: () => privacyService.getPrivacyInfo(),
  });

  const sectionsQuery = useQuery({
    queryKey: queryKeys.privacySections,
    queryFn: () => privacyService.getPrivacySections(),
  });

  const isLoading = infoQuery.isLoading || sectionsQuery.isLoading;

  const info = infoQuery.data ?? DEFAULT_PRIVACY_INFO;
  const rawSections = sectionsQuery.data ?? [];
  const sections = rawSections.length > 0 ? rawSections : DEFAULT_PRIVACY_SECTIONS;

  const title = pickLang(info?.title_ar, info?.title_en, locale) || t('nav.privacy');
  const subtitle = pickLang(info?.subtitle_ar, info?.subtitle_en, locale) ?? undefined;
  const quoteText = pickLang(info?.quote_ar, info?.quote_en, locale);
  const artworkUrl = info?.artwork_url || '/images/policy.png';

  if (isLoading) {
    return (
      <>
        <Seo title={t('nav.privacy')} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <LoadingState />
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={title} description={subtitle} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Main 2-Column Responsive Layout matching IMAGE 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[380px_1fr] gap-6 sm:gap-8 items-stretch">

          {/* ── Image Column Panel ── */}
          <div className="flex flex-col">
            <div className="h-full rounded-3xl border border-[#E7DFED] bg-gradient-to-b from-[#F5F0FA]/70 via-white to-[#F5F0FA]/40 p-6 sm:p-7 shadow-2xs flex flex-col justify-between items-center text-center overflow-hidden">
              
              {/* Top Banner inside Right Column */}
              <div className="w-full flex flex-col items-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-[#F4ECFA] text-[#35145C] border border-[#E7DFED] shadow-xs mb-3">
                  <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-[#35145C]" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#35145C] tracking-tight">
                  {title}
                </h1>
                <GoldOrnament />
              </div>

              {/* Illustration Artwork Frame */}
              <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] mt-4">
                <img
                  src={artworkUrl}
                  alt={title}
                  className="w-full h-full max-h-[680px] object-contain drop-shadow-xs transition-transform duration-300 hover:scale-[1.01]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + '/images/policy.png') {
                      target.src = '/images/policy.png';
                    }
                  }}
                />
              </div>

            </div>
          </div>

          {/* ── Content Column Stack: Intro + Sections 01 to 05 ── */}
          <div className="flex flex-col space-y-6">
            
            {/* Intro Subtitle at Top of Left Column */}
            {subtitle && (
              <div className="text-center pb-2 pt-1 px-2">
                <GoldOrnament />
                <p className="text-base sm:text-lg font-bold leading-relaxed text-[#35145C] max-w-2xl mx-auto">
                  {subtitle}
                </p>
              </div>
            )}

            {/* Dynamic Section Cards */}
            {sections.map((section: PrivacySection) => {
              const secTitle = pickLang(section.title_ar, section.title_en, locale) || '';
              const secContent = pickLang(section.content_ar, section.content_en, locale) || '';

              return (
                <div
                  key={section.id}
                  className="rounded-2xl border border-[#E7DFED] bg-white p-5 sm:p-6 shadow-2xs relative overflow-hidden transition-all hover:border-[#35145C]/30 hover:shadow-md"
                >
                  {/* Card Header Row */}
                  <div className="flex items-center justify-between gap-4 border-b border-[#F5EDFA] pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center rounded-xl bg-[#FFF9EB] border border-[#F5E6C4] px-3.5 py-1 text-sm font-extrabold text-[#C8962A] shadow-2xs">
                        {section.section_number}
                      </span>
                      <h2 className="font-display text-lg sm:text-xl font-bold text-[#35145C]">
                        {secTitle}
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4ECFA] text-[#35145C] border border-[#E7DFED] shadow-2xs">
                      {renderPrivacyIcon(section.icon)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <PrivacySectionContent text={secContent} />
                </div>
              );
            })}

          </div>

        </div>

        {/* ── Bottom Quote Card matching IMAGE 2 ── */}
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

// ── Section Content Parser with Multi-column support for Section 01 ──────────
function PrivacySectionContent({ text }: { text: string }) {
  if (!text) return null;

  // Check if text has two distinct blocks separated by double line breaks
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  if (blocks.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        <PrivacyBlockContent text={blocks[0]} />
        
        {/* Subtle vertical divider with gold diamond */}
        <div className="hidden md:flex flex-col items-center justify-center self-stretch py-2">
          <div className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-[#E7DFED] to-transparent" />
          <span className="text-[#C8962A] text-xs py-1.5 select-none">◆</span>
          <div className="w-[1px] flex-1 bg-gradient-to-b from-transparent via-[#E7DFED] to-transparent" />
        </div>

        <PrivacyBlockContent text={blocks[1]} />
      </div>
    );
  }

  return <PrivacyBlockContent text={text} />;
}

function PrivacyBlockContent({ text }: { text: string }) {
  const lines = text.split(/\n+/).filter((line) => line.trim().length > 0);

  return (
    <div className="space-y-2.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const isBullet =
          trimmed.startsWith('•') ||
          trimmed.startsWith('-') ||
          trimmed.startsWith('*') ||
          /^\d+[.)]/.test(trimmed);

        if (isBullet) {
          const cleanText = trimmed.replace(/^[•\-*\d.)]+\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 ms-2 sm:ms-3 my-1">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#C8962A] mt-2 shadow-2xs ring-2 ring-[#C8962A]/20" />
              <span className="text-sm sm:text-base font-medium text-[#4A3B5C] leading-relaxed">
                {cleanText}
              </span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-sm sm:text-base font-semibold leading-relaxed text-[#35145C]">
            {line}
          </p>
        );
      })}
    </div>
  );
}

