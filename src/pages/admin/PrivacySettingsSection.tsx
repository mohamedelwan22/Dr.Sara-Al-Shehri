import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, Save, Plus, Edit2, Trash2, Upload, Image as ImageIcon,
} from 'lucide-react';
import { privacyService, queryKeys, DEFAULT_PRIVACY_INFO } from '@/services';
import { uploadContentFile, contentFilePreviewUrl, validateContentFile, PUBLIC_MEDIA_BUCKET } from '@/lib/storageFiles';
import {
  Button, Checkbox, FieldWrapper, Input, Textarea, Select, useToast, LoadingState,
} from '@/components/ui';
import type { PrivacySection, PrivacyInfo } from '@/types';

const AVAILABLE_ICONS = [
  'ClipboardList',
  'Target',
  'ShieldCheck',
  'Users',
  'FileEdit',
  'Lock',
  'Eye',
  'FileText',
  'Share2',
  'HelpCircle',
  'Info',
];

export function PrivacySettingsSection() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [editingSection, setEditingSection] = useState<Partial<PrivacySection> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);

  // ── Queries ──
  const infoQuery = useQuery({
    queryKey: queryKeys.privacyInfo,
    queryFn: () => privacyService.getPrivacyInfo(),
  });

  const sectionsQuery = useQuery({
    queryKey: queryKeys.admin.list('privacy_sections'),
    queryFn: () => privacyService.getAllPrivacySectionsAdmin(),
  });

  // Local state for info form
  const [infoValues, setInfoValues] = useState<PrivacyInfo | null>(null);

  const currentInfo: Required<PrivacyInfo> = {
    ...DEFAULT_PRIVACY_INFO,
    ...(infoQuery.data ?? {}),
    ...(infoValues ?? {}),
  };

  // ── Mutations ──
  const saveInfoMutation = useMutation({
    mutationFn: (data: PrivacyInfo) => privacyService.upsertPrivacyInfo(data),
    onSuccess: () => {
      toast.success(t('common.saved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.privacyInfo });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const saveSectionMutation = useMutation({
    mutationFn: async (sec: Partial<PrivacySection>) => {
      if (sec.id) {
        return privacyService.updatePrivacySection(sec.id, sec);
      }
      return privacyService.createPrivacySection({
        section_number: sec.section_number || '01',
        title_ar: sec.title_ar || '',
        title_en: sec.title_en || '',
        content_ar: sec.content_ar || '',
        content_en: sec.content_en || '',
        icon: sec.icon || 'ShieldCheck',
        sort_order: sec.sort_order ?? 1,
        is_active: sec.is_active ?? true,
      });
    },
    onSuccess: () => {
      toast.success(t('common.saved'));
      setIsModalOpen(false);
      setEditingSection(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.privacySections });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('privacy_sections') });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: string) => privacyService.deletePrivacySection(id),
    onSuccess: () => {
      toast.success(t('common.deleted'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.privacySections });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('privacy_sections') });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const handleInfoChange = (key: keyof PrivacyInfo, val: string) => {
    setInfoValues((prev) => ({
      ...currentInfo,
      ...prev,
      [key]: val,
    }));
  };

  const handleArtworkUpload = async (file: File) => {
    const err = validateContentFile(file, 'image/*');
    if (err) {
      toast.error(t(err));
      return;
    }
    try {
      setUploadingArtwork(true);
      const { storagePath } = await uploadContentFile(file, PUBLIC_MEDIA_BUCKET);
      const publicUrl = contentFilePreviewUrl(storagePath);
      handleInfoChange('artwork_url', publicUrl);
      toast.success(t('common.uploaded'));
    } catch {
      toast.error(t('errors.uploadFailed'));
    } finally {
      setUploadingArtwork(false);
    }
  };

  const handleOpenAdd = () => {
    const existingCount = (sectionsQuery.data ?? []).length;
    const nextNum = String(existingCount + 1).padStart(2, '0');
    setEditingSection({
      section_number: nextNum,
      title_ar: '',
      title_en: '',
      content_ar: '',
      content_en: '',
      icon: 'ShieldCheck',
      sort_order: existingCount + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec: PrivacySection) => {
    setEditingSection({ ...sec });
    setIsModalOpen(true);
  };

  if (infoQuery.isLoading || sectionsQuery.isLoading) {
    return <LoadingState />;
  }

  const sections = sectionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* ── 1. General Privacy Info Settings ── */}
      <section className="rounded-xl2 border border-primary-100 bg-white p-5 space-y-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary-900 border-b border-slate-100 pb-3">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          إعدادات صفحة سياسة الخصوصية (العامة)
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label="عنوان الصفحة (عربي)">
            <Input
              value={currentInfo.title_ar}
              onChange={(e) => handleInfoChange('title_ar', e.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper label="Page Title (English)">
            <Input
              dir="ltr"
              value={currentInfo.title_en}
              onChange={(e) => handleInfoChange('title_en', e.target.value)}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label="وصف أعلى الصفحة (عربي)">
            <Textarea
              rows={2}
              value={currentInfo.subtitle_ar}
              onChange={(e) => handleInfoChange('subtitle_ar', e.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper label="Page Subtitle (English)">
            <Textarea
              dir="ltr"
              rows={2}
              value={currentInfo.subtitle_en}
              onChange={(e) => handleInfoChange('subtitle_en', e.target.value)}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label="التنويه/المقولة أسفل الصفحة (عربي)">
            <Input
              value={currentInfo.quote_ar}
              onChange={(e) => handleInfoChange('quote_ar', e.target.value)}
            />
          </FieldWrapper>

          <FieldWrapper label="Bottom Quote (English)">
            <Input
              dir="ltr"
              value={currentInfo.quote_en}
              onChange={(e) => handleInfoChange('quote_en', e.target.value)}
            />
          </FieldWrapper>
        </div>

        {/* Artwork Image Setting */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <span className="block text-xs font-bold text-primary-900 mb-2">
            الصورة الجانبية (Artwork Image)
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center">
              {currentInfo.artwork_url ? (
                <img src={currentInfo.artwork_url} alt="Artwork" className="h-full w-full object-contain p-1" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-64">
              <FieldWrapper label="رابط الصورة (URL)" hint="يمكنك استخدام الصورة الافتراضية أو رفع صورة جديدة">
                <Input
                  dir="ltr"
                  value={currentInfo.artwork_url}
                  onChange={(e) => handleInfoChange('artwork_url', e.target.value)}
                />
              </FieldWrapper>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="artwork-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-primary-900 hover:bg-slate-50"
                >
                  <Upload className="h-3.5 w-3.5 me-1.5 text-primary-600" />
                  {uploadingArtwork ? 'جاري الرفع...' : 'رفع صورة جديدة'}
                </label>
                <input
                  id="artwork-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleArtworkUpload(f);
                  }}
                />

                {currentInfo.artwork_url !== '/images/policy.png' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleInfoChange('artwork_url', '/images/policy.png')}
                  >
                    استعادة الصورة الافتراضية
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            onClick={() => saveInfoMutation.mutate(currentInfo)}
            isLoading={saveInfoMutation.isPending}
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            حفظ إعدادات الصفحة
          </Button>
        </div>
      </section>

      {/* ── 2. Dynamic Privacy Sections CRUD ── */}
      <section className="rounded-xl2 border border-primary-100 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary-900">
            أقسام سياسة الخصوصية ({sections.length})
          </h2>
          <Button size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="h-4 w-4" />}>
            إضافة قسم جديد
          </Button>
        </div>

        <div className="space-y-3">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                sec.is_active ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/70 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFFBF0] border border-[#F5E6C4] text-xs font-bold text-[#D89A16]">
                  {sec.section_number}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-primary-900 truncate">{sec.title_ar}</p>
                    <span className="text-xs font-mono text-slate-400">({sec.icon})</span>
                    {!sec.is_active && (
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 font-semibold">
                        معطل
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slateGray truncate mt-0.5" dir="ltr">
                    {sec.title_en}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-mono me-2">الترتيب: {sec.sort_order}</span>
                <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(sec)}>
                  <Edit2 className="h-4 w-4 text-primary-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('هل أنت تأكد من حذف هذا القسم؟')) {
                      deleteSectionMutation.mutate(sec.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Add / Edit Section Modal ── */}
      {isModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-primary-900 border-b pb-3">
              {editingSection.id ? 'تعديل قسم الخصوصية' : 'إضافة قسم خصوصية جديد'}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FieldWrapper label="رقم القسم (Badge)">
                <Input
                  value={editingSection.section_number ?? '01'}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, section_number: e.target.value }))}
                />
              </FieldWrapper>

              <FieldWrapper label="الأيقونة (Icon)">
                <Select
                  value={editingSection.icon ?? 'ShieldCheck'}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, icon: e.target.value }))}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Select>
              </FieldWrapper>

              <FieldWrapper label="الترتيب (Sort Order)">
                <Input
                  type="number"
                  value={editingSection.sort_order ?? 1}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                />
              </FieldWrapper>
            </div>

            <Checkbox
              id="sec-active"
              checked={editingSection.is_active ?? true}
              onChange={(e) => setEditingSection((prev) => ({ ...prev, is_active: e.target.checked }))}
              label="القسم نشط ويراد عرضه على الصفحة العامة"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper label="عنوان القسم (عربي)">
                <Input
                  value={editingSection.title_ar ?? ''}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, title_ar: e.target.value }))}
                  placeholder="مثال: أولاً: البيانات التي يتم جمعها"
                />
              </FieldWrapper>

              <FieldWrapper label="Section Title (English)">
                <Input
                  dir="ltr"
                  value={editingSection.title_en ?? ''}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, title_en: e.target.value }))}
                  placeholder="e.g. First: Collected Data"
                />
              </FieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper
                label="محتوى القسم (عربي)"
                hint="اكتب النص مع النقاط. اترك سطرًا لكل نقطة تبدأ بـ • لتنسيق القوائم تلقائيًا"
              >
                <Textarea
                  rows={6}
                  value={editingSection.content_ar ?? ''}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, content_ar: e.target.value }))}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Section Content (English)"
                hint="Write multi-line text with bullets starting with • for auto list formatting"
              >
                <Textarea
                  dir="ltr"
                  rows={6}
                  value={editingSection.content_en ?? ''}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, content_en: e.target.value }))}
                />
              </FieldWrapper>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSection(null);
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={() => saveSectionMutation.mutate(editingSection)}
                isLoading={saveSectionMutation.isPending}
                leftIcon={<Save className="h-4 w-4" />}
              >
                حفظ القسم
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
