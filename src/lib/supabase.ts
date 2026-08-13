import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/lib/env';

/**
 * عميل Supabase الوحيد في التطبيق — anon key فقط.
 * كل الوصول للبيانات يمر عبر الخدمات النمطية (services) وليس مباشرة من الصفحات.
 */
export const supabase = createClient(
  env.supabaseUrl ?? 'https://placeholder.supabase.co',
  env.supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    );
  }
  return supabase;
}

/** رابط عام لملف في تخزين Supabase (لا يتطلب تهيئة كاملة). */
export function getPublicStorageUrl(bucket: string, path: string): string {
  if (!path) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
