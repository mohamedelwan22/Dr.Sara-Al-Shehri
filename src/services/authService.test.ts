import { describe, expect, it } from 'vitest';
import { isReauthRequiredError, isSessionExpiredError } from './authService';

function err(message: string, code?: string) {
  const e = new Error(message);
  if (code) (e as Error & { code?: string }).code = code;
  return e;
}

describe('isSessionExpiredError', () => {
  it('يكشف خطأ انتهاء الجلسة من GoTrue (403 session_not_found)', () => {
    expect(
      isSessionExpiredError(err('Session from session_id claim in JWT does not exist')),
    ).toBe(true);
    expect(isSessionExpiredError(err('Invalid Refresh Token: Session Not Found'))).toBe(true);
  });

  it('يكشف رسائل supabase-js للجلسة المفقودة أو المنتهية', () => {
    expect(isSessionExpiredError(err('Auth session missing!'))).toBe(true);
    expect(isSessionExpiredError(err('invalid refresh token: Invalid Refresh Token'))).toBe(true);
    expect(isSessionExpiredError(err('JWT expired'))).toBe(true);
    expect(isSessionExpiredError(err('session expired'))).toBe(true);
  });

  it('لا يخطئ في أخطاء البيانات أو المصادقة العادية', () => {
    expect(isSessionExpiredError(err('Invalid login credentials'))).toBe(false);
    expect(isSessionExpiredError(err('Email not confirmed'))).toBe(false);
    expect(isSessionExpiredError(err('new_adresses should not contain the following signs'))).toBe(
      false,
    );
    expect(isSessionExpiredError(null)).toBe(false);
    expect(isSessionExpiredError('some string')).toBe(false);
  });
});

describe('isReauthRequiredError', () => {
  it('يكشف خطأ إعادة التوثيق المطلوبة', () => {
    expect(isReauthRequiredError(err('Auth reauth required'))).toBe(true);
    expect(isReauthRequiredError(err('Reauthentication required'))).toBe(true);
    expect(isReauthRequiredError(err('A reauthentication is required, use a recent login'))).toBe(
      true,
    );
  });

  it('لا يخطئ في أخطاء أخرى', () => {
    expect(isReauthRequiredError(err('Session from session_id claim in JWT does not exist'))).toBe(
      false,
    );
    expect(isReauthRequiredError(err('Invalid login credentials'))).toBe(false);
  });
});
