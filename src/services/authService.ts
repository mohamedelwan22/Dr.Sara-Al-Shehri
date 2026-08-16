import { requireSupabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

/**
 * عنوان استقبال نتيجة تأكيد البريد/استعادة كلمة المرور داخل التطبيق.
 * يُشتق من `window.location.origin` حتى يعمل تلقائيًا في أي بيئة
 * (محلية على localhost:5173 أو لاحقًا على Netlify) دون ربط القيم في الكود.
 */
export function getAuthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

/** هل الخطأ يعني أن الجلسة منتهية/غير صالحة ويجب إعادة تسجيل الدخول؟ */
export function isSessionExpiredError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  const code = (error as { code?: string }).code ?? '';
  const combined = `${message} ${code}`.toLowerCase();
  return (
    combined.includes('session_not_found') ||
    combined.includes('session from session_id claim') ||
    combined.includes('auth session missing') ||
    combined.includes('invalid refresh token') ||
    combined.includes('jwt expired') ||
    combined.includes('session expired')
  );
}

/** هل الخطأ يعني أن العملية تتطلب إعادة توثيق (تسجيل دخول حديث) لأسباب أمنية؟ */
export function isReauthRequiredError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message;
  const code = (error as { code?: string }).code ?? '';
  const combined = `${message} ${code}`.toLowerCase();
  return combined.includes('reauth') || combined.includes('recent login');
}

export const authService = {
  getSession() {
    return requireSupabase().auth.getSession();
  },

  onAuthStateChange(callback: (session: unknown) => void) {
    let client: ReturnType<typeof requireSupabase> | null = null;
    try {
      client = requireSupabase();
    } catch {
      // Supabase غير مُهيأ — لا اشتراك.
      return { unsubscribe: () => undefined };
    }
    const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
    return data.subscription;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(displayName: string, email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: getAuthCallbackUrl() },
    );
    if (error) throw error;
  },

  /** إتمام تدفق PKCE بعد تأكيد البريد: استبدال الكود من الرابط بجلسة فعّالة. */
  async exchangeCodeForSession(code: string) {
    const { data, error } = await requireSupabase().auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data;
  },

  /** إتمام تدفق token_hash (email OTP): التحقق من الرابط وإنشاء الجلسة. */
  async verifyOtp(params: { token_hash: string; type: 'email' | 'sms' | 'phone_change' | 'email_change' | 'signup' | 'recovery' | 'invite' | 'magiclink' }) {
    const { data, error } = await requireSupabase().auth.verifyOtp(params);
    if (error) throw error;
    return data;
  },

  /** إعادة التحقق من كلمة المرور الحالية قبل تغييرها (أفضل ممارسة عند غياب إعادة التوثيق). */
  async verifyPassword(email: string, password: string) {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  },

  /** تغيير البريد الإلكتروني عبر Supabase Auth (يُرسل تأكيدًا عند تفعيل تأكيد البريد). */
  async updateEmail(email: string) {
    const { data, error } = await requireSupabase().auth.updateUser({
      email: email.trim().toLowerCase(),
    });
    if (error) throw error;
    return data;
  },

  /** تغيير كلمة المرور عبر Supabase Auth — لا يُخزَّن أي شيء في قاعدة البيانات. */
  async updatePassword(password: string) {
    const { data, error } = await requireSupabase().auth.updateUser({ password });
    if (error) throw error;
    return data;
  },

  async updateProfile(profile: Partial<Pick<Profile, 'display_name' | 'locale'>>) {
    const { data: session } = await requireSupabase().auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) throw new Error('not-authenticated');
    const { data, error } = await requireSupabase()
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async getProfile(): Promise<Profile | null> {
    const { data: session } = await requireSupabase().auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return null;
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return (data as Profile) ?? null;
  },

  async getMyRole(): Promise<AppRoleResult> {
    const { data: session } = await requireSupabase().auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return { role: null, isAdmin: false };
    const { data, error } = await requireSupabase()
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    const role = ((data as UserRole | null)?.role ?? null) as AppRoleResult['role'];
    return { role, isAdmin: role === 'admin' };
  },
};

export interface AppRoleResult {
  role: 'admin' | 'user' | null;
  isAdmin: boolean;
}
