import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

export interface SocialPlatform {
  id: string;
  labelKey: string;
  icon: LucideIcon;
}

export type SocialLinks = Partial<Record<string, string>>;

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'facebook', labelKey: 'social.facebook', icon: Facebook },
  { id: 'instagram', labelKey: 'social.instagram', icon: Instagram },
  { id: 'youtube', labelKey: 'social.youtube', icon: Youtube },
  { id: 'linkedin', labelKey: 'social.linkedin', icon: Linkedin },
  { id: 'twitter', labelKey: 'social.twitter', icon: Twitter },
  { id: 'tiktok', labelKey: 'social.tiktok', icon: Music2 },
  { id: 'whatsapp', labelKey: 'social.whatsapp', icon: MessageCircle },
  { id: 'telegram', labelKey: 'social.telegram', icon: Send },
];

export function isValidSocialUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeSocialLinks(raw: Record<string, unknown>): SocialLinks {
  const result: SocialLinks = {};
  for (const platform of SOCIAL_PLATFORMS) {
    const value = raw[platform.id];
    if (typeof value === 'string' && value.trim()) {
      result[platform.id] = value.trim();
    }
  }
  return result;
}
