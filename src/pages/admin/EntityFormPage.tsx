import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, FileText, Loader2, Trash2, Upload, BookOpen, GraduationCap, ExternalLink, Unlink, Plus } from 'lucide-react';
import { adminContentService } from '@/services';
import { projectService } from '@/services/projectService';
import { queryKeys } from '@/services/queryKeys';
import { invalidateForEntity } from '@/services/queryInvalidation';
import { ENTITY_CONFIGS, type FieldConfig } from '@/features/admin/adminConfig';
import { Button, Input, Textarea, Select, Checkbox, FieldWrapper, LoadingState, ErrorState, useToast } from '@/components/ui';
import { slugify, pickLang } from '@/lib/utils';
import {
  contentFilePreviewUrl,
  fileDisplayName,
  isImageStoragePath,
  isPublicBucket,
  removeStoredFile,
  splitStoragePath,
  uploadContentFile,
  validateContentFile,
} from '@/lib/storageFiles';


type Row = Record<string, unknown>;

export function EntityFormPage() {
  const { entity = '', id } = useParams<{ entity: string; id: string }>();
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const config = ENTITY_CONFIGS[entity];
  const isEdit = Boolean(id);

  const form = useForm<Row>({
    resolver: config ? zodResolver(config.schema) : undefined,
    defaultValues: useMemo(() => (config ? buildDefaults(config.fields) : {}), [config]),
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const axisIds = watch('axisIds') as string[] | undefined;

  const editQuery = useQuery({
    queryKey: queryKeys.admin.item(entity, id ?? ''),
    queryFn: () => adminContentService.get<Row>(entity, id as string),
    enabled: isEdit && Boolean(config),
  });

  const axesQuery = useQuery({
    queryKey: queryKeys.admin.axes,
    queryFn: () => adminContentService.listAxesForAdmin(),
    enabled: Boolean(config?.axisType),
  });

  const projectsListQuery = useQuery({
    queryKey: ['admin', 'projects', 'select-list'],
    queryFn: () => projectService.listAllForAdmin(),
    enabled: entity === 'supervision' || entity === 'discussions',
  });

  // إذا كنا نعدل مشروع، فلنجلب الرسائل العلمية المرتبطة به
  const projectDetailsQuery = useQuery({
    queryKey: ['admin', 'project-details', editQuery.data?.slug as string],
    queryFn: () => projectService.getBySlug(editQuery.data?.slug as string),
    enabled: entity === 'projects' && isEdit && Boolean(editQuery.data?.slug),
  });

  useEffect(() => {
    if (!editQuery.data || !config) return;
    let mounted = true;
    const row = editQuery.data;
    const values = buildValuesFromRow(config.fields, row);

    const loadRelated = async () => {
      let linkedAxisIds: string[] = [];
      let linkedProjectId: string | null = null;

      if (config.axisType) {
        try {
          linkedAxisIds = await adminContentService.getAxisLinksForContent(config.axisType, String(row.id));
        } catch {
          /* ignore */
        }
      }

      if (entity === 'supervision' || entity === 'discussions') {
        try {
          linkedProjectId = await projectService.getLinkedProjectIdForThesis(
            entity === 'supervision' ? 'supervision' : 'discussion',
            String(row.id)
          );
        } catch {
          /* ignore */
        }
      }

      if (!mounted) return;
      reset({
        ...values,
        axisIds: linkedAxisIds,
        project_id: linkedProjectId ?? '',
      });
    };

    void loadRelated();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuery.data, config, entity]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Row) => {
      const { axisType } = config ?? {};
      const axisIds = (payload.axisIds as string[] | undefined) ?? [];
      const selectedProjectId = (payload.project_id as string | undefined) || null;

      // Meta fields (axisIds / project_id) are handled by dedicated link calls, not stored
      // as columns on the content table — never send them to the INSERT/UPDATE payload.
      const validKeys = new Set(
        (config?.fields ?? [])
          .map((f) => f.key)
          .filter((k) => !k.startsWith('_') && k !== 'axisIds' && k !== 'project_id')
          .concat(['id', 'created_at', 'updated_at', 'published_at']),
      );
      const body: Row = {};
      for (const key of Object.keys(payload)) {
        if (validKeys.has(key)) {
          body[key] = payload[key];
        }
      }

      for (const field of config?.fields ?? []) {
        if (field.kind === 'number' || field.kind === 'date' || field.kind === 'datetime') {
          body[field.key] = normalizeTimestamp(body[field.key]);
        }
      }

      const result = isEdit
        ? await adminContentService.update<Row>(entity, id as string, body)
        : await adminContentService.create<Row>(entity, body);

      const savedId = String(result.id);

      if (axisType) {
        await adminContentService.replaceAxisLinks(axisType, savedId, axisIds);
      }

      if (entity === 'supervision' || entity === 'discussions') {
        await projectService.linkThesisToProject(
          selectedProjectId,
          entity === 'supervision' ? 'supervision' : 'discussion',
          savedId
        );
      }

      return result;
    },
    onSuccess: () => {
      toast.success(t('common.saved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list(entity) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects({}) });
      invalidateForEntity(queryClient, entity);
      navigate(`/admin/${entity}`);
    },
    onError: (err: Error) => {
      console.error('[EntityFormPage] save error:', err);
      toast.error(t('errors.generic'));
    },
  });

  const detachMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: 'supervision' | 'discussion'; itemId: string }) => {
      await projectService.linkThesisToProject(null, itemType, itemId);
    },
    onSuccess: () => {
      toast.success(t('common.saved'));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'project-details', editQuery.data?.slug as string] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects({}) });
    },
    onError: (err: Error) => {
      console.error('[EntityFormPage] detach error:', err);
      toast.error(t('errors.generic'));
    },
  });

  if (!config) {
    return <p className="text-center text-sm text-slateGray">{t('notFound.title')}</p>;
  }

  if (isEdit && (editQuery.isPending || editQuery.isError)) {
    if (editQuery.isError) {
      return (
        <ErrorState
          message={t('errors.generic')}
          onRetry={() => void editQuery.refetch()}
        />
      );
    }
    return <LoadingState />;
  }

  const onSubmit = (values: Row) => saveMutation.mutate(values);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={`/admin/${entity}`}
            className="mb-1 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-900"
          >
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            {t('common.back')}
          </Link>
          <h1 className="font-display text-xl font-bold text-primary-900">
            {t(`admin.entities.${entity}`)} — {isEdit ? t('common.edit') : t('common.create')}
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-primary-100 bg-white p-5 sm:p-6 shadow-xs"
        noValidate
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          {config.fields.map((field) => {
            if (field.kind === 'section') {
              return (
                <div key={field.key} className="col-span-full mt-4 first:mt-0">
                  <h3 className="text-sm font-bold text-[#35145C] border-b border-[#E7DFED] pb-2 mb-1">
                    {t(field.labelKey)}
                  </h3>
                </div>
              );
            }
            return (
              <FormField
                key={field.key}
                field={field}
                register={register}
                setValue={setValue}
                value={watch(field.key)}
                axisIds={axisIds ?? []}
                axes={axesQuery.data ?? []}
                projects={projectsListQuery.data ?? []}
                error={formState.errors[field.key]?.message as string | undefined}
                onSlug={() => {
                  const ar = watch('title_ar') as string | undefined;
                  if (ar) setValue('slug', slugify(ar));
                }}
              />
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <Link to={`/admin/${entity}`}>
            <Button variant="outline" type="button">
              {t('common.cancel')}
            </Button>
          </Link>
          <Button type="submit" isLoading={saveMutation.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>

      {/* إذا كان الكيان هو مشروع، نعرض قائمة الرسائل المرتبطة به */}
      {entity === 'projects' && isEdit && (
        <div className="rounded-2xl border border-primary-100 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-base font-bold text-[#35145C] flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#D89A16]" />
              {t('projects.relatedTheses')}
            </h2>
            <span className="rounded-full bg-primary-50 px-3 py-0.5 text-xs font-bold text-primary-700">
              {projectDetailsQuery.data?.relatedItems.length ?? 0}
            </span>
          </div>

          {projectDetailsQuery.isLoading ? (
            <div className="py-4 text-center text-xs text-slate-400">{t('common.loading')}</div>
          ) : (
            <div className="space-y-2">
              {projectDetailsQuery.data?.relatedItems.map((item) => {
                const itemTitle = pickLang(item.title_ar, item.title_en, locale);
                const editPath = `/admin/${item.item_type === 'supervision' ? 'supervision' : 'discussions'}/${item.id}`;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="h-4 w-4 shrink-0 text-[#35145C]" />
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-bold text-slate-800">{itemTitle}</span>
                        <span className="block text-[10px] text-slate-400">
                          {item.item_type === 'supervision' ? t('admin.entities.supervision') : t('admin.entities.discussions')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        to={editPath}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-primary-700 hover:bg-primary-50 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        disabled={detachMutation.isPending}
                        onClick={() => detachMutation.mutate({ itemType: item.item_type as 'supervision' | 'discussion', itemId: item.id })}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title={t('admin.actions.delete')}
                      >
                        <Unlink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {!projectDetailsQuery.data?.relatedItems.length && (
                <p className="text-xs text-slate-500 py-2">{t('projects.noRelatedTheses')}</p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Link
              to={`/admin/supervision?project=${editQuery.data?.slug ?? ''}`}
              className="inline-flex items-center gap-1 rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('admin.entities.supervision')}
            </Link>
            <Link
              to={`/admin/discussions?project=${editQuery.data?.slug ?? ''}`}
              className="inline-flex items-center gap-1 rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('admin.entities.discussions')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  field,
  register,
  setValue,
  value,
  axisIds,
  axes,
  projects,
  error,
  onSlug,
}: {
  field: FieldConfig;
  register: UseFormRegister<Row>;
  setValue: UseFormSetValue<Row>;
  value?: unknown;
  axisIds: string[];
  axes: Row[];
  projects: Pick<Row, 'id' | 'title_ar' | 'title_en' | 'slug'>[];
  error?: string;
  onSlug: () => void;
}) {
  const { t } = useTranslation();
  const label = t(field.labelKey);
  const hint = field.hintKey ? t(field.hintKey) : undefined;
  const { key, kind, options } = field;
  const id = `field-${key}`;

  const common = { id, 'aria-invalid': Boolean(error) };

  switch (kind) {
    case 'textarea':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Textarea
            {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
            rows={field.rows ?? 4}
            error={Boolean(error)}
            {...common}
          />
        </FieldWrapper>
      );
    case 'select':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Select {...register(key)} error={Boolean(error)} {...common}>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      );
    case 'project_select':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Select {...register(key)} error={Boolean(error)} {...common}>
            <option value="">{t('projects.noProjectLinked')}</option>
            {projects.map((proj) => (
              <option key={String(proj.id)} value={String(proj.id)}>
                {String(proj.title_ar ?? proj.title_en ?? proj.slug)}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      );
    case 'axes':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            {axes.length ? (
              axes.map((axis) => {
                const val = String(axis.id);
                const checked = axisIds.includes(val);
                return (
                  <Checkbox
                    key={val}
                    id={`${id}-${val}`}
                    checked={checked}
                    label={String(axis.name_ar ?? axis.name_en ?? val)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...axisIds, val]
                        : axisIds.filter((a) => a !== val);
                      setValue('axisIds', next);
                    }}
                  />
                );
              })
            ) : (
              <p className="text-sm text-slateGray">{t('admin.noAxes')}</p>
            )}
          </div>
        </FieldWrapper>
      );
    case 'boolean':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Checkbox
            {...register(key)}
            label={label}
            {...common}
          />
        </FieldWrapper>
      );
    case 'number':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Input
            type="number"
            inputMode="numeric"
            {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
            error={Boolean(error)}
            {...common}
          />
        </FieldWrapper>
      );
    case 'date':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Input
            type="date"
            {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
            error={Boolean(error)}
            {...common}
          />
        </FieldWrapper>
      );
    case 'datetime':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Input
            type="datetime-local"
            {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
            error={Boolean(error)}
            {...common}
          />
        </FieldWrapper>
      );
    case 'url':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Input
            dir="ltr"
            inputMode="url"
            placeholder="https://"
            {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
            error={Boolean(error)}
            {...common}
          />
        </FieldWrapper>
      );
    case 'file':
      return (
        <FileField
          field={field}
          value={typeof value === 'string' ? value : ''}
          onChange={(path) => setValue(field.key, path)}
          error={error}
        />
      );
    case 'slug':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <div className="flex gap-2">
            <Input
              dir="ltr"
              {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
              error={Boolean(error)}
              {...common}
            />
            <Button variant="outline" size="sm" type="button" onClick={onSlug} className="shrink-0">
              {t('common.auto')}
            </Button>
          </div>
        </FieldWrapper>
      );
    default:
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <Input
            {...register(key, { setValueAs: (v) => (v === '' ? undefined : v) })}
            error={Boolean(error)}
            {...common}
          />
        </FieldWrapper>
      );
  }
}

function buildDefaults(fields: FieldConfig[]): Row {
  const defaults: Row = {};
  for (const field of fields) {
    if (field.kind === 'axes') defaults[field.key] = [];
    else if (field.kind === 'select') defaults[field.key] = field.options?.[0]?.value ?? '';
    else if (field.kind === 'boolean') defaults[field.key] = true;
    else defaults[field.key] = '';
  }
  return defaults;
}

function buildValuesFromRow(fields: FieldConfig[], row: Row): Row {
  const values: Row = {};
  for (const field of fields) {
    const raw = row[field.key];
    if (field.kind === 'axes') {
      values[field.key] = Array.isArray(raw) ? raw : [];
    } else if (field.kind === 'number') {
      values[field.key] = raw == null ? '' : String(raw);
    } else if (field.kind === 'boolean') {
      values[field.key] = Boolean(raw);
    } else if (field.kind === 'datetime') {
      values[field.key] = typeof raw === 'string' && raw ? raw.slice(0, 16) : '';
    } else {
      values[field.key] = raw ?? '';
    }
  }
  return values;
}

function normalizeTimestamp(value: unknown): string | number | null {
  if (value === '' || value == null) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  const raw = String(value);
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw;
}

function FileField({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldConfig;
  value: string;
  onChange: (path: string) => void;
  error?: string;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const bucket = field.bucket ?? 'public-media';
  const id = `field-${field.key}`;
  const label = t(field.labelKey);
  const hint = field.hintKey ? t(field.hintKey) : undefined;
  const storagePath = value;
  const { bucket: valueBucket } = storagePath ? splitStoragePath(storagePath) : { bucket: '' };
  const showPreview = storagePath && isImageStoragePath(storagePath) && isPublicBucket(valueBucket || bucket);
  const previewUrl = storagePath && showPreview ? contentFilePreviewUrl(storagePath) : '';

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    const validationKey = validateContentFile(file, field.accept);
    if (validationKey) {
      toast.error(t(validationKey));
      return;
    }
    setUploading(true);
    try {
      const result = await uploadContentFile(file, bucket);
      if (storagePath) void removeStoredFile(storagePath);
      onChange(result.storagePath);
      toast.success(t('admin.uploadSuccess'));
    } catch {
      toast.error(t('admin.uploadFailed'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (storagePath) void removeStoredFile(storagePath);
    onChange('');
    toast.success(t('admin.fileRemoved'));
  };

  return (
    <FieldWrapper label={label} error={error} hint={hint} id={id}>
      {storagePath ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-14 w-14 rounded object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded bg-white text-primary-600">
              <FileText className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-primary-900" dir="ltr" title={storagePath}>
              {fileDisplayName(storagePath)}
            </p>
            <p className="text-xs text-slateGray" dir="ltr">
              {storagePath}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={handleRemove}
          >
            {t('admin.removeFile')}
          </Button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex min-h-20 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slateGray transition-colors hover:border-primary-400 hover:text-primary-700"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('admin.upload')}…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {t('admin.upload')}
            </>
          )}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={field.accept}
        disabled={uploading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </FieldWrapper>
  );
}
