import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock, Download, MapPin, Presentation, Video, Users, GraduationCap } from 'lucide-react';
import { Card, CardBody, CardTitle, Badge, Button } from '@/components/ui';
import { pickLang, formatDate, formatTime } from '@/lib/utils';
import { AxisTagsForItems } from '@/features/scientific-map/AxisTags';
import { contentFilePreviewUrl } from '@/lib/storageFiles';
import { interactionService } from '@/services';
import { useToast } from '@/components/ui';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
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
  const toast = useToast();
  const title = pickLang(course.title_ar, course.title_en, locale);
  const description = pickLang(course.description_ar, course.description_en, locale);
  const location = pickLang(course.location_ar, course.location_en, locale);
  const imageUrl = course.image_path && contentFilePreviewUrl(course.image_path);

  const handleDownload = async () => {
    if (!course.materials_path) return;
    try {
      await interactionService.triggerDownload(contentType, course.id, course.materials_path);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === 'errors.unauthorizedDownload'
          ? t('errors.unauthorizedDownload')
          : t('errors.downloadFailed'),
      );
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {imageUrl && (
        <img src={imageUrl} alt={title ?? ''} className="h-40 w-full object-cover" />
      )}
      <CardBody className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge tone={contentType === 'course' ? 'primary' : 'gold'}>
            <Presentation className="h-3.5 w-3.5" />
            {contentType === 'course' ? t('calendar.eventType.course') : t('courses.lecturesTitle')}
          </Badge>
          {course.activity_date && (
            <span className="flex flex-wrap items-center justify-end gap-x-2 text-xs font-bold text-slateGray">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(course.activity_date, locale)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(course.activity_date, locale)}
                {course.ends_at ? ` — ${formatTime(course.ends_at, locale)}` : ''}
              </span>
            </span>
          )}
        </div>

        <CardTitle className="mb-2 line-clamp-2">{title}</CardTitle>
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slateGray-dark">{description}</p>

        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap gap-2">
            <FavoriteButton contentType={contentType} contentId={course.id} />
            {course.registration_url && (
              <a
                href={course.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button size="sm" leftIcon={<Users className="h-3.5 w-3.5" />}>
                  {t('courses.register')}
                </Button>
              </a>
            )}
            {course.meeting_url && (
              <a
                href={course.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button size="sm" variant="outline" leftIcon={<Video className="h-3.5 w-3.5" />}>
                  {t('courses.joinMeeting')}
                </Button>
              </a>
            )}
            {course.video_url && (
              <a
                href={course.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button size="sm" variant="outline" leftIcon={<GraduationCap className="h-3.5 w-3.5" />}>
                  {t('courses.watchVideo')}
                </Button>
              </a>
            )}
            {course.materials_path && (
              <Button size="sm" variant="outline" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={() => void handleDownload()}>
                {t('courses.downloadMaterials')}
              </Button>
            )}
          </div>
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
