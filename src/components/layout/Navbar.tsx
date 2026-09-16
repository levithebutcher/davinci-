import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Play, ShieldCheck } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Track scroll for subtle border elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Courses', to: '/courses' },
    { label: 'Assets', to: '/assets' },
    { label: 'About', to: '/about' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: scrolled ? 'rgba(11, 11, 12, 0.92)' : 'rgba(11, 11, 12, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-subtle)' : 'rgba(42, 43, 46, 0.4)'}`,
        transition: 'all var(--transition-normal)',
      }}
    >
      <Container>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4.25rem',
          }}
        >
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
            }}
            aria-label="Resolve Learn Home"
          >
            {/* Cinematic Minimalist Brand Mark */}
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
                position: 'relative',
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

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--weight-bold)',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Resolve
              </span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-regular)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Learn
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
            aria-label="Main Navigation"
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  position: 'relative',
                  padding: '0.5rem 0',
                })}
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: 'var(--accent-primary)',
                          borderRadius: '1px',
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
            className="desktop-nav"
          >
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(229, 57, 53, 0.12)',
                  border: '1px solid rgba(229, 57, 53, 0.35)',
                  color: 'var(--accent-hover)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}
              >
                <ShieldCheck size={13} />
                <span>Admin Studio</span>
              </Link>
            )}

            <Button
              variant="primary"
              size="sm"
              to="/courses"
              icon={<Play size={13} fill="currentColor" />}
              iconPosition="left"
            >
              Start Learning
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{
              display: 'none',
              padding: '0.5rem',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-primary)',
            padding: '1.5rem var(--container-pad-x)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
          className="mobile-menu"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                })}
              >
                <span>{link.label}</span>
                <ArrowRight size={16} />
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(229, 57, 53, 0.1)',
                  border: '1px solid rgba(229, 57, 53, 0.3)',
                  color: 'var(--accent-hover)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-medium)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} />
                  <span>Admin Studio</span>
                </div>
                <ArrowRight size={16} />
              </NavLink>
            )}
          </div>

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Button
              variant="primary"
              size="md"
              to="/courses"
              fullWidth
              icon={<Play size={14} fill="currentColor" />}
              iconPosition="left"
            >
              Start Learning
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
