/**
 * أنواع قاعدة البيانات — تطابق 001_schema.sql حرفيًا.
 */

export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived';
export type AppRole = 'admin' | 'user';

export type ScientificSelectionSection =
  | 'selected_research'
  | 'selected_publications'
  | 'distinguished_theses';

export interface ScientificSelection {
  id: string;
  section: ScientificSelectionSection;
  title_ar: string;
  title_en?: string | null;
  subtitle_ar?: string | null;
  subtitle_en?: string | null;
  author_ar?: string | null;
  author_en?: string | null;
  university_ar?: string | null;
  university_en?: string | null;
  journal_ar?: string | null;
  journal_en?: string | null;
  publication_year?: string | null;
  grant_year?: string | null;
  summary_ar?: string | null;
  summary_en?: string | null;
  image_path?: string | null;
  document_path?: string | null;
  read_url?: string | null;
  sort_order?: number | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export type AxisContentType =
  | 'research'
  | 'publication'
  | 'supervision'
  | 'discussion'
  | 'project'
  | 'course'
  | 'lecture';

export interface Profile {
  id: string;
  display_name: string | null;
  locale: 'ar' | 'en';
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  is_public: boolean;
  updated_at: string;
}

export interface ProfileContent {
  id: string;
  section: string;
  title_ar: string | null;
  title_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  status: ContentStatus;
  published_at: string | null;
  updated_at: string;
}

export interface PrivacySection {
  id: string;
  section_number: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrivacyInfo {
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  quote_ar?: string;
  quote_en?: string;
  artwork_url?: string;
}

export interface ResearchInterest {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
  status: ContentStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScientificAxis {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  status: ContentStatus;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ResearchPaper {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  author_ar: string | null;
  author_en: string | null;
  institution_ar: string | null;
  institution_en: string | null;
  publication_year: number | null;
  research_type?: string | null;
  abstract_ar: string | null;
  abstract_en: string | null;
  image_path?: string | null;
  document_path: string | null;
  sort_order?: number | null;
  featured?: boolean | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScientificSupervision {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  researcher_ar: string | null;
  researcher_en: string | null;
  university_ar: string | null;
  university_en: string | null;
  degree: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  completion_date: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProjectMetrics {
  totalTheses: number;
  awardedTheses: number;
  inProgressTheses: number;
  progressPercent: number;
}

export interface ResearchProject {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  short_description_ar: string | null;
  short_description_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  project_type: string | null;
  project_status: string | null;
  start_date: string | null;
  end_date: string | null;
  researcher_ar: string | null;
  researcher_en: string | null;
  university_ar: string | null;
  university_en: string | null;
  faculty_ar: string | null;
  faculty_en: string | null;
  department_ar: string | null;
  department_en: string | null;
  supervisor_ar: string | null;
  supervisor_en: string | null;
  academic_degree: string | null;
  participation_type: string | null;
  objectives_ar: string | null;
  objectives_en: string | null;
  methodology_ar: string | null;
  methodology_en: string | null;
  outcomes_ar: string | null;
  outcomes_en: string | null;
  keywords: string | null;
  image_path: string | null;
  sort_order: number | null;
  featured: boolean | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  metrics?: ProjectMetrics;
}

export interface ProjectRelatedItem {
  id: string;
  project_id: string;
  item_type: 'supervision' | 'discussion';
  item_id: string;
  sort_order: number | null;
}

export interface Course {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  short_description_ar?: string | null;
  short_description_en?: string | null;
  description_ar: string | null;
  description_en: string | null;
  instructor_ar?: string | null;
  instructor_en?: string | null;
  duration_ar?: string | null;
  duration_en?: string | null;
  duration_hours?: number | null;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'general' | string | null;
  delivery_mode?: 'online' | 'in_person' | 'hybrid' | string | null;
  event_status?: 'upcoming' | 'completed' | string | null;
  activity_date: string | null;
  ends_at: string | null;
  location_ar: string | null;
  location_en: string | null;
  registration_url: string | null;
  meeting_url: string | null;
  video_url: string | null;
  image_path: string | null;
  materials_path: string | null;
  sort_order?: number | null;
  featured?: boolean | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CourseOrLectureItem extends Course {
  contentType: 'course' | 'lecture';
}

export interface ContentAxisLink {
  id: string;
  axis_id: string;
  content_type: AxisContentType;
  content_id: string;
  created_at: string | null;
}

export interface News {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  image_path: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Announcement {
  id: string;
  title_ar: string;
  title_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  link_url: string | null;
  icon: string | null;
  active_from: string | null;
  active_until: string | null;
  sort_order: number | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CalendarEvent {
  id: string;
  title_ar: string;
  title_en: string | null;
  event_type: string;
  starts_at: string;
  ends_at: string | null;
  location_ar: string | null;
  location_en: string | null;
  link_url: string | null;
  description_ar: string | null;
  description_en: string | null;
  source_type: string | null;
  source_id: string | null;
  status: ContentStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContactSubmission {
  id: string;
  user_id: string | null;
  type: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  payload: Record<string, unknown>;
  status: 'new' | 'in_review' | 'responded' | 'closed';
  internal_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContactAttachment {
  id: string;
  submission_id: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  created_at: string | null;
}

export interface ContentInteraction {
  id: number;
  user_id: string | null;
  content_type: string;
  content_id: string;
  visitor_hash: string | null;
  created_at: string | null;
}

export interface Media {
  id: string;
  bucket: string;
  storage_path: string;
  alt_ar: string | null;
  alt_en: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string | null;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

/** صفوف مشتركة بين الجداول المتطابقة (publications/lectures/insights). */
export type Publication = ResearchPaper;
export type Lecture = Course;
export type ScientificInsight = News;
export type ScientificDiscussion = ScientificSupervision;

/** نتيجة استعلامات البحث عبر RPC. */
export interface SearchResultRow {
  content_type: string;
  content_id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  excerpt_ar: string | null;
  excerpt_en: string | null;
}

/** إحصائيات محور علمي عبر RPC. */
export interface AxisContentCount {
  content_type: AxisContentType;
  count: number;
}

/** عنصر محتوى مرتبط بمحور عبر RPC (009_functions_metrics.sql). */
export interface AxisItemResult {
  content_type: AxisContentType;
  content_id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  published_at: string | null;
}

/** مقاييس تفاعل مجمّعة لعنصر محتوى. */
export interface ContentMetrics {
  views: number;
  downloads: number;
  shares: number;
  favorites: number;
}

/** إجماليات لوحة التحكم (017_admin_dashboard.sql → admin_dashboard_stats). */
export interface DashboardTotals {
  views: number;
  downloads: number;
  shares: number;
  favorites: number;
  submissions: number;
  new_submissions: number;
  users: number;
  submissions_by_status: Record<string, number>;
}

/** إحصاءات حالة عنصر لكل جدول محتوى. */
export interface DashboardEntityStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
}

/** عنصر في قائمة أحدث المحتوى بلوحة التحكم. */
export interface DashboardRecentItem {
  entity: string;
  id: string;
  slug: string | null;
  title_ar: string;
  title_en: string | null;
  status: string;
  published_at: string | null;
  updated_at: string | null;
}

/** استجابة admin_dashboard_stats الكاملة. */
export interface DashboardStats {
  totals: DashboardTotals;
  entities: Record<string, DashboardEntityStats>;
  content: { published: number; draft: number; scheduled: number; archived: number };
  announcements: { total: number; active: number; inactive: number };
  recent: DashboardRecentItem[];
}

/** نقطة سلسلة زمنية للتفاعل. */
export interface DashboardSeriesPoint {
  date: string;
  views: number;
  downloads: number;
}

/** استجابة admin_dashboard_series الكاملة. */
export interface DashboardSeries {
  period: string;
  points: DashboardSeriesPoint[];
  published: { date: string; count: number }[];
}
