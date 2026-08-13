import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogoMark } from './Logo';
import { cn } from '@/lib/utils';

const INTRO_KEY = 'platform-logo-intro-shown';

/**
 * مقدمة اللوجو: محراب ← "سارة" ← فتح الكتاب ← الاسم ← العبارة خلال ~2 ثانية.
 * تُعرض مرة واحدة لكل جلسة متصفح فقط (sessionStorage)، وتحترم prefers-reduced-motion.
 */
export function LogoIntro() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return false;
    return !sessionStorage.getItem(INTRO_KEY);
  });
  const [step, setStep] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    const timings = [0, 250, 700, 1200, 1650, 2050];
    timings.forEach((time, index) => {
      timerRef.current = window.setTimeout(() => setStep(index), time);
    });
    const hide = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(INTRO_KEY, '1');
    }, 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(hide);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-ivory to-white"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-5">
        <div className={cn('transition-all duration-500', step >= 1 ? 'scale-100 opacity-100' : 'scale-90 opacity-60')}>
          <LogoMark className="h-24 w-24 shadow-elevated sm:h-28 sm:w-28" />
        </div>

        <p
          className={cn(
            'font-display text-4xl font-bold text-primary-900 transition-all duration-500 sm:text-5xl',
            step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
          style={{ fontFamily: 'Amiri, serif' }}
        >
          سارة
        </p>

        <div
          className={cn(
            'transition-all duration-500',
            step >= 3 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
          )}
          style={{ transformOrigin: 'top' }}
        >
          <svg viewBox="0 0 120 32" className="h-8 w-28" aria-hidden="true">
            <path d="M8 28c10-14 94-14 104 0H8Z" fill="#C8962A" />
          </svg>
        </div>

        <div className={cn('text-center transition-all duration-500', step >= 4 ? 'opacity-100' : 'opacity-0')}>
          <p className="font-display text-xl font-bold text-primary-800">أ.د. سارة بنت عزيز الشهري</p>
          <p className="mt-1 text-sm font-medium text-gold-700">{t('hero.subtitle')}</p>
        </div>
      </div>
    </div>
  );
}
