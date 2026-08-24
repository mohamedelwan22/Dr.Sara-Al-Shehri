import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Wifi,
  Users,
  Eye,
  Edit3,
  Presentation,
  Mic,
  GraduationCap,
  BookOpen,
  User,
  BarChart3,
} from 'lucide-react';
import { pickLang, formatDate } from '@/lib/utils';
import { contentFilePreviewUrl } from '@/lib/storageFiles';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
import type { CourseOrLectureItem } from '@/types';

export function CourseCard({
  course,
  locale,
}: {
  course: CourseOrLectureItem;
  locale: 'ar' | 'en';
}) {
  const { t } = useTranslation();

  const title = pickLang(course.title_ar, course.title_en, locale);
  const shortDesc =
    pickLang(course.short_description_ar, course.short_description_en, locale) ||
    pickLang(course.description_ar, course.description_en, locale);
  const instructor = pickLang(course.instructor_ar, course.instructor_en, locale);
  const duration = pickLang(course.duration_ar, course.duration_en, locale);
  const imageUrl = course.image_path ? contentFilePreviewUrl(course.image_path) : null;

  // نمط الحضور: online | in_person | hybrid
  const deliveryMode = course.delivery_mode || 'online';
  const isOnline = deliveryMode === 'online';
  const isHybrid = deliveryMode === 'hybrid';

  // حالة الفعالية: upcoming | completed
  const eventStatus = course.event_status || 'completed';
  const isUpcoming = eventStatus === 'upcoming';

  // المستوى التعليمي
  const levelKey = course.level
    ? `courses.levels.${course.level}`
    : 'courses.levels.general';

  // أيقونة علمية في حال عدم رفع صورة غلاف
  const renderIcon = () => {
    if (course.contentType === 'lecture') {
      return <Mic className="h-8 w-8 text-[#35145C]" />;
    }
    if (course.level === 'advanced') {
      return <GraduationCap className="h-8 w-8 text-[#35145C]" />;
    }
    if (course.level === 'intermediate') {
      return <BookOpen className="h-8 w-8 text-[#35145C]" />;
    }
    return <Presentation className="h-8 w-8 text-[#35145C]" />;
  };

  return (
    <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-[#E7DFED] bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div>
        {/* الشريط العلوي: نمط الحضور والحالة */}
        <div className="mb-4 flex items-center justify-between gap-2">
          {/* اليمين (RTL): نمط الحضور */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F0FA] px-3 py-1 text-xs font-bold text-[#35145C] border border-[#E7DFED]/60">
            {isOnline ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-[#35145C]" />
                <span>{t('courses.modes.online')}</span>
              </>
            ) : isHybrid ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-[#35145C]" />
                <span>{t('courses.modes.hybrid')}</span>
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5 text-[#35145C]" />
                <span>{t('courses.modes.inPerson')}</span>
              </>
            )}
          </div>

          {/* اليسار (RTL): شارة الحالة (منجزة / قريباً) + زر المفضلات */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                isUpcoming
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isUpcoming ? t('courses.statuses.upcoming') : t('courses.statuses.completed')}
            </span>
            <FavoriteButton contentType={course.contentType} contentId={course.id} />
          </div>
        </div>

        {/* صورة الغلاف أو الأيقونة العلمية */}
        <div className="mb-4 flex justify-center">
          {imageUrl ? (
            <div className="h-32 w-full overflow-hidden rounded-xl bg-[#F5F0FA]">
              <img
                src={imageUrl}
                alt={title ?? ''}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F0FA] ring-4 ring-[#F5F0FA]/60 text-[#35145C] shadow-inner">
              {renderIcon()}
            </div>
          )}
        </div>

        {/* العنوان والوصف المختصر والفاصل المذهب */}
        <div className="text-center">
          <Link to={`/courses/${course.slug}`} className="block">
            <h3 className="font-display text-base sm:text-lg font-bold text-[#35145C] transition-colors group-hover:text-primary-600 line-clamp-2 min-h-[2.75rem] flex items-center justify-center">
              {title}
            </h3>
          </Link>

          {/* فاصل مذهب تزييني تحت العنوان */}
          <div className="relative my-2.5 flex h-px w-full items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/40 to-transparent">
            <span className="bg-white px-1.5 text-[9px] text-[#D89A16]">❖</span>
          </div>

          {shortDesc && (
            <p className="mt-1 text-xs leading-relaxed text-slateGray line-clamp-2 min-h-[2rem]">
              {shortDesc}
            </p>
          )}
        </div>

        {/* شريط البيانات الإضافية: المدة، المحاضر، المستوى (3 أعمدة) */}
        <div className="mt-4 grid grid-cols-3 items-center justify-between border-y border-[#E7DFED] py-2.5 text-center text-xs text-slateGray">
          {/* 1. المدة */}
          <div className="flex items-center justify-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#D89A16]" />
            <span className="truncate font-semibold text-[#35145C]">{duration || '-'}</span>
          </div>

          {/* 2. المحاضر */}
          <div className="flex items-center justify-center gap-1 border-x border-[#E7DFED] px-1">
            <User className="h-3.5 w-3.5 shrink-0 text-[#D89A16]" />
            <span className="truncate font-semibold text-[#35145C]">{instructor || 'أ.د. سارة الشهري'}</span>
          </div>

          {/* 3. المستوى */}
          <div className="flex items-center justify-center gap-1">
            <BarChart3 className="h-3.5 w-3.5 shrink-0 text-[#D89A16]" />
            <span className="truncate font-semibold text-[#35145C]">{t(levelKey)}</span>
          </div>
        </div>
      </div>

      {/* الجزء السفلي: تاريخ التنفيذ + زر الإجراء الرئيسي */}
      <div className="mt-4 pt-1">
        <div className="flex items-center justify-between gap-2">
          {/* تاريخ التنفيذ */}
          <div className="flex flex-col text-right text-xs">
            <span className="font-medium text-slateGray">{t('courses.executionDate')}</span>
            <span className="mt-0.5 flex items-center gap-1 font-bold text-[#35145C]">
              <CalendarDays className="h-3.5 w-3.5 text-[#D89A16]" />
              {course.activity_date ? formatDate(course.activity_date, locale) : '-'}
            </span>
          </div>

          {/* زر الإجراء الرئيسي */}
          {isUpcoming && course.registration_url ? (
            <a
              href={course.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C8962A] px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#B38322] hover:shadow-xs active:scale-95"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t('courses.registerNow')}</span>
            </a>
          ) : (
            <Link
              to={`/courses/${course.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#35145C] px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all hover:bg-[#2A104A] hover:shadow-xs active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{t('courses.viewDetails')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
