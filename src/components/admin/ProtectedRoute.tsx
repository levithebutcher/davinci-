import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  // 1. Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }}
        />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Verifying security credentials...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Unauthenticated -> redirect to /admin/login
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but NOT an authorized admin -> 403 Forbidden
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(229, 57, 53, 0.12)',
              border: '1px solid rgba(229, 57, 53, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              margin: '0 auto 1.25rem',
            }}
          >
            <ShieldAlert size={24} />
          </div>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.5rem',
            }}
          >
            403 — Access Denied
          </h1>

          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '1.25rem',
            }}
          >
            Your account (<strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{user.email}</strong>) is signed in but does not have administrator clearance.
          </p>

          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              textAlign: 'left',
              marginBottom: '1.5rem',
            }}
          >
            Assigned Role: <span style={{ color: '#fbbf24' }}>student</span> (admin required)
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
            <Button
              variant="primary"
              size="sm"
              to="/"
              style={{ flex: 1 }}
            >
              Return to Site
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated & Authorized Admin
  return children ? <>{children}</> : <Outlet />;
};

