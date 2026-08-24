import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Download } from 'lucide-react';
import { adminContentService } from '@/services';
import { CONTACT_STATUS_LABEL_KEYS } from '@/features/admin/adminConfig';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Dialog } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { LoadingState } from '@/components/ui';
import { useToast } from '@/components/ui';
import { formatDate, formatBytes } from '@/lib/utils';
import { requireSupabase } from '@/lib/supabase';
import type { ContactSubmission } from '@/types';

const CONTACT_BUCKET = 'contact-attachments';

const STATUS_KEYS = ['new', 'in_review', 'responded', 'closed'] as const;
const STATUS_TONES: Record<string, 'primary' | 'gold' | 'green' | 'gray'> = {
  new: 'primary',
  in_review: 'gold',
  responded: 'green',
  closed: 'gray',
};

export function InboxPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [notes, setNotes] = useState('');

  const listQuery = useQuery({
    queryKey: queryKeys.admin.submissions({ status: status || null, page }),
    queryFn: () => adminContentService.listSubmissions({ status: status || null, page }),
  });

  // Contact attachments live in a PRIVATE bucket. Generate an admin-authenticated
  // signed URL on demand (never a public URL, which would 404 / leak the object).
  const openAttachment = async (storagePath: string) => {
    const { data, error } = await requireSupabase()
      .storage.from(CONTACT_BUCKET)
      .createSignedUrl(storagePath, 60 * 60);
    if (error || !data?.signedUrl) {
      toast.error(t('errors.downloadFailed'));
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const attachmentsQuery = useQuery({
    queryKey: ['admin', 'submission', 'attachments', selected?.id ?? ''],
    queryFn: () => adminContentService.getSubmissionAttachments(selected!.id),
    enabled: Boolean(selected),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: ContactSubmission['status'] }) =>
      adminContentService.updateSubmissionStatus(id, next),
    onSuccess: () => {
      toast.success(t('admin.updated'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.submissions() });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const notesMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error('no-submission');
      return adminContentService.updateSubmissionNotes(selected.id, notes);
    },
    onSuccess: () => {
      toast.success(t('admin.notesSaved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.submissions() });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const typeLabel = useMemo(
    () => (value: string) => t(`contact.types.${value}`, value),
    [t],
  );

  const openDetail = (row: ContactSubmission) => {
    setSelected(row);
    setNotes(row.internal_notes ?? '');
  };

  if (listQuery.isPending) return <LoadingState />;

  const rows = listQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold text-primary-900">{t('admin.contacts')}</h1>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setStatus('');
            setPage(1);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
            status === '' ? 'bg-primary-600 text-white' : 'bg-white text-primary-800 hover:bg-primary-50'
          }`}
        >
          {t('common.all')}
        </button>
        {STATUS_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              status === key ? 'bg-primary-600 text-white' : 'bg-white text-primary-800 hover:bg-primary-50'
            }`}
          >
            {t(CONTACT_STATUS_LABEL_KEYS[key])}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t('admin.noData')} />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => openDetail(row)}
              className="flex w-full items-center justify-between gap-3 rounded-xl2 border border-primary-100 bg-white px-4 py-3 text-start transition-colors hover:border-primary-200 hover:bg-primary-50/40"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-primary-900">
                  {row.name || row.email || '—'}
                  {row.type && <span className="ms-2 text-xs font-normal text-slateGray">{typeLabel(row.type)}</span>}
                </p>
                <p className="truncate text-sm text-slateGray">{row.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-slateGray" dir="ltr">
                  {formatDate(row.created_at)}
                </span>
                <Badge tone={STATUS_TONES[row.status] ?? 'gray'}>{t(CONTACT_STATUS_LABEL_KEYS[row.status])}</Badge>
                <Eye className="h-4 w-4 text-primary-600" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination page={listQuery.data?.page ?? 1} totalPages={listQuery.data?.totalPages ?? 1} onChange={setPage} />

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('admin.submissionDetail')}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selected.name && (
                <Field label={t('common.name')} value={selected.name} />
              )}
              {selected.email && <Field label={t('common.email')} value={selected.email} dir="ltr" />}
              {selected.phone && <Field label={t('common.phone')} value={selected.phone} dir="ltr" />}
              <Field label={t('contact.type')} value={typeLabel(selected.type)} />
              <Field label={t('common.createdAt')} value={formatDate(selected.created_at)} dir="ltr" />
            </dl>

            <div>
              <p className="label-field">{t('contact.message')}</p>
              <p className="rounded-lg border border-slate-200 bg-ivory p-3 text-sm leading-relaxed text-primary-900">
                {selected.message}
              </p>
            </div>

            {selected.payload && Object.keys(selected.payload).length > 0 && (
              <div>
                <p className="label-field">{t('admin.payload')}</p>
                <PayloadDetails payload={selected.payload} type={selected.type} />
              </div>
            )}

            {attachmentsQuery.data?.length ? (
              <div>
                <p className="label-field">{t('admin.attachments')}</p>
                <ul className="space-y-2">
                  {attachmentsQuery.data.map((file) => (
                    <li key={file.id}>
                      <button
                        type="button"
                        onClick={() => void openAttachment(file.storage_path)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-primary-100 px-3 py-2 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        <span dir="ltr" className="truncate">{file.storage_path.split('/').pop()}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-slateGray" dir="ltr">{formatBytes(file.size_bytes)}</span>
                          <Download className="h-4 w-4" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <p className="label-field">{t('common.status')}</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      statusMutation.mutate({ id: selected.id, next: key })
                    }
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                      selected.status === key
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-primary-800 hover:bg-primary-50'
                    }`}
                  >
            {t(CONTACT_STATUS_LABEL_KEYS[key])}
          </button>
        ))}
      </div>
      </div>

            <div>
              <p className="label-field">{t('admin.internalNotes')}</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-24 resize-y"
                dir="auto"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  isLoading={notesMutation.isPending}
                  onClick={() => notesMutation.mutate()}
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Field({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div>
      <p className="label-field">{label}</p>
      <p className="text-sm text-primary-900" dir={dir}>
        {value}
      </p>
    </div>
  );
}

/** Human-readable payload renderer — translates JSON keys to Arabic labels. */
const PAYLOAD_LABELS: Record<string, string> = {
  subject:             'موضوع الرسالة',
  role:                'الصفة',
  organization:        'الجهة / الجامعة',
  degree:              'الدرجة العلمية',
  university:          'الجامعة',
  proposedTitle:       'عنوان الرسالة المقترح',
  hasResearchPlan:     'هل توجد خطة بحث؟',
  thesisTitle:         'عنوان الرسالة',
  proposedDate:        'تاريخ المناقشة المقترح',
  discussionLocation:  'مكان المناقشة',
  activityTitle:       'عنوان النشاط',
  activityType:        'نوع النشاط',
  date:                'التاريخ',
  attendance:          'نمط الحضور',
  hours:               'عدد الساعات',
  conferenceName:      'اسم المؤتمر',
  organizer:           'الجهة المنظمة',
  conferenceLocation:  'مكان المؤتمر',
  participationType:   'نوع المشاركة',
  projectName:         'اسم المشروع',
  projectDescription:  'وصف المشروع',
  collaborationType:   'نوع التعاون',
};

const VALUE_LABELS: Record<string, string> = {
  student: 'طالب',
  researcher: 'باحث',
  faculty: 'عضو هيئة تدريس',
  academic: 'أكاديمي',
  other: 'أخرى',
  masters: 'ماجستير',
  phd: 'دكتوراه',
  yes: 'نعم',
  no: 'لا',
  inPerson: 'حضوري',
  remote: 'عن بُعد',
  hybrid: 'هجين',
  course: 'دورة',
  lecture: 'محاضرة',
  workshop: 'ورشة عمل',
  meeting: 'لقاء علمي',
  speaker: 'متحدث رئيس',
  committee: 'عضو لجنة',
  session: 'إدارة جلسة',
};

function PayloadDetails({
  payload,
}: {
  payload: Record<string, unknown>;
  type: string;
}) {
  const entries = Object.entries(payload).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return null;

  return (
    <dl className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-ivory p-3 sm:grid-cols-2">
      {entries.map(([key, val]) => {
        const label = PAYLOAD_LABELS[key] ?? key;
        const rawVal = String(val);
        const displayVal = VALUE_LABELS[rawVal] ?? rawVal;
        return (
          <div key={key}>
            <dt className="text-xs font-bold text-slateGray">{label}</dt>
            <dd className="mt-0.5 text-sm text-primary-900">{displayVal}</dd>
          </div>
        );
      })}
    </dl>
  );
}

