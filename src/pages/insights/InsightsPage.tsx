import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Quote,
  Share2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sprout,
  Check,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { newsService, queryKeys } from '@/services';
import { LoadingState, ErrorState, useToast } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import { FavoriteButton } from '@/features/interactions/FavoriteButton';
import { ArticleDetailPage } from '@/features/articles/ArticleDetailPage';

/* ───────────────────────── TYPES & FALLBACK DATA ───────────────────────── */

interface InsightItem {
  id: string;
  slug?: string;
  title_ar: string;
  title_en?: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  author_ar?: string;
  institution_ar?: string;
  tags?: string[];
  tab?: number;
}

const DAILY_INSIGHT = {
  quote:
    'طلب العلم فريضة على كل مسلم، ومن سهر في طلبه يسره الله طريقاً إلى علم نافع وعمل صالح.',
  author: 'الإمام أحمد بن حنبل',
};

const SAMPLE_TAGS: Record<number, string[]> = {
  0: ['النية', 'الإخلاص'],
  1: ['الإتقان', 'العمل'],
  2: ['طلب العلم', 'فضل العلم'],
  3: ['العمل بالعلم', 'الخشية'],
  4: ['نقد الأسانيد', 'منهج البحث'],
  5: ['تحقيق المتون', 'صيانة السنة'],
};

const FALLBACK_INSIGHTS: InsightItem[] = [
  {
    id: 'fb-1',
    slug: 'innama-al-aamal-bi-al-niyyat',
    title_ar: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.',
    excerpt_ar: 'إخلاص النية أساس قبول الأعمال وصلاحها.',
    author_ar: 'رواه البخاري ومسلم',
    tags: ['النية', 'الإخلاص'],
    tab: 0,
  },
  {
    id: 'fb-2',
    slug: 'in-allaha-yuhibbu-itha-amila-ahadukum',
    title_ar: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه.',
    excerpt_ar: 'الحث على الإتقان والجودة في كافة الأعمال والمجالات.',
    author_ar: 'رواه البيهقي في الشعب',
    tags: ['الإتقان', 'العمل'],
    tab: 0,
  },
  {
    id: 'fb-3',
    slug: 'man-salaka-tariqan-yaltamisu-fihi-ilman',
    title_ar:
      'من سلك طريقاً يلتمس فيه علماً، سهل الله له به طريقاً إلى الجنة.',
    excerpt_ar: 'فضل طلب العلم والسعي في تحصيله.',
    author_ar: 'رواه مسلم',
    tags: ['طلب العلم', 'فضل العلم'],
    tab: 0,
  },
  {
    id: 'fb-4',
    slug: 'al-ilm-in-lam-yanzidk-huda',
    title_ar: 'العلم إن لم يقترن بالعمل والخشية كان حجة على صاحبه.',
    excerpt_ar: 'ثمار العلم الفقه النافع والعمل الصالح.',
    author_ar: 'الإمام سفيان الثوري',
    tags: ['العمل بالعلم', 'الخشية'],
    tab: 1,
  },
  {
    id: 'fb-5',
    slug: 'nqd-al-asaneed-wa-al-mutun',
    title_ar: 'مناهج نقد الأسانيد والمتون تقوم على الدقة والاستقراء ودفع العلل.',
    excerpt_ar: 'معايير قبول الأخبار وتمحيص الروايات عند المحدثين.',
    author_ar: 'منهج البحث الحديثي',
    tags: ['نقد الأسانيد', 'منهج البحث'],
    tab: 2,
  },
  {
    id: 'fb-6',
    slug: 'tahqeeq-al-makhtootat-wa-diraasatuha',
    title_ar: 'تحقيق المخطوطات الحديثية يتطلب معرفة واسعة بقواعد الرسم والخطوط.',
    excerpt_ar: 'أصول خدمة النص الحديثي ونشره.',
    author_ar: 'قواعد التحقيق العلمية',
    tags: ['تحقيق المخطوطات', 'خدمة النص'],
    tab: 2,
  },
];

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */

