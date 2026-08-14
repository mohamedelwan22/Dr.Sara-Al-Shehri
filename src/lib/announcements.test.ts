import { describe, expect, it } from 'vitest';
import { announcementIsActive } from './announcements';

const NOW = new Date('2026-08-14T12:00:00Z');

function announcement(overrides: Partial<Parameters<typeof announcementIsActive>[0]> = {}) {
  return { is_active: true, active_from: null, active_until: null, ...overrides };
}

describe('announcementIsActive', () => {
  it('يعرض الإعلان النشط بدون نافذة زمنية', () => {
    expect(announcementIsActive(announcement(), NOW)).toBe(true);
  });

  it('يُخفي الإعلان غير النشط', () => {
    expect(announcementIsActive(announcement({ is_active: false }), NOW)).toBe(false);
  });

  it('يحترم بداية النافذة (ضمناً)', () => {
    expect(
      announcementIsActive(announcement({ active_from: '2026-08-14T12:00:00Z' }), NOW),
    ).toBe(true);
    expect(
      announcementIsActive(announcement({ active_from: '2026-08-14T12:00:01Z' }), NOW),
    ).toBe(false);
    expect(
      announcementIsActive(announcement({ active_from: '2026-08-01T00:00:00Z' }), NOW),
    ).toBe(true);
  });

  it('يحترم نهاية النافذة (ضمناً)', () => {
    expect(
      announcementIsActive(announcement({ active_until: '2026-08-14T12:00:00Z' }), NOW),
    ).toBe(true);
    expect(
      announcementIsActive(announcement({ active_until: '2026-08-14T11:59:59Z' }), NOW),
    ).toBe(false);
  });

  it('يتعامل بأمان مع التواريخ غير الصالحة (يُخفي الإعلان)', () => {
    expect(announcementIsActive(announcement({ active_from: 'not-a-date' }), NOW)).toBe(false);
    expect(announcementIsActive(announcement({ active_until: 'not-a-date' }), NOW)).toBe(false);
  });

  it('يجمع بين الشرطين داخل وخارج النافذة', () => {
    expect(
      announcementIsActive(
        announcement({
          active_from: '2026-08-01T00:00:00Z',
          active_until: '2026-08-31T00:00:00Z',
        }),
        NOW,
      ),
    ).toBe(true);
    expect(
      announcementIsActive(
        announcement({ is_active: false, active_from: '2026-08-01T00:00:00Z' }),
        NOW,
      ),
    ).toBe(false);
  });
});
