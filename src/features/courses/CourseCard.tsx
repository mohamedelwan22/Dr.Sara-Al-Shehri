import { useTranslation } from 'react-i18next';
import { CalendarDays, MapPin, Presentation } from 'lucide-react';
import { Card, CardBody, CardTitle, Badge } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { AxisTagsForItems } from '@/features/scientific-map/AxisTags';
import type { Course } from '@/types';

export function CourseCard({
  course,
  contentType,
  locale,
}: {
  course: Course;
  contentType: 'course' | 'lecture';
  locale: 'ar' | 'en';
}) {
  const { t } = useTranslation();
  const title = pickLang(course.title_ar, course.title_en, locale);
  const description = pickLang(course.description_ar, course.description_en, locale);
  const location = pickLang(course.location_ar, course.location_en, locale);

  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge tone={contentType === 'course' ? 'primary' : 'gold'}>
            <Presentation className="h-3.5 w-3.5" />
            {contentType === 'course' ? t('calendar.eventType.course') : t('courses.lecturesTitle')}
          </Badge>
          {course.activity_date && (
            <span className="flex items-center gap-1 text-xs font-bold text-slateGray">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(course.activity_date, locale)}
            </span>
          )}
        </div>

        <CardTitle className="mb-2 line-clamp-2">{title}</CardTitle>
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slateGray-dark">{description}</p>

        <div className="mt-auto space-y-2">
          {location && (
            <p className="flex items-center gap-1.5 text-sm text-slateGray-dark">
              <MapPin className="h-4 w-4 text-primary-400" />
              {location}
            </p>
          )}
          <AxisTagsForItems contentType={contentType} contentIds={[course.id]} renderContentId={course.id} />
        </div>
      </CardBody>
    </Card>
  );
}
