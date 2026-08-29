import type { ZodTypeAny } from 'zod';
import {
  researchPaperSchema,
  supervisionSchema,
  projectSchema,
  courseSchema,
  newsSchema,
  axisSchema,
  interestSchema,
  calendarEventSchema,
  announcementSchema,
  scientificSelectionSchema,
} from '@/schemas/content';
import { ADMIN_ENTITY_MAP } from '@/services';
import type { AxisContentType } from '@/types';
import {
  CONTENT_DOCUMENT_BUCKET,
  COURSE_ASSETS_BUCKET,
  PUBLIC_MEDIA_BUCKET,
  PUBLICATION_DOCUMENT_BUCKET,
} from '@/lib/storageFiles';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'url'
  | 'file'
  | 'select'
  | 'project_select'
  | 'axes'
  | 'boolean'
  | 'slug'
  | 'section';

export interface FieldConfig {
  key: string;
  kind: FieldKind;
  labelKey: string;
  hintKey?: string;
  options?: { value: string; labelKey: string }[];
  half?: boolean;
  rows?: number;
  /** Bucket التخزين لملفات حقول kind === 'file'. */
  bucket?: string;
  /** قيود إضافية لمُنتقي الملف (مثل image/*). */
  accept?: string;
  /** قسم تنظيمي في النموذج — يُعرض كعنوان فرعي. */
  section?: string;
}

export interface EntityConfig {
  entity: string;
  schema: ZodTypeAny;
  titleField: string;
  displayField: 'title' | 'name';
  axisType?: AxisContentType;
  fields: FieldConfig[];
}

/**
 * حالات طلبات التواصل تأتي من قاعدة البيانات بصيغة snake_case،
 * بينما مفاتيح الترجمة camelCase — هذه الخريطة تربطها بمفاتيح i18n الصحيحة
 * حتى لا يظهر مفتاح خام (مثل admin.in_review) في الواجهة أبدًا.
 */
export const CONTACT_STATUS_LABEL_KEYS = {
  new: 'admin.new',
  in_review: 'admin.inReview',
  responded: 'admin.responded',
  closed: 'admin.closed',
} as const;

const STATUS_OPTIONS = [
  { value: 'draft', labelKey: 'common.draft' },
  { value: 'published', labelKey: 'common.published' },
  { value: 'scheduled', labelKey: 'common.scheduled' },
  { value: 'archived', labelKey: 'common.archived' },
];

const DEGREE_OPTIONS = [
  { value: 'masters', labelKey: 'contact.masters' },
  { value: 'phd', labelKey: 'contact.phd' },
];

const EVENT_TYPE_OPTIONS = [
  { value: 'conference', labelKey: 'calendar.eventType.conference' },
  { value: 'discussion', labelKey: 'calendar.eventType.discussion' },
  { value: 'lecture', labelKey: 'calendar.eventType.lecture' },
  { value: 'publication', labelKey: 'calendar.eventType.publication' },
  { value: 'course', labelKey: 'calendar.eventType.course' },
  { value: 'supervision', labelKey: 'calendar.eventType.supervision' },
  { value: 'other', labelKey: 'calendar.eventType.other' },
];

function langFields(prefix: string, key: string): FieldConfig[] {
  return [
    { key: `${key}_ar`, kind: 'text', labelKey: `${prefix}.${key}_ar`, half: true },
    { key: `${key}_en`, kind: 'text', labelKey: `${prefix}.${key}_en`, half: true },
  ];
}

const PROJECT_TYPE_OPTIONS = [
  { value: 'research_project', labelKey: 'projects.types.researchProject' },
  { value: 'scientific_project', labelKey: 'projects.types.scientificProject' },
  { value: 'thesis_project', labelKey: 'projects.types.thesisProject' },
  { value: 'manuscript_project', labelKey: 'projects.types.manuscriptProject' },
  { value: 'collaborative_research', labelKey: 'projects.types.collaborativeResearch' },
  { value: 'academic_study', labelKey: 'projects.types.academicStudy' },
  { value: 'other', labelKey: 'projects.types.other' },
];

const DEGREE_OPTIONS_ADMIN = [
  { value: 'bachelors', labelKey: 'admin.fields.degreeBachelors' },
  { value: 'masters', labelKey: 'contact.masters' },
  { value: 'phd', labelKey: 'contact.phd' },
  { value: 'postdoctoral', labelKey: 'admin.fields.degreePostdoctoral' },
];

