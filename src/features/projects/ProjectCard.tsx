import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Hourglass,
  Clock,
  CalendarDays,
  Star,
  User as UserIcon,
  MapPin,
} from 'lucide-react';
import { pickLang } from '@/lib/utils';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
import { resolveProjectImageUrl } from '@/lib/projectImage';
import type { ResearchProject } from '@/types';

function statusMeta(
  status: string | null,
  complete: string,
  ongoing: string,
  longTerm: string,
) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('مكتمل') || s.includes('completed'))
    return { tone: 'emerald' as const, Icon: CheckCircle2, label: complete };
  if (s.includes('طويل المدى') || s.includes('long'))
    return { tone: 'sky' as const, Icon: CalendarDays, label: longTerm };
  if (s.includes('مستمر') || s.includes('ongoing'))
    return { tone: 'amber' as const, Icon: Clock, label: ongoing };
  return { tone: 'purple' as const, Icon: Clock, label: s || ongoing };
}

export function ProjectCard({
  project,
  locale,
}: {
  project: ResearchProject;
  locale: 'ar' | 'en';
}) {
  const { t } = useTranslation();
  const title = pickLang(project.title_ar, project.title_en, locale);
  const shortDesc = pickLang(project.short_description_ar, project.short_description_en, locale);
  const description = pickLang(project.description_ar, project.description_en, locale);
  const displayText = shortDesc || description;
  const researcher = pickLang(project.researcher_ar, project.researcher_en, locale);
  const university = pickLang(project.university_ar, project.university_en, locale);
  const projectType = pickLang(project.project_type, project.project_type, locale);

  const metrics = project.metrics ?? {
    totalTheses: 0,
    awardedTheses: 0,
    inProgressTheses: 0,
    progressPercent: 0,
  };

  const { tone: statusTone, Icon: StatusIcon, label: statusLabel } = statusMeta(
    project.project_status,
    t('projects.completed'),
    t('projects.ongoing'),
    t('projects.longTerm'),
  );

  const imageUrl = resolveProjectImageUrl(project.image_path);

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E7DFED] bg-white shadow-xs transition-all duration-300 hover:shadow-md h-full">
      {/* Cover Image */}
      {imageUrl && (
        <div className="relative h-36 w-full overflow-hidden bg-[#FAF8FC]">
          <img
            src={imageUrl}
            alt={title ?? ''}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              // Hide the container gracefully on load failure
              const container = (e.currentTarget as HTMLImageElement).parentElement;
              if (container) container.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Top Bar: Status + Favorite + Featured */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${
                statusTone === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : statusTone === 'sky'
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : statusTone === 'amber'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-purple-200 bg-purple-50 text-purple-700'
              }`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              <span>{statusLabel}</span>
            </span>
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Star className="h-3 w-3" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FavoriteButton contentType="project" contentId={project.id} />
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E7DFED] bg-[#F5F0FA] text-[#35145C] shadow-2xs">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Project Type Badge */}
        {projectType && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-[#FAF8FC] border border-[#E7DFED] px-2.5 py-0.5 text-[10px] font-bold text-[#35145C]">
              {projectType}
            </span>
          </div>
        )}

        {/* Project Title */}
        <div className="my-3 text-center flex-1 flex flex-col">
          <h3 className="line-clamp-2 min-h-[3rem] flex items-center justify-center font-display text-base sm:text-lg font-bold leading-snug text-[#35145C]">
            <Link to={`/projects/${project.slug}`} className="transition-colors hover:text-primary-600">
              {title}
            </Link>
          </h3>

          {/* Researcher & University */}
          {(researcher || university) && (
            <div className="mt-1.5 flex flex-col items-center gap-0.5">
              {researcher && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <UserIcon className="h-3 w-3 text-[#D89A16]" />
                  {researcher}
                </span>
              )}
              {university && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <MapPin className="h-3 w-3 text-[#D89A16]" />
                  {university}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {displayText && (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 min-h-[2.75rem]">
              {displayText}
            </p>
          )}

          {/* Gold Separator */}
          <div className="relative my-4 flex h-px w-full items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/40 to-transparent">
            <span className="absolute bg-white px-2 text-[9px] text-[#D89A16]">❖</span>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="mt-auto">
          <p className="mb-2 text-center text-xs font-bold text-[#D89A16]">
            {t('projects.metricsTitle')}
          </p>

          {/* 3 Metrics Boxes */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DFED]/80 bg-[#FAF8FC] p-2 sm:p-2.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5">
                <GraduationCap className="h-3.5 w-3.5 text-[#35145C]" />
                {t('projects.thesesCount')}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#35145C]">
                {metrics.totalTheses}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DFED]/80 bg-[#FAF8FC] p-2 sm:p-2.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {t('projects.awardedCount')}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#35145C]">
                {metrics.awardedTheses}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E7DFED]/80 bg-[#FAF8FC] p-2 sm:p-2.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5">
                <Hourglass className="h-3.5 w-3.5 text-amber-600" />
                {t('projects.inProgressCount')}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#35145C]">
                {metrics.inProgressTheses}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">
              {t('projects.progressRate')}
            </span>
            <div className="flex items-center gap-2">
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#E7DFED]/60">
                <div
                  className="h-full rounded-full bg-[#35145C] transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, metrics.progressPercent))}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#35145C] w-9 text-end">
                {metrics.progressPercent}%
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#D89A16] block pt-1">
              {statusLabel}
            </span>
          </div>

          {/* CTA Button */}
          <div className="mt-4">
            <Link
              to={`/projects/${project.slug}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#35145C] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#2A104A] hover:shadow-md active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span>{t('projects.viewProject')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
