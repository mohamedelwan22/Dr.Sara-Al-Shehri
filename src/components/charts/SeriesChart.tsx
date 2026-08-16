import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface SeriesDatum {
  date: string;
  views: number;
  downloads: number;
}

const W = 560;
const H = 210;
const PAD_L = 44;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

function niceMax(value: number): number {
  if (value <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const unit = value / pow;
  const nice = unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  return nice * pow;
}

function shortDate(iso: string, locale: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

/** مخطط أعمدة (مشاهدات) + خط (تنزيلات) بدون أي مكتبة خارجية. */
export function SeriesChart({
  data,
  className,
}: {
  data: SeriesDatum[];
  className?: string;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';

  const { max, innerH, barW, yFor, xFor, ticks } = useMemo(() => {
    const max = niceMax(Math.max(1, ...data.map((d) => Math.max(d.views, d.downloads))));
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;
    const step = data.length > 1 ? innerW / (data.length - 1) : innerW;
    const barW = Math.max(2, Math.min(12, step * 0.35));
    const yFor = (v: number) => PAD_T + innerH - (innerH * v) / max;
    const xFor = (i: number) => PAD_L + step * i;
    const ticks = 4;
    return { max, innerH, barW, yFor, xFor, ticks };
  }, [data]);

  if (!data.length) {
    return <p className="py-10 text-center text-sm text-slateGray">—</p>;
  }

  const labelCount = Math.min(data.length, 6);
  const labelIdx = Array.from({ length: labelCount }, (_, i) =>
    Math.round(((data.length - 1) * i) / (labelCount - 1)),
  );

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.downloads)}`).join(' ');

  return (
    <div className={cn('w-full', className)} dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="views and downloads over time"
      >
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const value = (max / ticks) * i;
          const y = yFor(value);
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#94a3b8">
                {value}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => (
          <rect
            key={d.date}
            x={xFor(i) - barW / 2}
            y={yFor(d.views)}
            width={barW}
            height={Math.max(0, PAD_T + innerH - yFor(d.views))}
            rx={2}
            fill="#7c3aed"
            opacity={0.85}
          >
            <title>{`${shortDate(d.date, locale)} — ${d.views}`}</title>
          </rect>
        ))}

        <polyline points={linePoints} fill="none" stroke="#d4a017" strokeWidth={2} strokeLinejoin="round" />

        {labelIdx.map((i) => (
          <text
            key={i}
            x={xFor(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={9}
            fill="#64748b"
          >
            {shortDate(data[i].date, locale)}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** شريط أفقي مكدّس لتوزيع الحالات (منشور/مسودة/مجدول/مؤرشف). */
export function StatusBar({
  segments,
}: {
  segments: { key: string; value: number; className: string; label: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <div className="space-y-3">
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100" dir="ltr">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              className={cn('h-full', s.className)}
              style={{ width: total > 0 ? `${(s.value / total) * 100}%` : '0%' }}
              title={s.label}
            />
          ) : null,
        )}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slateGray-dark">
              <span className={cn('h-2.5 w-2.5 rounded-full', s.className)} />
              {s.label}
            </span>
            <b className="text-primary-900" dir="ltr">
              {s.value}
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}