const PARTICIPATION_OPTIONS = [
  { value: 'main_supervisor', labelKey: 'admin.fields.participationMainSupervisor' },
  { value: 'co_supervisor', labelKey: 'admin.fields.participationCoSupervisor' },
  { value: 'researcher', labelKey: 'admin.fields.participationResearcher' },
  { value: 'committee_member', labelKey: 'admin.fields.participationCommitteeMember' },
  { value: 'examiner', labelKey: 'admin.fields.participationExaminer' },
  { value: 'other', labelKey: 'projects.types.other' },
];

const LEVEL_OPTIONS = [
  { value: 'beginner', labelKey: 'courses.levels.beginner' },
  { value: 'intermediate', labelKey: 'courses.levels.intermediate' },
  { value: 'advanced', labelKey: 'courses.levels.advanced' },
  { value: 'general', labelKey: 'courses.levels.general' },
];

const DELIVERY_MODE_OPTIONS = [
  { value: 'online', labelKey: 'courses.modes.online' },
  { value: 'in_person', labelKey: 'courses.modes.inPerson' },
  { value: 'hybrid', labelKey: 'courses.modes.hybrid' },
];

const EVENT_STATUS_OPTIONS = [
  { value: 'upcoming', labelKey: 'courses.statuses.upcoming' },
  { value: 'completed', labelKey: 'courses.statuses.completed' },
];

