import { cn } from '@/lib/utils';

/**
 * شعار المنصة وفق مصدر العميل:
 * محراب + اسم "سارة" بخط انسيابي + كتاب مفتوح أسفل — أفقيًا (المحراب والاسم والكتاب إلى جانب).
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/images/logo.png"
        alt=""
        className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
      />
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
    <img
      src="/images/logo.png"
      alt=""
      className={cn('h-16 w-16 object-contain', className)}
    />
  );
}
