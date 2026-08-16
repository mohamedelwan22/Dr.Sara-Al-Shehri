import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { LoadingState, useToast } from '@/components/ui';

const OTP_TYPES = [
  'sms',
  'phone_change',
  'email_change',
  'email',
  'signup',
  'recovery',
  'invite',
  'magiclink',
] as const;

type OtpType = (typeof OTP_TYPES)[number];

const RECOVERY_TYPES = new Set<string>(['recovery', 'email_change', 'email_change_current']);

function sanitizeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  if (raw === '/auth/callback') return null;
  return raw;
}

function normalizeOtpType(raw: string | null): OtpType {
  return OTP_TYPES.includes(raw as OtpType) ? (raw as OtpType) : 'signup';
}

/**
 * وجهة استقبال نتيجة تأكيد البريد / استعادة كلمة المرور من Supabase Auth.
 * يعالج جميع صيغ الروابط:
 *  - `?code=`  → تدفق PKCE → exchangeCodeForSession(code)
 *  - `?token_hash=&type=` → تدفق email OTP → verifyOtp
 *  - `#access_token=` → تدفق implicit (عالجه الـSDK تلقائيًا) → نتحقق من الجلسة
 * ثم ينشئ/يستعيد الجلسة ويعيد التوجيه إلى المكان المناسب.
 */
export function AuthCallbackPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = sanitizeNext(searchParams.get('next'));

    const invalidateAuth = () => {
      void queryClient.invalidateQueries({ queryKey: ['session'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.role });
    };

    const succeed = () => {
      invalidateAuth();
      toast.success(t('auth.emailConfirmed'));
      navigate(next ?? (type && RECOVERY_TYPES.has(type) ? '/account' : '/'), { replace: true });
    };

    const fail = () => {
      toast.error(t('auth.emailConfirmError'));
      navigate('/', { replace: true });
    };

    const run = async () => {
      try {
        if (code) {
          await authService.exchangeCodeForSession(code);
          succeed();
          return;
        }
        if (tokenHash) {
          await authService.verifyOtp({ token_hash: tokenHash, type: normalizeOtpType(type) });
          succeed();
          return;
        }
        // تدفق implicit: الجلسة تُحفظ تلقائيًا عند تهيئة الـSDK، نتحقق منها فقط.
        const {
          data: { session },
        } = await authService.getSession();
        if (session?.user) {
          succeed();
          return;
        }
        fail();
      } catch {
        fail();
      }
    };

    void run();
  }, [searchParams, t, toast, navigate, queryClient]);

  return <LoadingState />;
}
