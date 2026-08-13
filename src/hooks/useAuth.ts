import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '@/i18n';
import { authService } from '@/services/authService';
import { queryKeys } from '@/services/queryKeys';
import type { Profile } from '@/types';
export interface AuthState {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const {
        data: { session },
      } = await authService.getSession();
      return session;
    },
    staleTime: Infinity,
  });

  const userId = sessionQuery.data?.user?.id ?? null;

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authService.getProfile(),
    enabled: Boolean(userId),
  });

  const roleQuery = useQuery({
    queryKey: queryKeys.role,
    queryFn: () => authService.getMyRole(),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    const sub = authService.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.role });
    });
    return () => sub.unsubscribe();
  }, [queryClient]);

  return {
    user: sessionQuery.data?.user
      ? {
          id: sessionQuery.data.user.id,
          email: sessionQuery.data.user.email,
        }
      : null,
    profile: profileQuery.data ?? null,
    isAdmin: Boolean(roleQuery.data?.isAdmin),
    isLoading:
      sessionQuery.isLoading || (Boolean(userId) && (profileQuery.isLoading || roleQuery.isLoading)),
    isAuthenticated: Boolean(userId),
  };
}

/** تغيير اللغة + حفظها في ملف المستخدم إن كان مسجلًا. */
export function useLocale() {
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const setLocale = useCallback(
    async (next: 'ar' | 'en') => {
      await i18n.changeLanguage(next);
      const { data } = await authService.getSession();
      if (data.session?.user) {
        void authService.updateProfile({ locale: next }).catch(() => undefined);
      }
    },
    [],
  );
  return { locale, setLocale };
}

export function useRequireAuth(): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    void navigate(
      `/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`,
    );
  }, [navigate]);
}
