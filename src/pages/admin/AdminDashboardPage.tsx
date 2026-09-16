import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, type DashboardStats, type RecentActivityItem } from '../../services/dashboardService';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Video,
  FolderArchive,
  Layers,
  Users,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
      ]);
      setStats(s);
      setRecentActivity(a);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div>
      {/* Top Welcome Banner */}
      <div className="admin-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div className="admin-badge admin-badge-green" style={{ marginBottom: '0.45rem' }}>
              <span className="admin-badge-dot" style={{ backgroundColor: '#10b981' }} />
              STUDIO CMS ACTIVE
            </div>
            <h1 className="admin-banner-title">
              Studio Control Center
            </h1>
            <p className="admin-banner-desc">
              Welcome back, <strong style={{ color: '#ffffff' }}>{user?.email}</strong>. Manage your curriculum, lessons, assets, and creators in real-time with Supabase cloud database.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="admin-icon-btn"
              title="Refresh metrics"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link to="/admin/courses">
              <Button variant="primary" size="sm" icon={<Plus size={14} />} iconPosition="left">
                Manage Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Database Metrics Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="admin-sidebar-section-title" style={{ paddingLeft: 0, marginBottom: '0.6rem' }}>
          Live Platform Records
        </div>

        <div className="admin-stats-grid">
          {/* Courses Card */}
          <div className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="admin-stat-label">Courses</span>
              <BookOpen size={14} color="var(--text-muted)" />
            </div>
            <div className="admin-stat-value">
              {loading ? '—' : stats?.totalCourses ?? 0}
            </div>
            <div className="admin-stat-sub" style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#34d399' }}>{stats?.publishedCourses ?? 0} published</span>
              <span>•</span>
              <span style={{ color: '#fbbf24' }}>{stats?.draftCourses ?? 0} drafts</span>
            </div>
          </div>

          {/* Lessons Card */}
          <div className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="admin-stat-label">Lessons</span>
              <Video size={14} color="var(--text-muted)" />
            </div>
            <div className="admin-stat-value">
              {loading ? '—' : stats?.totalLessons ?? 0}
            </div>
            <div className="admin-stat-sub" style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: '#34d399' }}>{stats?.publishedLessons ?? 0} published</span>
              <span>•</span>
              <span style={{ color: '#fbbf24' }}>{stats?.draftLessons ?? 0} drafts</span>
            </div>
          </div>

          {/* Assets Card */}
          <div className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="admin-stat-label">Assets</span>
              <FolderArchive size={14} color="var(--text-muted)" />
            </div>
            <div className="admin-stat-value">
              {loading ? '—' : stats?.totalAssets ?? 0}
            </div>
            <div className="admin-stat-sub">
              LUTs, SFX &amp; Plugins
            </div>
          </div>

          {/* Categories & Creators Card */}
          <div className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="admin-stat-label">Taxonomy &amp; Authors</span>
              <Layers size={14} color="var(--text-muted)" />
            </div>
            <div className="admin-stat-value">
              {loading ? '—' : (stats?.totalCategories ?? 0) + (stats?.totalCreators ?? 0)}
            </div>
            <div className="admin-stat-sub" style={{ display: 'flex', gap: '0.5rem' }}>
              <span>{stats?.totalCategories ?? 0} categories</span>
              <span>•</span>
              <span>{stats?.totalCreators ?? 0} creators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Quick Actions & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Activity Card */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Recent Updates
            </h3>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              LATEST 6
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No recent changes found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentActivity.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.link}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                  className="admin-nav-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor:
                          item.type === 'course'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : item.type === 'lesson'
                            ? 'rgba(168, 85, 247, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          item.type === 'course'
                            ? '#60a5fa'
                            : item.type === 'lesson'
                            ? '#c084fc'
                            : '#fbbf24',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {item.type}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '220px',
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <ExternalLink size={12} color="var(--text-muted)" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="admin-card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Content Management Hub
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link
              to="/admin/courses"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
              className="admin-stat-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen size={18} color="var(--accent-primary)" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                    Courses &amp; Curriculum
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Add courses, structure modules, and arrange lessons
                  </div>
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>→</span>
            </Link>

            <Link
              to="/admin/assets"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
              }}
              className="admin-stat-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FolderArchive size={18} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                    Post-Production Assets
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Manage free LUTs, transitions, macros, and SFX
                  </div>
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>→</span>
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <Link
                to="/admin/categories"
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                }}
                className="admin-stat-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                  <Layers size={14} color="#a78bfa" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>Categories</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Manage editorial tracks
                </div>
              </Link>

              <Link
                to="/admin/creators"
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                }}
                className="admin-stat-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                  <Users size={14} color="#f472b6" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>Creators</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Manage instructors &amp; links
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


