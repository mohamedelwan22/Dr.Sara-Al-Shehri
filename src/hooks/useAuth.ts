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
      try {
        const {
          data: { session },
        } = await authService.getSession();
        return session;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const userId = sessionQuery.data?.user?.id ?? null;

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authService.getProfile(),
    enabled: Boolean(userId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const roleQuery = useQuery({
    queryKey: queryKeys.role,
    queryFn: () => authService.getMyRole(),
    enabled: Boolean(userId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const sub = authService.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ['session'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.role });
    });
    return () => sub.unsubscribe();
  }, [queryClient]);

  const isSessionLoading = sessionQuery.isPending;
  const isDetailsLoading = Boolean(userId) && (profileQuery.isPending || roleQuery.isPending);

  return {
    user: sessionQuery.data?.user
      ? {
          id: sessionQuery.data.user.id,
          email: sessionQuery.data.user.email,
        }
      : null,
    profile: profileQuery.data ?? null,
    isAdmin: Boolean(roleQuery.data?.isAdmin),
    isLoading: isSessionLoading || isDetailsLoading,
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
