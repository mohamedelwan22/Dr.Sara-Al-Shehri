import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  Target,
  GraduationCap,
  User as UserIcon,
  CalendarDays,
  CheckCircle2,
  Eye,
  Clock,
  MapPin,
  Building2,
  Compass,
  Wrench,
  BarChart3,
  Hash,
  Star,
  Award,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { projectService, queryKeys } from '@/services';
import { ErrorState, LoadingState } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { RecordView, MetricsRow } from '@/features/interactions/Interactions';
import { AxisTagsForSingle } from '@/features/scientific-map/AxisTags';
import { resolveProjectImageUrl } from '@/lib/projectImage';

export function ProjectDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const { slug } = useParams<{ slug: string }>();

  const query = useQuery({
    queryKey: queryKeys.projectItem(slug ?? ''),
    queryFn: () => projectService.getBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />;

  const project = query.data;
  if (!project) return <ErrorState message={t('common.notFound')} />;

  const title = pickLang(project.title_ar, project.title_en, locale);
  const description = pickLang(project.description_ar, project.description_en, locale);
  const shortDesc = pickLang(project.short_description_ar, project.short_description_en, locale);
  const researcher = pickLang(project.researcher_ar, project.researcher_en, locale);
  const university = pickLang(project.university_ar, project.university_en, locale);
  const faculty = pickLang(project.faculty_ar, project.faculty_en, locale);
  const department = pickLang(project.department_ar, project.department_en, locale);
  const supervisor = pickLang(project.supervisor_ar, project.supervisor_en, locale);
  const objectives = pickLang(project.objectives_ar, project.objectives_en, locale);
  const methodology = pickLang(project.methodology_ar, project.methodology_en, locale);
  const outcomes = pickLang(project.outcomes_ar, project.outcomes_en, locale);
  const projectType = pickLang(project.project_type, project.project_type, locale);

  const metrics = project.metrics ?? {
    totalTheses: 0,
    awardedTheses: 0,
    inProgressTheses: 0,
    progressPercent: 0,
  };

  const statusLabel = project.project_status
    ? project.project_status
    : metrics.progressPercent === 100
    ? t('projects.completed')
    : t('projects.ongoing');

  const keywords = project.keywords
    ? project.keywords.split(/[,،]/).map((k) => k.trim()).filter(Boolean)
    : [];

  const peopleItems = [
    { icon: UserIcon, label: t('projects.researcher'), value: researcher },
    { icon: MapPin, label: t('projects.university'), value: university },
    { icon: Building2, label: t('projects.faculty'), value: faculty },
    { icon: Compass, label: t('projects.department'), value: department },
    { icon: Award, label: t('projects.supervisor'), value: supervisor },
  ].filter((item) => Boolean(item.value));

  const academicItems = [
    { icon: GraduationCap, label: t('projects.academicDegree'), value: project.academic_degree },
    { icon: Star, label: t('projects.participationType'), value: project.participation_type },
    { icon: CalendarDays, label: t('projects.startDate'), value: project.start_date ? formatDate(project.start_date, locale) : null },
    { icon: CalendarDays, label: t('projects.endDate'), value: project.end_date ? formatDate(project.end_date, locale) : null },
  ].filter((item) => Boolean(item.value));

  return (
    <>
      <Seo title={title ?? ''} description={shortDesc || description || undefined} />
      <RecordView contentType="project" contentId={project.id} />

      <div className="container-page py-8 sm:py-10">
        {/* Back Link */}
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#35145C] transition-colors hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('projects.backToProjects')}
        </Link>

        {/* Hero Card Container */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E7DFED] bg-white p-6 sm:p-10 shadow-xs">
          {/* Cover Image */}
          {resolveProjectImageUrl(project.image_path) && (
            <div className="mb-6 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 overflow-hidden rounded-t-3xl h-48 sm:h-64">
              <img
                src={resolveProjectImageUrl(project.image_path)!}
                alt={title ?? ''}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const container = (e.currentTarget as HTMLImageElement).parentElement;
                  if (container) container.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Top Bookmark Ribbon */}
          <div className="absolute top-0 start-6 z-10 hidden sm:flex flex-col items-center pointer-events-none">
            <div
              className="flex h-14 w-10 items-start justify-center pt-2 bg-[#35145C] text-[#D89A16] shadow-2xs"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)' }}
            >
              <span className="text-sm font-bold">❖</span>
            </div>
          </div>

          {/* Top Header Tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 pe-0 sm:pe-12">
            <div className="flex items-center gap-2 flex-wrap">
              {projectType && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3E5C8] bg-[#FDF9F0] px-3.5 py-1 text-xs font-bold text-[#35145C]">
                  <BookOpen className="h-4 w-4 text-[#D89A16]" />
                  <span>{projectType}</span>
                </span>
              )}
              {project.project_status && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#E7DFED] bg-[#F5F0FA] px-3 py-1 text-xs font-bold text-[#35145C]">
                  {statusLabel}
                </span>
              )}
              {project.featured && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  <Star className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>

          {/* Project Title */}
          <h1 className="mt-6 mb-4 font-display text-2xl sm:text-3xl font-extrabold leading-relaxed text-[#35145C] text-center sm:text-start">
            {title}
          </h1>

          {/* Gold Line Separator */}
          <div className="relative my-6 flex h-px w-full items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/40 to-transparent">
            <span className="absolute bg-white px-2 text-xs text-[#D89A16]">❖</span>
          </div>

          {/* Section: People & Academic Info */}
          {(peopleItems.length > 0 || academicItems.length > 0) && (
            <div className="my-8 rounded-3xl border border-[#E7DFED] bg-[#FAF8FC] p-6 sm:p-8 overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between gap-4 mb-4 border-b border-[#E7DFED]/60 pb-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#35145C] flex items-center gap-2">
                  <span>{t('admin.formSections.peopleAcademic')}</span>
                </h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#35145C] border border-[#E7DFED] shadow-2xs">
                  <UserIcon className="h-5 w-5 text-[#35145C]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {peopleItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E7DFED] text-[#D89A16]">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#D89A16] uppercase tracking-wide">{item.label}</span>
                      <span className="block text-sm font-bold text-[#35145C]">{item.value}</span>
                    </div>
                  </div>
                ))}
                {academicItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E7DFED] text-[#D89A16]">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#D89A16] uppercase tracking-wide">{item.label}</span>
                      <span className="block text-sm font-bold text-[#35145C]">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: About the Project */}
          {description && (
            <div className="my-8 rounded-3xl border border-[#E7DFED] bg-[#FAF8FC] p-6 sm:p-8 relative overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between gap-4 mb-4 border-b border-[#E7DFED]/60 pb-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#35145C] flex items-center gap-2">
                  <span>{t('projects.aboutProject')}</span>
                </h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#35145C] border border-[#E7DFED] shadow-2xs">
                  <Target className="h-5 w-5 text-[#35145C]" />
                </div>
              </div>

              <div className="text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
                {description}
              </div>
            </div>
          )}

          {/* Section: Scientific Info (Objectives, Methodology, Outcomes) */}
          {(objectives || methodology || outcomes) && (
            <div className="my-8 rounded-3xl border border-[#E7DFED] bg-[#FAF8FC] p-6 sm:p-8 relative overflow-hidden shadow-2xs">
              <div className="flex items-center justify-between gap-4 mb-4 border-b border-[#E7DFED]/60 pb-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#35145C] flex items-center gap-2">
                  <span>{t('admin.formSections.scientificInfo')}</span>
                </h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#35145C] border border-[#E7DFED] shadow-2xs">
                  <Compass className="h-5 w-5 text-[#35145C]" />
                </div>
              </div>

              <div className="space-y-5">
                {objectives && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#D89A16] mb-1.5">
                      <Target className="h-4 w-4 text-[#35145C]" />
                      {t('projects.objectives')}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{objectives}</p>
                  </div>
                )}
                {methodology && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#D89A16] mb-1.5">
                      <Wrench className="h-4 w-4 text-[#35145C]" />
                      {t('projects.methodology')}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{methodology}</p>
                  </div>
                )}
                {outcomes && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#D89A16] mb-1.5">
                      <BarChart3 className="h-4 w-4 text-[#35145C]" />
                      {t('projects.outcomes')}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{outcomes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="my-6">
              <h3 className="mb-2.5 font-display text-sm font-bold text-[#35145C] flex items-center gap-1.5">
                <Hash className="h-4 w-4 text-[#D89A16]" />
                {t('projects.keywords')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-[#E7DFED] bg-[#FAF8FC] px-3 py-1 text-xs font-bold text-[#35145C]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Axes Tags */}
          <div className="my-6">
            <h3 className="mb-2.5 font-display text-sm font-bold text-[#35145C]">
              {t('research.relatedAxes')}
            </h3>
            <AxisTagsForSingle contentType="project" contentId={project.id} />
          </div>

          {/* Section 2: Related Theses Heading */}
          <div className="mt-10 mb-6 text-center">
            <div className="relative flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D89A16]/50" />
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#35145C] px-3">
                ❖ {t('projects.relatedTheses')} ❖
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D89A16]/50" />
            </div>
          </div>

          {/* Related Theses Cards List */}
          {project.relatedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E7DFED] bg-[#FAF8FC] p-8 text-center text-sm font-bold text-slate-500">
              {t('projects.noRelatedTheses')}
            </div>
          ) : (
            <div className="space-y-5">
              {project.relatedItems.map((item, index) => {
                const itemTitle = pickLang(item.title_ar, item.title_en, locale);
                const degreeText = (item.degree ? pickLang(item.degree, null, locale) : null) || t('projects.degree');
                const statusText = item.status === 'published' ? t('supervision.awarded') : t('supervision.inProgress');
                const thesisPath = `/${item.item_type === 'supervision' ? 'supervision' : 'discussions'}/${item.slug}`;
                const sequenceNumber = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={`${item.item_type}-${item.id}`}
                    className="relative overflow-hidden rounded-3xl border border-[#E7DFED] bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-md"
                  >
                    {/* Sequence Badge */}
                    <div className="absolute top-0 start-4 z-10 flex flex-col items-center pointer-events-none">
                      <div
                        className="flex h-11 w-9 items-center justify-center bg-[#35145C] text-white font-mono text-xs font-bold shadow-2xs"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)' }}
                      >
                        {sequenceNumber}
                      </div>
                    </div>

                    {/* Book Icon & Thesis Title */}
                    <div className="flex items-start gap-3 ps-8 pt-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E7DFED] bg-[#F5F0FA] text-[#35145C]">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-bold leading-snug text-[#35145C]">
                        <Link to={thesisPath} className="transition-colors hover:text-primary-600">
                          {itemTitle}
                        </Link>
                      </h3>
                    </div>

                    {/* 4 Metadata Items Grid */}
                    <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-[#E7DFED]/70 bg-[#FAF8FC] p-3.5 text-start">
                      <div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
                          <GraduationCap className="h-3.5 w-3.5 text-[#35145C]" />
                          {t('projects.degree')}
                        </span>
                        <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">{degreeText}</span>
                      </div>

                      <div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
                          <UserIcon className="h-3.5 w-3.5 text-[#35145C]" />
                          {t('projects.researcher')}
                        </span>
                        <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">
                          {pickLang(item.researcher_ar, item.researcher_en, locale)}
                        </span>
                      </div>

                      <div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
                          <CalendarDays className="h-3.5 w-3.5 text-[#35145C]" />
                          {t('projects.completionDate')}
                        </span>
                        <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">
                          {item.completion_date ? formatDate(item.completion_date, locale) : '—'}
                        </span>
                      </div>

                      <div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#D89A16]">
                          {item.status === 'published' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          )}
                          {t('projects.status')}
                        </span>
                        <span className="line-clamp-1 text-xs font-bold text-[#35145C] mt-0.5 block">{statusText}</span>
                      </div>
                    </div>

                    {/* View Summary CTA */}
                    <div className="text-center mt-3">
                      <Link
                        to={thesisPath}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#35145C] px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#2A104A] hover:shadow-md active:scale-95"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{t('projects.viewSummary')}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Social / Interaction Metrics Row */}
          <div className="mt-8 border-t border-[#E7DFED] pt-5">
            <MetricsRow contentType="project" contentId={project.id} />
          </div>
        </div>
      </div>
    </>
  );
}