export const ADMIN_ENTITIES: string[] = Object.keys(ADMIN_ENTITY_MAP);

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  research: {
    entity: 'research',
    schema: researchPaperSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'research',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'research_type', kind: 'text', labelKey: 'admin.fields.research_type', half: true },
      ...langFields('admin.fields', 'author'),
      ...langFields('admin.fields', 'institution'),
      { key: 'publication_year', kind: 'number', labelKey: 'admin.fields.publication_year', half: true },
      { key: 'abstract_ar', kind: 'textarea', labelKey: 'admin.fields.abstract_ar', rows: 4 },
      { key: 'abstract_en', kind: 'textarea', labelKey: 'admin.fields.abstract_en', rows: 4 },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'document_path', kind: 'file', labelKey: 'admin.fields.document_path', bucket: CONTENT_DOCUMENT_BUCKET, half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'featured', kind: 'boolean', labelKey: 'admin.fields.featured' },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  publications: {
    entity: 'publications',
    schema: researchPaperSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'publication',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'research_type', kind: 'text', labelKey: 'admin.fields.research_type', half: true },
      ...langFields('admin.fields', 'author'),
      ...langFields('admin.fields', 'institution'),
      { key: 'publication_year', kind: 'number', labelKey: 'admin.fields.publication_year', half: true },
      { key: 'abstract_ar', kind: 'textarea', labelKey: 'admin.fields.abstract_ar', rows: 4 },
      { key: 'abstract_en', kind: 'textarea', labelKey: 'admin.fields.abstract_en', rows: 4 },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'document_path', kind: 'file', labelKey: 'admin.fields.document_path', bucket: PUBLICATION_DOCUMENT_BUCKET, half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'featured', kind: 'boolean', labelKey: 'admin.fields.featured' },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  supervision: {
    entity: 'supervision',
    schema: supervisionSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'supervision',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'researcher'),
      ...langFields('admin.fields', 'university'),
      { key: 'degree', kind: 'select', labelKey: 'contact.degree', options: DEGREE_OPTIONS, half: true },
      { key: 'completion_date', kind: 'date', labelKey: 'admin.fields.completion_date', half: true },
      { key: 'project_id', kind: 'project_select', labelKey: 'projects.selectProject', half: true },
      { key: 'summary_ar', kind: 'textarea', labelKey: 'admin.fields.summary_ar', rows: 4 },
      { key: 'summary_en', kind: 'textarea', labelKey: 'admin.fields.summary_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  discussions: {
    entity: 'discussions',
    schema: supervisionSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'discussion',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'researcher'),
      ...langFields('admin.fields', 'university'),
      { key: 'degree', kind: 'select', labelKey: 'contact.degree', options: DEGREE_OPTIONS, half: true },
      { key: 'completion_date', kind: 'date', labelKey: 'admin.fields.completion_date', half: true },
      { key: 'project_id', kind: 'project_select', labelKey: 'projects.selectProject', half: true },
      { key: 'summary_ar', kind: 'textarea', labelKey: 'admin.fields.summary_ar', rows: 4 },
      { key: 'summary_en', kind: 'textarea', labelKey: 'admin.fields.summary_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  projects: {
    entity: 'projects',
    schema: projectSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'project',
    fields: [
      // ── Section 1: Basic Information ──
      { key: '_section1', kind: 'section', labelKey: 'admin.formSections.basicInfo' },
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'project_type', kind: 'select', labelKey: 'admin.fields.project_type', options: PROJECT_TYPE_OPTIONS, half: true },
      { key: 'project_status', kind: 'text', labelKey: 'admin.fields.project_status', half: true },

      // ── Section 2: Dates ──
      { key: '_section2', kind: 'section', labelKey: 'admin.formSections.dates' },
      { key: 'start_date', kind: 'date', labelKey: 'projects.startDate', half: true },
      { key: 'end_date', kind: 'date', labelKey: 'projects.endDate', half: true },

      // ── Section 3: People & Academic Info ──
      { key: '_section3', kind: 'section', labelKey: 'admin.formSections.peopleAcademic' },
      ...langFields('admin.fields', 'researcher'),
      ...langFields('admin.fields', 'university'),
      ...langFields('admin.fields', 'faculty'),
      ...langFields('admin.fields', 'department'),
      ...langFields('admin.fields', 'supervisor'),
      { key: 'academic_degree', kind: 'select', labelKey: 'admin.fields.academic_degree', options: DEGREE_OPTIONS_ADMIN, half: true },
      { key: 'participation_type', kind: 'select', labelKey: 'admin.fields.participation_type', options: PARTICIPATION_OPTIONS, half: true },

      // ── Section 4: Descriptions ──
      { key: '_section4', kind: 'section', labelKey: 'admin.formSections.descriptions' },
      { key: 'short_description_ar', kind: 'textarea', labelKey: 'admin.fields.short_description_ar', rows: 3 },
      { key: 'short_description_en', kind: 'textarea', labelKey: 'admin.fields.short_description_en', rows: 3 },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 5 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 5 },

      // ── Section 5: Scientific Information ──
      { key: '_section5', kind: 'section', labelKey: 'admin.formSections.scientificInfo' },
      { key: 'objectives_ar', kind: 'textarea', labelKey: 'admin.fields.objectives_ar', rows: 4 },
      { key: 'objectives_en', kind: 'textarea', labelKey: 'admin.fields.objectives_en', rows: 4 },
      { key: 'methodology_ar', kind: 'textarea', labelKey: 'admin.fields.methodology_ar', rows: 4 },
      { key: 'methodology_en', kind: 'textarea', labelKey: 'admin.fields.methodology_en', rows: 4 },
      { key: 'outcomes_ar', kind: 'textarea', labelKey: 'admin.fields.outcomes_ar', rows: 4 },
      { key: 'outcomes_en', kind: 'textarea', labelKey: 'admin.fields.outcomes_en', rows: 4 },
      { key: 'keywords', kind: 'text', labelKey: 'admin.fields.keywords' },

      // ── Section 6: Media ──
      { key: '_section6', kind: 'section', labelKey: 'admin.formSections.media' },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },

      // ── Section 7: Publishing ──
      { key: '_section7', kind: 'section', labelKey: 'admin.formSections.publishing' },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'featured', kind: 'boolean', labelKey: 'admin.fields.featured' },

      // ── Section 8: Scientific Axes ──
      { key: '_section8', kind: 'section', labelKey: 'admin.formSections.axes' },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  courses: {
    entity: 'courses',
    schema: courseSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'course',
    fields: [
      { key: '_sectionBasic', kind: 'section', labelKey: 'admin.formSections.basicInfo' },
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'instructor'),

      { key: '_sectionSchedule', kind: 'section', labelKey: 'admin.formSections.dates' },
      { key: 'activity_date', kind: 'datetime', labelKey: 'courses.dateTime', half: true },
      { key: 'ends_at', kind: 'datetime', labelKey: 'admin.fields.ends_at', hintKey: 'admin.fields.endsAtHint', half: true },
      ...langFields('admin.fields', 'duration'),
      { key: 'duration_hours', kind: 'number', labelKey: 'admin.fields.duration_hours', half: true },

      { key: '_sectionAttributes', kind: 'section', labelKey: 'admin.formSections.attributes' },
      { key: 'level', kind: 'select', labelKey: 'admin.fields.level', options: LEVEL_OPTIONS, half: true },
      { key: 'delivery_mode', kind: 'select', labelKey: 'admin.fields.delivery_mode', options: DELIVERY_MODE_OPTIONS, half: true },
      { key: 'event_status', kind: 'select', labelKey: 'admin.fields.event_status', options: EVENT_STATUS_OPTIONS, half: true },
      ...langFields('admin.fields', 'location'),

      { key: '_sectionDescriptions', kind: 'section', labelKey: 'admin.formSections.descriptions' },
      { key: 'short_description_ar', kind: 'textarea', labelKey: 'admin.fields.short_description_ar', rows: 3 },
      { key: 'short_description_en', kind: 'textarea', labelKey: 'admin.fields.short_description_en', rows: 3 },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 5 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 5 },

      { key: '_sectionMedia', kind: 'section', labelKey: 'admin.formSections.media' },
      { key: 'registration_url', kind: 'url', labelKey: 'admin.fields.registration_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'meeting_url', kind: 'url', labelKey: 'admin.fields.meeting_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'video_url', kind: 'url', labelKey: 'admin.fields.video_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'materials_path', kind: 'file', labelKey: 'admin.fields.materials_path', bucket: COURSE_ASSETS_BUCKET, half: true },

      { key: '_sectionPublishing', kind: 'section', labelKey: 'admin.formSections.publishing' },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'featured', kind: 'boolean', labelKey: 'admin.fields.featured' },

      { key: '_sectionAxes', kind: 'section', labelKey: 'admin.formSections.axes' },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  lectures: {
    entity: 'lectures',
    schema: courseSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'lecture',
    fields: [
      { key: '_sectionBasic', kind: 'section', labelKey: 'admin.formSections.basicInfo' },
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'instructor'),

      { key: '_sectionSchedule', kind: 'section', labelKey: 'admin.formSections.dates' },
      { key: 'activity_date', kind: 'datetime', labelKey: 'courses.dateTime', half: true },
      { key: 'ends_at', kind: 'datetime', labelKey: 'admin.fields.ends_at', hintKey: 'admin.fields.endsAtHint', half: true },
      ...langFields('admin.fields', 'duration'),
      { key: 'duration_hours', kind: 'number', labelKey: 'admin.fields.duration_hours', half: true },

      { key: '_sectionAttributes', kind: 'section', labelKey: 'admin.formSections.attributes' },
      { key: 'level', kind: 'select', labelKey: 'admin.fields.level', options: LEVEL_OPTIONS, half: true },
      { key: 'delivery_mode', kind: 'select', labelKey: 'admin.fields.delivery_mode', options: DELIVERY_MODE_OPTIONS, half: true },
      { key: 'event_status', kind: 'select', labelKey: 'admin.fields.event_status', options: EVENT_STATUS_OPTIONS, half: true },
      ...langFields('admin.fields', 'location'),

      { key: '_sectionDescriptions', kind: 'section', labelKey: 'admin.formSections.descriptions' },
      { key: 'short_description_ar', kind: 'textarea', labelKey: 'admin.fields.short_description_ar', rows: 3 },
      { key: 'short_description_en', kind: 'textarea', labelKey: 'admin.fields.short_description_en', rows: 3 },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 5 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 5 },

      { key: '_sectionMedia', kind: 'section', labelKey: 'admin.formSections.media' },
      { key: 'registration_url', kind: 'url', labelKey: 'admin.fields.registration_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'meeting_url', kind: 'url', labelKey: 'admin.fields.meeting_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'video_url', kind: 'url', labelKey: 'admin.fields.video_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'materials_path', kind: 'file', labelKey: 'admin.fields.materials_path', bucket: COURSE_ASSETS_BUCKET, half: true },

      { key: '_sectionPublishing', kind: 'section', labelKey: 'admin.formSections.publishing' },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'featured', kind: 'boolean', labelKey: 'admin.fields.featured' },

      { key: '_sectionAxes', kind: 'section', labelKey: 'admin.formSections.axes' },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  axes: {
    entity: 'axes',
    schema: axisSchema,
    titleField: 'name_ar',
    displayField: 'name',
    fields: [
      { key: 'name_ar', kind: 'text', labelKey: 'admin.fields.name_ar', half: true },
      { key: 'name_en', kind: 'text', labelKey: 'admin.fields.name_en', half: true },
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 4 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  interests: {
    entity: 'interests',
    schema: interestSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      { key: 'title_ar', kind: 'text', labelKey: 'admin.fields.title_ar', half: true },
      { key: 'title_en', kind: 'text', labelKey: 'admin.fields.title_en', half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 4 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  news: {
    entity: 'news',
    schema: newsSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'excerpt_ar', kind: 'textarea', labelKey: 'admin.fields.excerpt_ar', rows: 3 },
      { key: 'excerpt_en', kind: 'textarea', labelKey: 'admin.fields.excerpt_en', rows: 3 },
      { key: 'body_ar', kind: 'textarea', labelKey: 'admin.fields.body_ar', rows: 8 },
      { key: 'body_en', kind: 'textarea', labelKey: 'admin.fields.body_en', rows: 8 },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  insights: {
    entity: 'insights',
    schema: newsSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'excerpt_ar', kind: 'textarea', labelKey: 'admin.fields.excerpt_ar', rows: 3 },
      { key: 'excerpt_en', kind: 'textarea', labelKey: 'admin.fields.excerpt_en', rows: 3 },
      { key: 'body_ar', kind: 'textarea', labelKey: 'admin.fields.body_ar', rows: 8 },
      { key: 'body_en', kind: 'textarea', labelKey: 'admin.fields.body_en', rows: 8 },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  calendar: {
    entity: 'calendar',
    schema: calendarEventSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'event_type', kind: 'select', labelKey: 'admin.fields.event_type', options: EVENT_TYPE_OPTIONS, half: true },
      { key: 'starts_at', kind: 'datetime', labelKey: 'admin.fields.starts_at', half: true },
      { key: 'ends_at', kind: 'datetime', labelKey: 'admin.fields.ends_at', hintKey: 'admin.fields.endsAtHint', half: true },
      ...langFields('admin.fields', 'location'),
      { key: 'link_url', kind: 'url', labelKey: 'admin.fields.link_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 4 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  announcements: {
    entity: 'announcements',
    schema: announcementSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      { key: 'title_ar', kind: 'text', labelKey: 'admin.fields.title_ar', half: true },
      { key: 'title_en', kind: 'text', labelKey: 'admin.fields.title_en', half: true },
      { key: 'link_url', kind: 'url', labelKey: 'admin.fields.link_url', hintKey: 'admin.fields.linkUrlInternalHint', half: true },
      { key: 'icon', kind: 'text', labelKey: 'admin.fields.icon', hintKey: 'admin.fields.iconHint', half: true },
      { key: 'active_from', kind: 'datetime', labelKey: 'admin.fields.active_from', half: true },
      { key: 'active_until', kind: 'datetime', labelKey: 'admin.fields.active_until', hintKey: 'admin.fields.endsAtHint', half: true },
      { key: 'body_ar', kind: 'textarea', labelKey: 'admin.fields.body_ar', rows: 6 },
      { key: 'body_en', kind: 'textarea', labelKey: 'admin.fields.body_en', rows: 6 },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'is_active', kind: 'boolean', labelKey: 'admin.fields.is_active' },
    ],
  },
  selections: {
    entity: 'selections',
    schema: scientificSelectionSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      {
        key: 'section',
        kind: 'select',
        labelKey: 'admin.fields.selection_section',
        options: [
          { value: 'selected_research', labelKey: 'selections.sections.selected_research' },
          { value: 'selected_publications', labelKey: 'selections.sections.selected_publications' },
          { value: 'distinguished_theses', labelKey: 'selections.sections.distinguished_theses' },
        ],
        half: true,
      },
      ...langFields('admin.fields', 'title'),
      ...langFields('admin.fields', 'subtitle'),
      ...langFields('admin.fields', 'author'),
      ...langFields('admin.fields', 'university'),
      ...langFields('admin.fields', 'journal'),
      { key: 'publication_year', kind: 'text', labelKey: 'admin.fields.publication_year', half: true },
      { key: 'grant_year', kind: 'text', labelKey: 'admin.fields.grant_year', half: true },
      { key: 'summary_ar', kind: 'textarea', labelKey: 'admin.fields.summary_ar', rows: 4 },
      { key: 'summary_en', kind: 'textarea', labelKey: 'admin.fields.summary_en', rows: 4 },
      { key: 'image_path', kind: 'file', labelKey: 'admin.fields.image_path', bucket: PUBLIC_MEDIA_BUCKET, accept: 'image/*', half: true },
      { key: 'document_path', kind: 'file', labelKey: 'admin.fields.document_path', bucket: CONTENT_DOCUMENT_BUCKET, half: true },
      { key: 'read_url', kind: 'url', labelKey: 'admin.fields.read_url', half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'is_active', kind: 'boolean', labelKey: 'admin.fields.is_active' },
    ],
  },
};


