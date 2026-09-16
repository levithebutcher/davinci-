import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { AssetsPage } from './pages/AssetsPage';
import { AboutPage } from './pages/AboutPage';
import { Button } from './components/common/Button';
import { Container } from './components/common/Container';

// Admin imports
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCourseDetailPage } from './pages/admin/AdminCourseDetailPage';
import { AdminAssetsPage } from './pages/admin/AdminAssetsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminCreatorsPage } from './pages/admin/AdminCreatorsPage';
import { AdminPlaceholderPage } from './pages/admin/AdminPlaceholderPage';

// Scroll to top helper on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Studio 404 Page
const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-20) 0',
        textAlign: 'center',
      }}
    >
      <Container size="sm">
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--accent-primary)',
            marginBottom: '1rem',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: '0.75rem' }}>
          Clip Not Found
        </h1>
        <p
          style={{
            fontSize: 'var(--text-md)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
          }}
        >
          The page or asset timeline you are trying to access does not exist or has moved.
        </p>
        <Button variant="primary" to="/">
          Return to Studio Home
        </Button>
      </Container>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="courses/:slug" element={<CourseDetailPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin CMS Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="courses/:courseId" element={<AdminCourseDetailPage />} />
              <Route path="assets" element={<AdminAssetsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="creators" element={<AdminCreatorsPage />} />
              <Route
                path="*"
                element={
                  <AdminPlaceholderPage
                    title="Section Not Found"
                    description="The requested admin section does not exist."
                  />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

