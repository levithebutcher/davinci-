import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, BookOpen, FolderArchive, Tags, Users, LogOut, ExternalLink, Menu, X } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/admin',
      end: true,
      icon: <LayoutDashboard size={16} />,
    },
    {
      name: 'Courses',
      path: '/admin/courses',
      end: false,
      icon: <BookOpen size={16} />,
    },
    {
      name: 'Assets',
      path: '/admin/assets',
      end: false,
      icon: <FolderArchive size={16} />,
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      end: false,
      icon: <Tags size={16} />,
    },
    {
      name: 'Creators',
      path: '/admin/creators',
      end: false,
      icon: <Users size={16} />,
    },
  ];

  return (
    <div className="admin-shell">
      {/* Top Header */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            className="admin-mobile-toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: '1px',
                }}
              />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Resolve Learn
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(229, 57, 53, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(229, 57, 53, 0.35)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                marginLeft: '0.25rem',
                fontWeight: 600,
              }}
            >
              STUDIO ADMIN
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
            title="Open Live Public Site"
          >
            <ExternalLink size={13} />
            <span>Public Site</span>
          </Link>

          <div
            style={{
              width: '1px',
              height: '16px',
              backgroundColor: 'var(--border-subtle)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span
              style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#f87171',
              backgroundColor: 'transparent',
              border: '1px solid rgba(229, 57, 53, 0.35)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Body: Sidebar + Main */}
      <div className="admin-body">
        <aside className="admin-sidebar">
          <div>
            <div className="admin-sidebar-section-title">Navigation</div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="admin-sidebar-footer-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#fbbf24',
                }}
              />
              Step 3 Active
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.71875rem' }}>
              Admin shell &amp; secure RLS active. Course/Asset editors arriving in Step 4.
            </div>
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="admin-main">
          <div className="admin-container">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

