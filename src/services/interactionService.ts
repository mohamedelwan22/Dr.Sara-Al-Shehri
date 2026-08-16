import { requireSupabase } from '@/lib/supabase';
import { PRIVATE_CONTENT_BUCKETS, splitStoragePath } from '@/lib/storageFiles';
import type { ContentMetrics, Favorite } from '@/types';
import type { AxisContentType } from '@/types';

const PRIVATE_BUCKETS = PRIVATE_CONTENT_BUCKETS as readonly string[];

/** تفضيل محلول (تفضيل + بيانات العنصر الفعلي). */
export interface ResolvedFavorite {
  favorite: Favorite;
  content_type: string;
  id: string;
  slug: string | null;
  title_ar: string;
  title_en: string | null;
  status: string | null;
  updated_at: string | null;
  link: string;
}

interface FavoriteRow {
  id: string;
  slug: string | null;
  title_ar: string | null;
  title_en: string | null;
  status: string | null;
  updated_at: string | null;
}

/** خريطة نوع المحتوى ← جدول قاعدة البيانات + رابط العرض العام. */
const FAVORITE_TABLE_MAP: Record<
  string,
  { table: string; link: (slug: string | null, id: string) => string }
> = {
  research: { table: 'research_papers', link: (slug) => `/research/${slug ?? ''}` },
  publication: { table: 'publications', link: (slug) => `/publications/${slug ?? ''}` },
  supervision: { table: 'scientific_supervisions', link: (slug) => `/supervision/${slug ?? ''}` },
  discussion: { table: 'scientific_discussions', link: (slug) => `/discussions/${slug ?? ''}` },
  project: { table: 'research_projects', link: (slug) => `/projects/${slug ?? ''}` },
  course: { table: 'courses', link: () => '/courses?tab=course' },
  lecture: { table: 'lectures', link: () => '/courses?tab=lecture' },
  news: { table: 'news', link: (slug) => `/news/${slug ?? ''}` },
  insight: { table: 'scientific_insights', link: (slug) => `/insights/${slug ?? ''}` },
};

