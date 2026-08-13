import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout, RequireAuth, RequireAdmin } from '@/components/layout/Layout';
import { ScrollToTop } from '@/components/layout/Seo';
import { LoadingState } from '@/components/ui';

const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })));
const BiographyPage = lazy(() => import('@/pages/biography/BiographyPage').then((m) => ({ default: m.BiographyPage })));
const MissionPage = lazy(() => import('@/pages/mission/MissionPage').then((m) => ({ default: m.MissionPage })));
const InterestsPage = lazy(() => import('@/pages/interests/InterestsPage').then((m) => ({ default: m.InterestsPage })));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })));

const ResearchListPage = lazy(() => import('@/pages/research/ResearchListPage').then((m) => ({ default: m.ResearchListPage })));
const ResearchDetailPage = lazy(() => import('@/pages/research/ResearchDetailPage').then((m) => ({ default: m.ResearchDetailPage })));
const PublicationDetailPage = lazy(() => import('@/pages/research/PublicationDetailPage').then((m) => ({ default: m.PublicationDetailPage })));

const SupervisionPage = lazy(() => import('@/pages/supervision/SupervisionPage').then((m) => ({ default: m.SupervisionPage })));
const SupervisionDetailPage = lazy(() => import('@/pages/supervision/SupervisionPage').then((m) => ({ default: m.SupervisionDetailPage })));
const DiscussionsPage = lazy(() => import('@/pages/discussions/DiscussionsPage').then((m) => ({ default: m.DiscussionsPage })));
const DiscussionDetailPage = lazy(() => import('@/pages/discussions/DiscussionsPage').then((m) => ({ default: m.DiscussionDetailPage })));

const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const CoursesPage = lazy(() => import('@/pages/courses/CoursesPage').then((m) => ({ default: m.CoursesPage })));

const MapPage = lazy(() => import('@/pages/map/MapPage').then((m) => ({ default: m.MapPage })));
const AxisDetailPage = lazy(() => import('@/pages/map/AxisDetailPage').then((m) => ({ default: m.AxisDetailPage })));
const SearchPage = lazy(() => import('@/pages/search/SearchPage').then((m) => ({ default: m.SearchPage })));
const CalendarPage = lazy(() => import('@/pages/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })));

const NewsPage = lazy(() => import('@/pages/news/NewsPage').then((m) => ({ default: m.NewsPage })));
const NewsDetailPage = lazy(() => import('@/pages/news/NewsPage').then((m) => ({ default: m.NewsDetailPage })));
const InsightsPage = lazy(() => import('@/pages/insights/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const InsightDetailPage = lazy(() => import('@/pages/insights/InsightsPage').then((m) => ({ default: m.InsightDetailPage })));

const ContactPage = lazy(() => import('@/pages/contact/ContactPage').then((m) => ({ default: m.ContactPage })));
const SignInPage = lazy(() => import('@/pages/auth/SignInPage').then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage').then((m) => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const AccountPage = lazy(() => import('@/pages/account/AccountPage').then((m) => ({ default: m.AccountPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminEntityListPage = lazy(() => import('@/pages/admin/EntityListPage').then((m) => ({ default: m.EntityListPage })));
const AdminEntityFormPage = lazy(() => import('@/pages/admin/EntityFormPage').then((m) => ({ default: m.EntityFormPage })));
const AdminInboxPage = lazy(() => import('@/pages/admin/InboxPage').then((m) => ({ default: m.InboxPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })));
const AdminMediaPage = lazy(() => import('@/pages/admin/MediaPage').then((m) => ({ default: m.MediaPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AdminProfilePage = lazy(() => import('@/pages/admin/ProfilePage').then((m) => ({ default: m.ProfilePage })));

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<LoadingState />}>{node}</Suspense>;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={withSuspense(<HomePage />)} />
          <Route path="/biography" element={withSuspense(<BiographyPage />)} />
          <Route path="/scientific-mission" element={withSuspense(<MissionPage />)} />
          <Route path="/research-interests" element={withSuspense(<InterestsPage />)} />
          <Route path="/privacy" element={withSuspense(<PrivacyPage />)} />
          <Route path="/terms" element={withSuspense(<TermsPage />)} />

          <Route path="/research" element={withSuspense(<ResearchListPage />)} />
          <Route path="/research/:slug" element={withSuspense(<ResearchDetailPage />)} />
          <Route path="/publications/:slug" element={withSuspense(<PublicationDetailPage />)} />

          <Route path="/supervision" element={withSuspense(<SupervisionPage />)} />
          <Route path="/supervision/:slug" element={withSuspense(<SupervisionDetailPage />)} />
          <Route path="/discussions" element={withSuspense(<DiscussionsPage />)} />
          <Route path="/discussions/:slug" element={withSuspense(<DiscussionDetailPage />)} />

          <Route path="/projects" element={withSuspense(<ProjectsPage />)} />
          <Route path="/projects/:slug" element={withSuspense(<ProjectDetailPage />)} />
          <Route path="/courses" element={withSuspense(<CoursesPage />)} />

          <Route path="/scientific-map" element={withSuspense(<MapPage />)} />
          <Route path="/scientific-map/:slug" element={withSuspense(<AxisDetailPage />)} />
          <Route path="/search" element={withSuspense(<SearchPage />)} />
          <Route path="/calendar" element={withSuspense(<CalendarPage />)} />

          <Route path="/news" element={withSuspense(<NewsPage />)} />
          <Route path="/news/:slug" element={withSuspense(<NewsDetailPage />)} />
          <Route path="/insights" element={withSuspense(<InsightsPage />)} />
          <Route path="/insights/:slug" element={withSuspense(<InsightDetailPage />)} />

          <Route path="/contact" element={withSuspense(<ContactPage />)} />

          <Route path="/auth/sign-in" element={withSuspense(<SignInPage />)} />
          <Route path="/auth/sign-up" element={withSuspense(<SignUpPage />)} />
          <Route path="/auth/forgot-password" element={withSuspense(<ForgotPasswordPage />)} />

          <Route
            path="/account"
            element={
              <RequireAuth>
                {withSuspense(<AccountPage />)}
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                {withSuspense(<AdminLayout />)}
              </RequireAdmin>
            }
          >
            <Route index element={withSuspense(<AdminDashboardPage />)} />
            <Route path="profile" element={withSuspense(<AdminProfilePage />)} />
            <Route path=":entity" element={withSuspense(<AdminEntityListPage />)} />
            <Route path=":entity/new" element={withSuspense(<AdminEntityFormPage />)} />
            <Route path=":entity/:id/edit" element={withSuspense(<AdminEntityFormPage />)} />
            <Route path="inbox" element={withSuspense(<AdminInboxPage />)} />
            <Route path="users" element={withSuspense(<AdminUsersPage />)} />
            <Route path="media" element={withSuspense(<AdminMediaPage />)} />
            <Route path="settings" element={withSuspense(<AdminSettingsPage />)} />
          </Route>

          <Route path="*" element={withSuspense(<NotFoundPage />)} />
        </Route>
      </Routes>
    </>
  );
}
