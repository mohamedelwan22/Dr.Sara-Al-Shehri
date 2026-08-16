import { useTranslation } from 'react-i18next';
import { SOCIAL_PLATFORMS, type SocialLinks } from '@/lib/socialLinks';
import { cn } from '@/lib/utils';

const PLATFORM_STYLES: Record<string, string> = {
  facebook: 'bg-[#1877F2] hover:bg-[#0f65c9]',
  instagram: 'bg-[#E4405F] hover:bg-[#c92f4c]',
  youtube: 'bg-[#FF0000] hover:bg-[#cc0000]',
  linkedin: 'bg-[#0077B5] hover:bg-[#005e8f]',
  twitter: 'bg-[#14171A] hover:bg-[#000000]',
  tiktok: 'bg-[#010101] hover:bg-[#2b2b2b]',
  whatsapp: 'bg-[#25D366] hover:bg-[#1da851]',
  telegram: 'bg-[#26A5E4] hover:bg-[#1b8abf]',
};

export function SocialIcons({
  links,
  className,
  itemClassName,
}: {
  links: SocialLinks;
  className?: string;
  itemClassName?: string;
}) {
  const { t } = useTranslation();

  const items = SOCIAL_PLATFORMS.filter((platform) => {
    const url = links[platform.id];
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  });

  if (items.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {items.map((platform) => (
        <a
          key={platform.id}
          href={links[platform.id]}
          target="_blank"
          rel="noreferrer"
          aria-label={t(platform.labelKey)}
          title={t(platform.labelKey)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors',
            PLATFORM_STYLES[platform.id] ?? 'bg-primary-900 hover:bg-primary-800',
            itemClassName,
          )}
        >
          <platform.icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}
