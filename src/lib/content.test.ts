import { describe, expect, it } from 'vitest';
import {
  buildIlikeOr,
  escapeIlike,
  shouldStampPublishedAt,
  totalPages,
} from './content';

describe('escapeIlike', () => {
  it('يهرّب محارف ILIKE الخاصة', () => {
    expect(escapeIlike('100%')).toBe('100\\%');
    expect(escapeIlike('a_b')).toBe('a\\_b');
    expect(escapeIlike('a\\b')).toBe('a\\\\b');
    expect(escapeIlike('نص عادي')).toBe('نص عادي');
  });
});

describe('buildIlikeOr', () => {
  it('يبني شرط OR صحيحًا لأعمدة متعددة', () => {
    expect(buildIlikeOr(['title_ar', 'title_en'], 'قانون'))
      .toBe('title_ar.ilike.%قانون%,title_en.ilike.%قانون%');
  });

  it('يهرّب المحارف داخل النص', () => {
    expect(buildIlikeOr(['title_ar'], 'a%b'))
      .toBe('title_ar.ilike.%a\\%b%');
  });

  it('يُرجع سلسلة فارغة للنص الفارغ', () => {
    expect(buildIlikeOr(['title_ar'], '   ')).toBe('');
    expect(buildIlikeOr(['title_ar'], '')).toBe('');
  });
});

describe('shouldStampPublishedAt', () => {
  it('يختم التاريخ عند النشر على جدول يدعمه', () => {
    expect(shouldStampPublishedAt('research_papers', 'published', null)).toBe(true);
    expect(shouldStampPublishedAt('news', 'published', undefined)).toBe(true);
    expect(shouldStampPublishedAt('scientific_supervisions', 'published', '')).toBe(true);
    expect(shouldStampPublishedAt('profile_content', 'published', null)).toBe(true);
  });

  it('لا يختم جدولًا لا يملك عمود published_at', () => {
    expect(shouldStampPublishedAt('calendar_events', 'published', null)).toBe(false);
    expect(shouldStampPublishedAt('scientific_axes', 'published', null)).toBe(false);
    expect(shouldStampPublishedAt('announcements', 'published', null)).toBe(false);
  });

  it('لا يختم ما لم تكن الحالة published', () => {
    expect(shouldStampPublishedAt('research_papers', 'draft', null)).toBe(false);
    expect(shouldStampPublishedAt('research_papers', 'scheduled', null)).toBe(false);
  });

  it('لا يكتب فوق تاريخ نشر سابق', () => {
    expect(shouldStampPublishedAt('research_papers', 'published', '2026-01-01T00:00:00Z')).toBe(false);
  });
});

describe('totalPages', () => {
  it('يحسب عدد الصفحات صحيحًا', () => {
    expect(totalPages(0, 12)).toBe(1);
    expect(totalPages(12, 12)).toBe(1);
    expect(totalPages(13, 12)).toBe(2);
    expect(totalPages(24, 12)).toBe(2);
    expect(totalPages(25, 12)).toBe(3);
  });

  it('يتعامل بأمان مع حجم صفحة غير موجب', () => {
    expect(totalPages(10, 0)).toBe(1);
    expect(totalPages(10, -5)).toBe(1);
  });
});
