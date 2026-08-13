import { ProfileSectionPage } from '@/features/profile/ProfileSectionPage';

export function BiographyPage() {
  return (
    <ProfileSectionPage
      section="biography"
      titleKey="nav.biography"
      subtitleKey="biography.subtitle"
    />
  );
}