export function InsightsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const toast = useToast();

  /* States */
  const [activeTab, setActiveTab] = useState(0); // 0: السنة, 1: أئمة الحديث, 2: منهجيات
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filters = useMemo(() => ({ page, pageSize: 9 }), [page]);

  /* Fetch Insights from Supabase */
  const query = useQuery({
    queryKey: queryKeys.insights(filters),
    queryFn: () => newsService.listInsights(filters),
  });

  /* Raw Items */
  const rawItems = query.data?.data ?? [];
  const displayItems = rawItems.length > 0 ? (rawItems as unknown as InsightItem[]) : FALLBACK_INSIGHTS;

  /* Filtered Items based on Tab & Search Query & Sort */
  const processedItems = useMemo(() => {
    let result = [...displayItems];

    // Filter by Tab
    if (activeTab === 0) {
      result = result.filter((item, idx) => (item.tab ?? (idx % 3)) === 0);
    } else if (activeTab === 1) {
      result = result.filter((item, idx) => (item.tab ?? (idx % 3)) === 1);
    } else if (activeTab === 2) {
      result = result.filter((item, idx) => (item.tab ?? (idx % 3)) === 2);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) => {
        const title = (pickLang(item.title_ar, item.title_en || '', locale) || '').toLowerCase();
        const excerpt = (pickLang(item.excerpt_ar || '', item.excerpt_en || '', locale) || '').toLowerCase();
        const author = (item.author_ar || '').toLowerCase();
        return title.includes(q) || excerpt.includes(q) || author.includes(q);
      });
    }

    // Sort Order
    if (sortOrder === 'asc') {
      result.reverse();
    }

    return result;
  }, [displayItems, activeTab, searchQuery, sortOrder, locale]);

  /* Total Count */
  const totalCount = query.data?.count ?? processedItems.length;

  /* Share Link Handler */
  const handleShare = (item: InsightItem) => {
    const url = `${window.location.origin}/insights/${item.slug || item.id}`;
    if (typeof window !== 'undefined' && window.navigator?.clipboard?.writeText) {
      void window.navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      toast.success(t('common.copied') || 'تم نسخ رابط الإضاءة');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <>
      <Seo
        title={t('insights.title') || 'إضاءات علمية'}
        description={t('insights.subtitle') || 'كلمات مضيئة من درر السنة النبوية'}
      />

      <div className="container-page py-4 sm:py-6">
        {/* ── MAIN PAGE LAYOUT (RTL Two Columns) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ── RIGHT COLUMN (Sidebar in RTL) ── */}
          <div className="space-y-5 lg:col-span-4">
            {/* A. Search Card */}
            <div className="rounded-2xl border border-[#E7DFED] bg-white p-4 shadow-xs sm:p-5">
              <h3 className="mb-3 text-center text-sm font-bold text-[#35145C]">
                بحث في الإضاءات
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في الإضاءات..."
                  className="h-10 w-full rounded-xl border border-[#DCD4E4] bg-white pe-4 ps-10 text-xs font-medium text-slate-800 shadow-xs placeholder:text-slate-400 focus:border-[#35145C] focus:outline-none focus:ring-1 focus:ring-[#35145C]/20"
                />
                <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#35145C]" />
              </div>
            </div>

            {/* B. Daily Insight Card */}
            <div className="rounded-2xl border border-[#E7DFED] bg-[#F5F0FA] p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#35145C]">
                  إضاءة اليوم
                </h3>
                <Quote className="h-5 w-5 rotate-180 text-[#5B2D8E]" />
              </div>

              <div className="my-4 text-center">
                <p className="text-xs font-medium leading-relaxed text-[#35145C] sm:text-sm">
                  «{DAILY_INSIGHT.quote}»
                </p>
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-[#35145C]">
                  {DAILY_INSIGHT.author}
                </span>
              </div>
            </div>
          </div>

          {/* ── LEFT COLUMN (Main Content in RTL) ── */}
          <div className="space-y-5 lg:col-span-8">
            {/* ── 1. HERO SECTION (spots.png image banner matching reference scale) ── */}
            <div className="overflow-hidden rounded-2xl border border-[#E7DFED] bg-white shadow-xs">
              <img
                src="/images/spots.png"
                alt="إضاءات علمية - أ.د. سارة بنت عزيز الشهري"
                loading="eager"
                className="h-auto w-full object-contain"
              />
            </div>
            {/* ── 3. TABS BAR ── */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 rounded-2xl border border-[#E7DFED] bg-[#F8F5FA] p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab(0)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 0
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F0EAFA] border border-transparent'
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>من هدي السنة النبوية</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 1
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F0EAFA] border border-transparent'
                }`}
              >
                <Sprout className="h-4 w-4 shrink-0" />
                <span>من أقوال أئمة الحديث</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(2)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 2
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F0EAFA] border border-transparent'
                }`}
              >
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>منهجيات بحثية</span>
              </button>
            </div>

            {/* ── 4. INSIGHTS HEADER (Count & Sort) ── */}
            <div className="flex items-center justify-between rounded-xl border border-[#E7DFED] bg-white px-4 py-2.5 shadow-xs">
              <div className="text-xs font-bold text-[#35145C]">
                عدد الإضاءات: <span className="text-[#D89A16]">{totalCount}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative inline-block">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                    className="h-8 appearance-none rounded-lg border border-[#E7DFED] bg-white pe-7 ps-3 text-xs font-bold text-[#35145C] focus:border-[#35145C] focus:outline-none cursor-pointer"
                  >
                    <option value="desc">الأحدث أولاً</option>
                    <option value="asc">الأقدم أولاً</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute start-auto end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#35145C]" />
                </div>
              </div>
            </div>

            {/* ── 5. INSIGHT CARDS GRID ── */}
            {query.isLoading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <LoadingState />
              </div>
            ) : query.isError ? (
              <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
            ) : processedItems.length === 0 ? (
              <div className="rounded-2xl border border-[#E7DFED] bg-white p-8 text-center shadow-xs">
                <p className="text-sm font-bold text-slate-500">
                  {t('common.noResults') || 'لا توجد إضاءات مطابقة حالياً'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {processedItems.map((item, index) => {
                  const titleText = pickLang(item.title_ar, item.title_en || '', locale) || item.title_ar || '';
                  const authorText = item.author_ar || 'السنة النبوية';
                  const tagsList =
                    item.tags ||
                    SAMPLE_TAGS[index % Object.keys(SAMPLE_TAGS).length] ||
                    ['السنة', 'البحث العلمي'];

                  return (
                    <div
                      key={item.id || index}
                      className="flex flex-col justify-between rounded-2xl border border-[#E7DFED] bg-white p-4 shadow-xs transition-shadow hover:shadow-md sm:p-5"
                    >
                      {/* Quote Icon Badge */}
                      <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#E7DFED] bg-[#F5F0FA] text-[#5B2D8E]">
                        <Quote className="h-4 w-4 rotate-180" />
                      </div>

                      {/* Quote Text */}
                      <div className="my-2 flex min-h-[64px] items-center justify-center text-center">
                        <p className="text-xs font-bold leading-relaxed text-[#35145C] sm:text-sm">
                          «{titleText}»
                        </p>
                      </div>

                      {/* Gold Divider Line with Diamond Ornament */}
                      <div className="relative my-3 flex h-px w-full items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/50 to-transparent">
                        <span className="absolute bg-white px-1 text-[8px] text-[#D89A16]">
                          ❖
                        </span>
                      </div>

                      {/* Source / Narrator */}
                      <div className="mb-3 text-center">
                        <span className="text-[11px] font-bold text-slate-500 sm:text-xs">
                          {authorText}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
                        {tagsList.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded-full border border-[#E7DFED]/80 bg-[#F5F0FA] px-2.5 py-0.5 text-[10px] font-bold text-[#35145C] sm:text-[11px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="flex items-center justify-between border-t border-[#E7DFED]/60 pt-3">
                        {/* Source Button */}
                        <Link
                          to={`/insights/${item.slug || item.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-[#E7DFED] bg-[#F8F5FA] px-3 py-1.5 text-[11px] font-bold text-[#35145C] transition-colors hover:bg-[#35145C] hover:text-white"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>عرض المصدر</span>
                        </Link>

                        {/* Actions: Share & Favorite */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleShare(item)}
                            title="مشاركة"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DFED] bg-white text-slate-600 transition-colors hover:bg-[#F5F0FA] hover:text-[#35145C]"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Share2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <FavoriteButton contentType="insight" contentId={item.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── 6. PAGINATION ── */}
            {query.data && query.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DFED] bg-white text-xs font-bold text-[#35145C] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </button>

                {Array.from({ length: query.data.totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPage(pNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      page === pNum
                        ? 'bg-[#35145C] text-white'
                        : 'border border-[#E7DFED] bg-white text-[#35145C] hover:bg-[#F5F0FA]'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= query.data.totalPages}
                  onClick={() => setPage((p) => Math.min(query.data.totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DFED] bg-white text-xs font-bold text-[#35145C] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── DETAIL PAGE ───────────────────────── */

export function InsightDetailPage() {
  return <ArticleDetailPage kind="insight" />;
}
