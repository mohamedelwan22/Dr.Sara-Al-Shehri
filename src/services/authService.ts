import { requireSupabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

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
    );
    if (error) throw error;
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
