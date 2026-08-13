import { requireSupabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import type { ContentMetrics, Favorite } from '@/types';
import type { AxisContentType } from '@/types';

const PRIVATE_BUCKETS = [
  'research-documents',
  'publication-documents',
  'course-assets',
  'project-documents',
] as const;

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
   * تنزيل مستند حقيقي:
   * - ملفات الـ buckets الخاصة تمر عبر Edge Function (signed-download) بصلاحية خادم.
   * - ملفات عامة عبر public URL.
   * أي تنزيل محمي يتطلب تسجيل دخول ويُسجَّل في content_downloads.
   */
  async getDocumentUrl(
    contentType: string,
    contentId: string,
    storagePath: string,
  ): Promise<{ url: string; public: boolean }> {
    const client = requireSupabase();
    const bucket = storagePath.split('/')[0];
    const isPrivate = (PRIVATE_BUCKETS as readonly string[]).includes(bucket);

    if (isPrivate) {
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session?.user.id) throw new Error('auth-required');

      const functionsBase = env.supabaseFunctionsUrl ?? `${env.supabaseUrl}/functions/v1`;
      const response = await fetch(`${functionsBase}/signed-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bucket,
          path: storagePath,
          content_type: contentType,
          content_id: contentId,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = (body as { error?: string } | null)?.error;
        if (message === 'unauthorized-download') throw new Error('errors.unauthorizedDownload');
        throw new Error('errors.uploadFailed');
      }
      const body = (await response.json()) as { signedUrl: string };
      return { url: body.signedUrl, public: false };
    }

    const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
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
