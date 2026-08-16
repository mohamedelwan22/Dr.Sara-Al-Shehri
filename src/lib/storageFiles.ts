/**
 * أدوات مشتركة لملفات التخزين (Supabase Storage).
 * تُستخدم من نماذج الإدارة (document_path / image_path / materials_path)
 * ومن صفحات العرض العامة. لا يتم تخزين ثنائيات في قاعدة البيانات أبدًا —
 * فقط مسار `bucket/...` في عمود نصي.
 */

import { requireSupabase, getPublicStorageUrl } from '@/lib/supabase';

/** Buckets المحتوى الخاصة التي تحتاج Signed URL (قراءتها محصورة بالأدمن عبر RLS). */
export const PRIVATE_CONTENT_BUCKETS = [
  'research-documents',
  'publication-documents',
  'course-assets',
  'project-documents',
] as const;

/** Buckets عامة يمكن لأي زائر الوصول إليها برابط مباشر. */
export const PUBLIC_CONTENT_BUCKETS = ['public-media', 'branding-assets'] as const;

export const ALL_CONTENT_BUCKETS = [...PUBLIC_CONTENT_BUCKETS, ...PRIVATE_CONTENT_BUCKETS] as const;

/** الحد الأقصى للملفات المرفوعة عبر لوحة الإدارة (15 ميجابايت، مطابق لإعدادات bucket). */
export const MAX_CONTENT_FILE_BYTES = 15 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

const MIME_EXT_MAP: Record<string, string[]> = {
  'image/*': [...IMAGE_EXTENSIONS],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/svg+xml': ['svg'],
  'application/pdf': ['pdf'],
  'text/*': ['txt', 'md', 'csv'],
};

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'zip',
  ...IMAGE_EXTENSIONS,
]);

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot + 1).toLowerCase();
}

/** استخراج اسم الملف الأصلي من مسار التخزين `bucket/path`. */
export function fileDisplayName(storagePath: string): string {
  const segments = storagePath.split('/');
  return segments[segments.length - 1] ?? storagePath;
}

/** فصل bucket عن بقية المسار في `bucket/...`. */
export function splitStoragePath(storagePath: string): { bucket: string; path: string } {
  const slash = storagePath.indexOf('/');
  if (slash === -1) return { bucket: storagePath, path: '' };
  return { bucket: storagePath.slice(0, slash), path: storagePath.slice(slash + 1) };
}

export function isPublicBucket(bucket: string): boolean {
  return (PUBLIC_CONTENT_BUCKETS as readonly string[]).includes(bucket);
}

export function isImageStoragePath(storagePath: string): boolean {
  return IMAGE_EXTENSIONS.has(extensionOf(fileDisplayName(storagePath)));
}

/** رابط عرض مباشر للملفات العامة. */
export function contentFilePreviewUrl(storagePath: string): string {
  if (!storagePath) return '';
  const { bucket, path } = splitStoragePath(storagePath);
  return getPublicStorageUrl(bucket, path);
}

/** نوع خاطئ قابل للقراءة للبشر لملف غير مسموح به. */
export function fileTypeErrorKey(fileName: string): string | null {
  const ext = extensionOf(fileName);
  if (!ext) return 'admin.fileTypeRequired';
  if (!ALLOWED_EXTENSIONS.has(ext)) return 'admin.fileTypeNotAllowed';
  return null;
}

/**
 * استخراج الامتدادات المسموحة من سمة `accept` الخاصة بحقل ملف
 * (مثل `image/*` أو `application/pdf,.doc`). يُرجع null عند عدم
 * وجود accept أو عند نمط MIME غير معروف (لا نقيّد حينها).
 */
function acceptExtensions(accept?: string): Set<string> | null {
  if (!accept) return null;
  const set = new Set<string>();
  for (const raw of accept.split(',')) {
    const token = raw.trim().toLowerCase();
    if (token.startsWith('.')) {
      set.add(token.slice(1));
    } else if (MIME_EXT_MAP[token]) {
      for (const ext of MIME_EXT_MAP[token]) set.add(ext);
    } else if (token.includes('/') && token.endsWith('/*')) {
      return null;
    }
  }
  return set.size ? set : null;
}

/**
 * التحقق من الملف قبل الرفع: الحجم ≤ 15MB والنوع ضمن القائمة المسموحة.
 * عند تمرير `accept` (مثل `image/*`) يُقيَّد النوع على حقل الملف نفسه.
 * يُرجع مفتاح خطأ i18n أو null عند القبول.
 */
export function validateContentFile(file: File, accept?: string): string | null {
  if (file.size > MAX_CONTENT_FILE_BYTES) return 'admin.fileTooLarge';
  const typeKey = fileTypeErrorKey(file.name);
  if (typeKey) return typeKey;
  const allowed = acceptExtensions(accept);
  if (allowed && !allowed.has(extensionOf(file.name))) return 'admin.fileTypeNotAllowed';
  return null;
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned.toLowerCase() || 'file';
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * رفع ملف إلى Supabase Storage عبر الجلسة الحالية (تحت RLS: الرفع للأدمن فقط).
 * المسار الناتج يُخزَّن في الصف (bucket/...).
 */
export async function uploadContentFile(
  file: File,
  bucket: string = 'public-media',
): Promise<{ bucket: string; storagePath: string }> {
  const client = requireSupabase();
  const path = `${randomId()}-${sanitizeFileName(file.name)}`;
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  return { bucket, storagePath: `${bucket}/${path}` };
}

/**
 * حذف ملف من التخزين (أفضل جهد). يُستخدم عند استبدال ملف أو حذف عنصر
 * حتى لا تتراكم الملفات اليتيمة. لا يرمي الأخطاء لألا يُعطّل حذف الصف.
 */
export async function removeStoredFile(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const { bucket, path } = splitStoragePath(storagePath);
  if (!path) return;
  try {
    await requireSupabase().storage.from(bucket).remove([path]);
  } catch {
    // تجاهل فشل التنظيف — لا يمنع حذف/تحديث المحتوى.
  }
}
