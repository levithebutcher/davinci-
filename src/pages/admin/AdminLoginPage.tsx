import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { user, isAdmin, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to redirect after login (default /admin)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  // If already authenticated as admin, redirect directly
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(trimmedEmail, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('[AdminLoginPage] Login error:', err);
      const msg = err?.message || 'Failed to authenticate. Please check your credentials.';
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        {/* Brand identity */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
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
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: '1px',
                }}
              />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Resolve Learn
            </span>
          </Link>

          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'rgba(229, 57, 53, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(229, 57, 53, 0.35)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              <Lock size={10} />
              ADMIN CONSOLE
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              marginTop: '0.85rem',
              marginBottom: '0.25rem',
            }}
          >
            Studio Sign In
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Restricted access for platform administrators
          </p>
        </div>

        {errorMsg && (
          <div className="admin-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@resolvelearn.com"
              disabled={isSubmitting}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="admin-input"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Enter Admin Area'}
          </Button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={12} />
            <span>Return to Resolve Learn</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

