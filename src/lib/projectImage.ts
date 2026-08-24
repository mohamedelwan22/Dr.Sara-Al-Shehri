/**
 * Shared resolver for Research Project cover images.
 *
 * Stored format in research_projects.image_path:
 *   "public-media/<uuid>-<filename>.<ext>"
 *
 * This resolver converts that storage path into a renderable public URL
 * by delegating to the existing Supabase Storage helpers.
 * It is intentionally generic so it works for any content type that
 * stores images using the same `bucket/path` convention.
 *
 * Supported input variants:
 *   - null / undefined / empty string / whitespace  → returns null
 *   - already-absolute URL (http:, https:, data:, blob:)  → returned as-is
 *   - "public-media/<path>"  → resolved via Supabase getPublicUrl
 *   - "<path>" (no bucket prefix, default bucket used)  → resolved via Supabase getPublicUrl
 */

import { getPublicStorageUrl } from '@/lib/supabase';
import { splitStoragePath } from '@/lib/storageFiles';

const ABSOLUTE_SCHEMES = ['http:', 'https:', 'data:', 'blob:'];

/**
 * Determine whether a string is already a fully-qualified renderable URL.
 * These values can be passed directly to <img src> without any transformation.
 */
function isAbsoluteUrl(value: string): boolean {
  return ABSOLUTE_SCHEMES.some((scheme) => value.startsWith(scheme));
}

/**
 * Resolve a Research Project image_path to a renderable public URL.
 *
 * @param imagePath  The raw value from research_projects.image_path
 * @param defaultBucket  Bucket to use when imagePath has no bucket prefix
 *                       (defaults to "public-media" — the application's public media bucket)
 * @returns A fully-qualified URL string, or null when no image is available.
 */
export function resolveProjectImageUrl(
  imagePath: string | null | undefined,
  defaultBucket = 'public-media',
): string | null {
  // Treat missing / blank values as "no image"
  if (!imagePath || !imagePath.trim()) return null;

  const trimmed = imagePath.trim();

  // If it's already a complete URL, return it unchanged
  if (isAbsoluteUrl(trimmed)) return trimmed;

  // Split "bucket/path" — splitStoragePath handles paths without a "/" gracefully
  const { bucket, path } = splitStoragePath(trimmed);

  // When the stored value has no "/" (no explicit bucket prefix), treat the
  // entire string as the file path within the default bucket.
  if (!path) {
    return getPublicStorageUrl(defaultBucket, bucket) || null;
  }

  const url = getPublicStorageUrl(bucket, path);
  return url || null;
}
