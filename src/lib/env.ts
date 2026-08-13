/**
 * قراءة متغيرات البيئة بطريقة آمنة.
 * anon key فقط — service_role لا يُستورد أبدًا إلى التطبيق.
 */
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  supabaseFunctionsUrl: (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
    (import.meta.env.VITE_SUPABASE_URL
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
      : undefined)) as string | undefined,
  recordInteractionFunction: (import.meta.env.VITE_RECORD_INTERACTION_FUNCTION ||
    'record-interaction') as string,
};

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey,
);
