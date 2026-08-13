import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { invalidateForEntity } from '@/services/queryInvalidation';
import { ENTITY_CONFIGS, type FieldConfig } from '@/features/admin/adminConfig';
import { Button } from '@/components/ui';
import { Input, Textarea, Select, Checkbox } from '@/components/ui';
import { FieldWrapper } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui';
import { useToast } from '@/components/ui';
import { slugify } from '@/lib/utils';

type Row = Record<string, unknown>;

export function EntityFormPage() {
  const { entity = '', id } = useParams<{ entity: string; id: string }>();
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!editQuery.data || !config) return;
    let mounted = true;
    const row = editQuery.data;
    const values = buildValuesFromRow(config.fields, row);
    if (config.axisType) {
      void adminContentService
        .getAxisLinksForContent(config.axisType, String(row.id))
        .then((links) => {
          if (!mounted) return;
          reset({ ...values, axisIds: links });
        })
        .catch(() => {
          if (mounted) reset(values);
        });
    } else {
      reset(values);
    }
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuery.data, config]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Row) => {
      const { axisType } = config ?? {};
      const axisIds = (payload.axisIds as string[] | undefined) ?? [];
      const body = { ...payload };
      delete body.axisIds;
      for (const field of config?.fields ?? []) {
        if (field.kind === 'number' || field.kind === 'date') {
          body[field.key] = (body[field.key] as string | null | undefined) ?? null;
        }
      }
      const result = isEdit
        ? await adminContentService.update<Row>(entity, id as string, body)
        : await adminContentService.create<Row>(entity, body);
      if (axisType) {
        await adminContentService.replaceAxisLinks(axisType, String(result.id), axisIds);
      }
      return result;
    },
    onSuccess: () => {
      toast.success(t('common.saved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list(entity) });
      invalidateForEntity(queryClient, entity);
      navigate(`/admin/${entity}`);
    },
    onError: () => toast.error(t('errors.generic')),
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
    <div className="mx-auto max-w-3xl space-y-4">
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
        className="rounded-xl2 border border-primary-100 bg-white p-5"
        noValidate
      >
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {config.fields.map((field) => (
            <FormField
              key={field.key}
              field={field}
              register={register}
              setValue={setValue}
              axisIds={axisIds ?? []}
              axes={axesQuery.data ?? []}
              error={formState.errors[field.key]?.message as string | undefined}
              onSlug={() => {
                const ar = watch('title_ar') as string | undefined;
                if (ar) setValue('slug', slugify(ar));
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
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
    </div>
  );
}

function FormField({
  field,
  register,
  setValue,
  axisIds,
  axes,
  error,
  onSlug,
}: {
  field: FieldConfig;
  register: UseFormRegister<Row>;
  setValue: UseFormSetValue<Row>;
  axisIds: string[];
  axes: Row[];
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
    case 'axes':
      return (
        <FieldWrapper label={label} error={error} hint={hint} id={id}>
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            {axes.length ? (
              axes.map((axis) => {
                const value = String(axis.id);
                const checked = axisIds.includes(value);
                return (
                  <Checkbox
                    key={value}
                    id={`${id}-${value}`}
                    checked={checked}
                    label={String(axis.name_ar ?? axis.name_en ?? value)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...axisIds, value]
                        : axisIds.filter((a) => a !== value);
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
    else if (field.kind === 'boolean') defaults[field.key] = false;
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
    } else {
      values[field.key] = raw ?? '';
    }
  }
  return values;
}
