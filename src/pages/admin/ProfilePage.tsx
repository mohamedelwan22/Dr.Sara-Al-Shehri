import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRound } from 'lucide-react';
import { adminContentService } from '@/services';
import { invalidateProfileContent } from '@/services/queryInvalidation';
import { profileSectionSchema, PROFILE_SECTION_KEYS, type ProfileSectionValues } from '@/schemas/content';
import { Button } from '@/components/ui';
import { Input, Textarea, Select } from '@/components/ui';
import { FieldWrapper } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui';
import { useToast } from '@/components/ui';
import { ResearchInterestsEditor } from './ResearchInterestsEditor';
import type { ProfileContent } from '@/types';

const SECTIONS = PROFILE_SECTION_KEYS;
const STATUS_OPTIONS = [
  { value: 'published', labelKey: 'common.published' },
  { value: 'draft', labelKey: 'common.draft' },
];

export function ProfilePage() {
  const { t } = useTranslation();
  const toast = useToast();

  const sectionsQuery = useQuery({
    queryKey: ['admin', 'profile-sections'],
    queryFn: () => adminContentService.listProfileSections(),
  });

  const bySection = useMemo(() => {
    const map: Record<string, ProfileContent> = {};
    for (const row of sectionsQuery.data ?? []) {
      if (row.section) map[row.section] = row as ProfileContent;
    }
    return map;
  }, [sectionsQuery.data]);

  if (sectionsQuery.isPending) return <LoadingState />;
  if (sectionsQuery.isError) {
    return (
      <ErrorState message={t('errors.generic')} onRetry={() => void sectionsQuery.refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-xl font-bold text-primary-900">
          <UserRound className="h-5 w-5 text-primary-600" />
          {t('admin.profile')}
        </h1>
        <p className="mt-1 text-sm text-slateGray">{t('admin.profileHint')}</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <SectionEditor
            key={section}
            section={section}
            initial={bySection[section]}
            toast={toast}
          />
        ))}
      </div>

      <ResearchInterestsEditor />
    </div>
  );
}

function SectionEditor({
  section,
  initial,
  toast,
}: {
  section: (typeof PROFILE_SECTION_KEYS)[number];
  initial?: ProfileContent;
  toast: ReturnType<typeof useToast>;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<ProfileSectionValues>({
    resolver: zodResolver(profileSectionSchema),
    defaultValues: sectionValues(section, initial),
  });

  const { register, handleSubmit, reset, formState } = form;

  useEffect(() => {
    reset(sectionValues(section, initial));
  }, [section, initial, reset]);

  const handleSave = handleSubmit(async (values) => {
    try {
      await adminContentService.upsertProfileSection(section, {
        title_ar: values.title_ar || undefined,
        title_en: values.title_en || undefined,
        body_ar: values.body_ar,
        body_en: values.body_en || undefined,
        status: values.status,
      });
      invalidateProfileContent(queryClient);
      toast.success(t('common.saved'));
    } catch {
      toast.error(t('errors.generic'));
    }
  });

  return (
    <form
      onSubmit={(e) => void handleSave(e)}
      className="rounded-xl2 border border-primary-100 bg-white p-5"
      noValidate
    >
      <h2 className="mb-4 font-display text-lg font-bold text-primary-900">
        {t(`admin.sections.${section}`)}
      </h2>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldWrapper label={t('admin.fields.title_ar')} error={formState.errors.title_ar?.message} id={`${section}-title-ar`}>
          <Input
            id={`${section}-title-ar`}
            {...register('title_ar')}
            error={Boolean(formState.errors.title_ar)}
          />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fields.title_en')} error={formState.errors.title_en?.message} id={`${section}-title-en`}>
          <Input
            id={`${section}-title-en`}
            {...register('title_en')}
            error={Boolean(formState.errors.title_en)}
          />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fields.body_ar')} error={formState.errors.body_ar?.message} id={`${section}-body-ar`}>
          <Textarea
            id={`${section}-body-ar`}
            {...register('body_ar')}
            rows={6}
            error={Boolean(formState.errors.body_ar)}
          />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fields.body_en')} error={formState.errors.body_en?.message} id={`${section}-body-en`}>
          <Textarea
            id={`${section}-body-en`}
            {...register('body_en')}
            rows={6}
            error={Boolean(formState.errors.body_en)}
          />
        </FieldWrapper>
        <FieldWrapper label={t('common.status')}>
          <Select {...register('status')}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  );
}

function sectionValues(
  section: (typeof PROFILE_SECTION_KEYS)[number],
  initial?: ProfileContent,
): ProfileSectionValues {
  return {
    section,
    title_ar: initial?.title_ar ?? '',
    title_en: initial?.title_en ?? '',
    body_ar: initial?.body_ar ?? '',
    body_en: initial?.body_en ?? '',
    status: (initial?.status as ProfileSectionValues['status']) ?? 'published',
  };
}