function visitorHash(): string {
  const key = 'platform-visitor-hash';
  let hash = sessionStorage.getItem(key);
  if (!hash) {
    hash = `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, hash);
  }
  return hash;
}

function dedupeKey(kind: 'view' | 'download' | 'share', contentType: string, contentId: string): boolean {
  const key = `interacted-${kind}-${contentType}-${contentId}`;
  if (sessionStorage.getItem(key)) return false;
  sessionStorage.setItem(key, '1');
  return true;
}

export const interactionService = {
  async getMetrics(contentType: string, contentId: string): Promise<ContentMetrics> {
    const { data, error } = await requireSupabase().rpc('count_content_metrics', {
      p_content_type: contentType,
      p_content_id: contentId,
    });
    if (error) throw error;
    return (data ?? {
      views: 0,
      downloads: 0,
      shares: 0,
      favorites: 0,
    }) as ContentMetrics;
  },

  async recordView(contentType: string, contentId: string): Promise<void> {
    if (!dedupeKey('view', contentType, contentId)) return;
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    await requireSupabase()
      .from('content_views')
      .insert({
        user_id: session?.user.id ?? null,
        content_type: contentType,
        content_id: contentId,
        visitor_hash: visitorHash(),
      });
  },

  async recordShare(contentType: string, contentId: string): Promise<void> {
    if (!dedupeKey('share', contentType, contentId)) return;
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    await requireSupabase()
      .from('content_shares')
      .insert({
        user_id: session?.user.id ?? null,
        content_type: contentType,
        content_id: contentId,
        visitor_hash: visitorHash(),
      });
  },

  async recordDownload(contentType: string, contentId: string): Promise<void> {
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    await requireSupabase()
      .from('content_downloads')
      .insert({
        user_id: session?.user.id ?? null,
        content_type: contentType,
        content_id: contentId,
        visitor_hash: visitorHash(),
      });
  },

  async toggleFavorite(contentType: string, contentId: string): Promise<boolean> {
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    const userId = session?.user.id;
    if (!userId) throw new Error('not-authenticated');

    const { data: existing } = await requireSupabase()
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle();

    if (existing) {
      const { error } = await requireSupabase()
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('content_type', contentType)
        .eq('content_id', contentId);
      if (error) throw error;
      return false;
    }

    const { error } = await requireSupabase()
      .from('favorites')
      .insert({ user_id: userId, content_type: contentType, content_id: contentId });
    if (error) throw error;
    return true;
  },

  async isFavorite(contentType: string, contentId: string): Promise<boolean> {
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    if (!session?.user.id) return false;
    const { data, error } = await requireSupabase()
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  },

  async listMyFavorites(): Promise<Favorite[]> {
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    if (!session?.user.id) return [];
    const { data, error } = await requireSupabase()
      .from('favorites')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Favorite[]) ?? [];
  },

  /**
   * تحويل التفضيلات إلى عناصر كاملة (عنوان/رابط/حالة) عبر قراءة الجدول المقابل
   * لكل نوع — دفعة واحدة لكل نوع. الوصول محكوم بـ RLS (التفضيلات خاصة بالمستخدم).
   */
  async resolveFavorites(): Promise<ResolvedFavorite[]> {
    const favorites = await interactionService.listMyFavorites();
    if (!favorites.length) return [];

    const byType: Record<string, Favorite[]> = {};
    for (const favorite of favorites) {
      (byType[favorite.content_type] ??= []).push(favorite);
    }

    const rows = await Promise.all(
      Object.entries(byType).map(async ([contentType, items]) => {
        const table = FAVORITE_TABLE_MAP[contentType];
        if (!table) return [];
        const ids = items.map((f) => f.content_id);
        const { data, error } = await requireSupabase()
          .from(table.table)
          .select('id, slug, title_ar, title_en, status, updated_at')
          .in('id', ids);
        if (error) throw error;
        const byId = new Map((data ?? []).map((row) => [row.id, row]));
        return items
          .filter((f) => byId.has(f.content_id))
          .map((favorite) => {
            const row = byId.get(favorite.content_id) as FavoriteRow;
            return {
              favorite,
              content_type: contentType,
              id: favorite.content_id,
              slug: row.slug ?? null,
              title_ar: row.title_ar ?? '',
              title_en: row.title_en ?? null,
              status: row.status ?? null,
              updated_at: row.updated_at ?? null,
              link: table.link(row.slug, favorite.content_id),
            } satisfies ResolvedFavorite;
          });
      }),
    );

    return rows.flat().sort((a, b) => {
      const ta = a.favorite.created_at ? new Date(a.favorite.created_at).getTime() : 0;
      const tb = b.favorite.created_at ? new Date(b.favorite.created_at).getTime() : 0;
      return tb - ta;
    });
  },

  /** إزالة تفضيل محدد (لصفحة /favorites). */
  async removeFavorite(contentType: string, contentId: string): Promise<void> {
    const {
      data: { session },
    } = await requireSupabase().auth.getSession();
    const userId = session?.user.id;
    if (!userId) throw new Error('not-authenticated');
    const { error } = await requireSupabase()
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('content_type', contentType)
      .eq('content_id', contentId);
    if (error) throw error;
  },

  /**
   * تنزيل مستند حقيقي:
   * - ملفات الـ buckets الخاصة تمر عبر Signed URL من الجلسة الحالية
   *   (createSignedUrl) — صلاحيته محكومة بـ RLS (الأدمن يقرأ/ينشئ، والزائر
   *   العام بلا صلاحية يرفض). لتفعيل تنزيل الزوار لملفات المنشورات الخاصة
   *   يُنشر Edge Function `signed-download` بصلاحية خادم بعد التحقق من النشر.
   * - ملفات عامة عبر public URL.
   * أي تنزيل محمي يتطلب تسجيل دخول ويُسجَّل في content_downloads.
   */
  async getDocumentUrl(
    _contentType: string,
    _contentId: string,
    storagePath: string,
  ): Promise<{ url: string; public: boolean }> {
    const client = requireSupabase();
    const bucket = splitStoragePath(storagePath).bucket;
    const isPrivate = PRIVATE_BUCKETS.includes(bucket);

    if (isPrivate) {
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session?.user.id) throw new Error('errors.unauthorizedDownload');

      const { bucket: b, path } = splitStoragePath(storagePath);
      const { data, error } = await client.storage.from(b).createSignedUrl(path, 60);
      if (error || !data?.signedUrl) {
        if (error?.statusCode === '400' || error?.message?.includes('authorized')) {
          throw new Error('errors.unauthorizedDownload');
        }
        throw new Error('errors.uploadFailed');
      }
      return { url: data.signedUrl, public: false };
    }

    const { bucket: publicBucket, path: publicPath } = splitStoragePath(storagePath);
    const { data } = client.storage.from(publicBucket).getPublicUrl(publicPath);
    return { url: data.publicUrl, public: true };
  },

  async triggerDownload(
    contentType: string,
    contentId: string,
    storagePath: string,
  ): Promise<void> {
    const { url } = await interactionService.getDocumentUrl(contentType, contentId, storagePath);
    await interactionService.recordDownload(contentType, contentId);
    window.open(url, '_blank', 'noopener,noreferrer');
  },
};

export type { AxisContentType };
