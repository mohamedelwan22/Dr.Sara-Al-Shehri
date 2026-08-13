import { cn } from '@/lib/utils';

/**
 * شعار المنصة وفق مصدر العميل:
 * محراب + اسم "سارة" بخط انسيابي + كتاب مفتوح أسفل — أفقيًا (المحراب والاسم والكتاب إلى جانب).
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7B4FC4" />
            <stop offset="1" stopColor="#4A2C7D" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logo-g)" />
        <path
          d="M14 46V26a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v20H14Z"
          fill="#FAF7F2"
        />
        {/* المحراب */}
        <path d="M24 16c0-4 3-6 8-6s8 2 8 6c0 8-8 12-8 18 0-6-8-10-8-18Z" fill="#C8962A" opacity="0.9" />
        {/* الكتاب */}
        <path d="M17 47c5-6 25-6 30 0H17Z" fill="#C8962A" />
        <path d="M20 43.5 25.5 47 32 43 38.5 47 44 43.5 32 51 20 43.5Z" fill="#FAF7F2" />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <p className="font-display text-xl font-bold text-primary-900 sm:text-2xl">سارة</p>
          <p className="text-[0.65rem] font-bold tracking-wide text-gold-700 sm:text-xs">
            أ.د. سارة بنت عزيز الشهري
          </p>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-16 w-16', className)} aria-hidden="true">
      <defs>
        <linearGradient id="logomark-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7B4FC4" />
          <stop offset="1" stopColor="#4A2C7D" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logomark-g)" />
      <path
        d="M14 46V26a10 10 0 0 1 10-10h16a10 10 0 0 1 10 10v20H14Z"
        fill="#FAF7F2"
      />
      <path d="M24 16c0-4 3-6 8-6s8 2 8 6c0 8-8 12-8 18 0-6-8-10-8-18Z" fill="#C8962A" opacity="0.9" />
      <path d="M17 47c5-6 25-6 30 0H17Z" fill="#C8962A" />
      <path d="M20 43.5 25.5 47 32 43 38.5 47 44 43.5 32 51 20 43.5Z" fill="#FAF7F2" />
    </svg>
  );
}
