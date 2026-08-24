import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Wifi,
  Users,
  BarChart3,
  Download,
  Video,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Share2,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { LoadingState, ErrorState, EmptyState, Button, Badge } from '@/components/ui';
import { courseService, queryKeys, interactionService } from '@/services';
import { pickLang, formatDate, formatTime } from '@/lib/utils';
import { contentFilePreviewUrl } from '@/lib/storageFiles';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
import { AxisTagsForItems } from '@/features/scientific-map/AxisTags';
import { useToast } from '@/components/ui';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const toast = useToast();

  const { data: item, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.courseItem(slug ?? ''),
    queryFn: () => (slug ? courseService.getItemBySlug(slug) : null),
    enabled: Boolean(slug),
  });

  // تسجيل مشاهدة حقيقية عند فتح صفحة الدورة/المحاضرة العامة.
  // التكرار ممنوع عبر الجلسة (dedupeKey) ومن جهة الخادم (trigger dedupe_content_interaction لساعة واحدة).
  useEffect(() => {
    if (item?.id) {
      void interactionService.recordView(item.contentType, item.id).catch(() => undefined);
    }
  }, [item?.id, item?.contentType]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={t('common.error')} onRetry={() => void refetch()} />;
  if (!item) return <EmptyState title={t('common.notFound')} />;

  const title = pickLang(item.title_ar, item.title_en, locale);
  const shortDesc = pickLang(item.short_description_ar, item.short_description_en, locale);
  const fullDesc = pickLang(item.description_ar, item.description_en, locale);
  const instructor = pickLang(item.instructor_ar, item.instructor_en, locale);
  const duration = pickLang(item.duration_ar, item.duration_en, locale);
  const location = pickLang(item.location_ar, item.location_en, locale);
  const imageUrl = item.image_path ? contentFilePreviewUrl(item.image_path) : null;

  const isOnline = item.delivery_mode === 'online';
  const isHybrid = item.delivery_mode === 'hybrid';
  const isUpcoming = item.event_status === 'upcoming';
  const levelKey = item.level ? `courses.levels.${item.level}` : 'courses.levels.general';

  const handleDownload = async () => {
    if (!item.materials_path) return;
    try {
      await interactionService.triggerDownload(item.contentType, item.id, item.materials_path);
      toast.success(t('common.downloadStarted') || 'جاري تحميل المواد...');
    } catch {
      toast.error(t('errors.downloadFailed'));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      void navigator.share({ title: title ?? '', url: window.location.href });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.copied') || 'تم نسخ الرابط');
    }
  };

  return (
    <>
      <Seo title={title ?? t('courses.title')} description={shortDesc || fullDesc || ''} />

      <div className="container-page py-10">
        {/* العودة لقائمة الدورات والمحاضرات */}
        <div className="mb-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-900 transition-colors"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            <span>{t('courses.title')}</span>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* العمود الرئيسي: التفاصيل الكاملة (اليسار/اليمين حسب RTL) */}
          <div className="space-y-6 lg:col-span-2">
            {/* بطاقة العنوان والمحتوى الرئيسية */}
            <div className="rounded-2xl border border-primary-100 bg-white p-6 sm:p-8 shadow-sm">
              {/* وسائط الغلاف */}
              {imageUrl && (
                <div className="mb-6 overflow-hidden rounded-xl bg-primary-50">
                  <img
                    src={imageUrl}
                    alt={title ?? ''}
                    className="max-h-96 w-full object-cover"
                  />
                </div>
              )}

              {/* الشارات العلوية */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge tone={item.contentType === 'course' ? 'primary' : 'gold'}>
                  {item.contentType === 'course' ? t('courses.title') : t('courses.lecturesTitle')}
                </Badge>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    isUpcoming ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isUpcoming ? t('courses.statuses.upcoming') : t('courses.statuses.completed')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-primary-900">
                  {isOnline ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-primary-600" />
                      <span>{t('courses.modes.online')}</span>
                    </>
                  ) : isHybrid ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-primary-600" />
                      <span>{t('courses.modes.hybrid')}</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5 text-primary-600" />
                      <span>{t('courses.modes.inPerson')}</span>
                    </>
                  )}
                </span>
              </div>

              {/* العنوان والملخص */}
              <h1 className="font-display text-2xl font-extrabold text-primary-950 sm:text-3xl">
                {title}
              </h1>

              {shortDesc && (
                <p className="mt-3 text-base font-medium leading-relaxed text-slateGray">
                  {shortDesc}
                </p>
              )}

              {/* التفاصيل الكاملة */}
              {fullDesc && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h2 className="mb-3 font-display text-lg font-bold text-primary-900">
                    {t('common.overview') || 'التفاصيل الكاملة'}
                  </h2>
                  <div className="prose prose-purple max-w-none text-sm leading-relaxed text-slateGray-dark whitespace-pre-line">
                    {fullDesc}
                  </div>
                </div>
              )}

              {/* المحاور العلمية المرتبطة */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <AxisTagsForItems contentType={item.contentType} contentIds={[item.id]} renderContentId={item.id} />
              </div>
            </div>
          </div>

          {/* العمود الجانبي: بطاقة المعلومات السريعة والإجراءات */}
          <div className="space-y-6">
            <div className="sticky top-20 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-display text-base font-bold text-primary-950 border-b border-slate-100 pb-3">
                {t('courses.executionDate') ? 'معلومات الفعالية' : 'معلومات الفعالية'}
              </h3>

              <div className="space-y-4 text-sm">
                {/* المحاضر */}
                {instructor && (
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                    <div>
                      <span className="block text-xs font-semibold text-slateGray">{t('courses.instructor')}</span>
                      <span className="font-bold text-primary-950">{instructor}</span>
                    </div>
                  </div>
                )}

                {/* تاريخ التنفيذ */}
                {item.activity_date && (
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                    <div>
                      <span className="block text-xs font-semibold text-slateGray">{t('courses.executionDate')}</span>
                      <span className="font-bold text-primary-950">
                        {formatDate(item.activity_date, locale)}
                        {formatTime(item.activity_date, locale) !== '00:00' && ` — ${formatTime(item.activity_date, locale)}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* المدة */}
                {duration && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                    <div>
                      <span className="block text-xs font-semibold text-slateGray">{t('courses.duration')}</span>
                      <span className="font-bold text-primary-950">{duration}</span>
                    </div>
                  </div>
                )}

                {/* المستوى */}
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                  <div>
                    <span className="block text-xs font-semibold text-slateGray">{t('courses.level')}</span>
                    <span className="font-bold text-primary-950">{t(levelKey)}</span>
                  </div>
                </div>

                {/* المكان */}
                {location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                    <div>
                      <span className="block text-xs font-semibold text-slateGray">{t('courses.location')}</span>
                      <span className="font-bold text-primary-950">{location}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* أزرار الإجراءات */}
              <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                {item.registration_url && (
                  <a
                    href={item.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full" variant="gold" leftIcon={<ExternalLink className="h-4 w-4" />}>
                      {t('courses.registerNow')}
                    </Button>
                  </a>
                )}

                {item.meeting_url && (
                  <a
                    href={item.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full" variant="outline" leftIcon={<Video className="h-4 w-4" />}>
                      {t('courses.joinMeeting')}
                    </Button>
                  </a>
                )}

                {item.video_url && (
                  <a
                    href={item.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full" variant="outline" leftIcon={<GraduationCap className="h-4 w-4" />}>
                      {t('courses.watchVideo')}
                    </Button>
                  </a>
                )}

                {item.materials_path && (
                  <Button
                    className="w-full"
                    variant="outline"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => void handleDownload()}
                  >
                    {t('courses.downloadMaterials')}
                  </Button>
                )}

                <div className="flex gap-2 pt-2">
                  <FavoriteButton contentType={item.contentType} contentId={item.id} />
                  <Button variant="ghost" className="w-full" leftIcon={<Share2 className="h-4 w-4" />} onClick={handleShare}>
                    {t('common.share') || 'مشاركة'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
