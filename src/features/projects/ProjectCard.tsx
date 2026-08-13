import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarRange, Lightbulb } from 'lucide-react';
import { Card, CardBody, CardTitle, Badge } from '@/components/ui';
import { pickLang, formatMonthYear } from '@/lib/utils';
import { AxisTagsForItems } from '@/features/scientific-map/AxisTags';
import type { ResearchProject } from '@/types';

export function ProjectCard({
  project,
  locale,
}: {
  project: ResearchProject;
  locale: 'ar' | 'en';
}) {
  const { t } = useTranslation();
  const title = pickLang(project.title_ar, project.title_en, locale);
  const description = pickLang(project.description_ar, project.description_en, locale);

  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <Lightbulb className="h-6 w-6" />
          </div>
          {project.project_status && <Badge tone="gold">{project.project_status}</Badge>}
        </div>

        <CardTitle className="mb-2 line-clamp-2 min-h-[3.5rem]">
          <Link to={`/projects/${project.slug}`} className="transition-colors hover:text-primary-600">
            {title}
          </Link>
        </CardTitle>

        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slateGray-dark">{description}</p>

        <div className="mt-auto space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slateGray">
            <CalendarRange className="h-3.5 w-3.5 text-primary-400" />
            {formatMonthYear(project.start_date, locale)}
            {project.end_date && ` — ${formatMonthYear(project.end_date, locale)}`}
          </p>
          <AxisTagsForItems contentType="project" contentIds={[project.id]} renderContentId={project.id} />
          <Link to={`/projects/${project.slug}`} className="btn-gold mt-1 w-full">
            {t('projects.viewProject')}
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
