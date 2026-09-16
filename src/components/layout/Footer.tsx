import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../common/Container';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-12)',
        marginTop: 'auto',
      }}
    >
      <Container>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-12)',
          }}
          className="footer-grid"
        >
          {/* Brand & Manifesto Column */}
          <div style={{ maxWidth: '380px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
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
                    width: '6px',
                    height: '6px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '1px',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Resolve Learn
              </span>
            </div>

            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: '1.25rem',
              }}
            >
              A structured, free curriculum for mastering DaVinci Resolve. Built by editors, for editors, curating the best public educational material on the web.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.65rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-beginner)',
                  display: 'inline-block',
                }}
              />
              DaVinci Resolve 18 & 19 Ready
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Curriculum
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/courses" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/courses?filter=editing" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Editorial Craft
                </Link>
              </li>
              <li>
                <Link to="/courses?filter=color" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Color Grading
                </Link>
              </li>
              <li>
                <Link to="/courses?filter=fusion" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Fusion VFX
                </Link>
              </li>
              <li>
                <Link to="/courses?filter=fairlight" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Fairlight Audio
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Free Resources
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/assets?category=luts" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Film Print LUTs
                </Link>
              </li>
              <li>
                <Link to="/assets?category=templates" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Title Templates
                </Link>
              </li>
              <li>
                <Link to="/assets?category=sound-effects" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Whoosh & Foley SFX
                </Link>
              </li>
              <li>
                <Link to="/assets?category=overlays" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  35mm Film Grain
                </Link>
              </li>
              <li>
                <Link to="/assets" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Browse All Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Platform
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/about" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  About Resolve Learn
                </Link>
              </li>
              <li>
                <Link to="/about#attribution" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Creator Attribution
                </Link>
              </li>
              <li>
                <Link to="/about#philosophy" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }} className="footer-link">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <a
                  href="https://www.blackmagicdesign.com/products/davinciresolve"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
                  className="footer-link"
                >
                  Download DaVinci Resolve
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Creator Attribution Notice & Disclaimer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            <strong style={{ color: 'var(--text-secondary)' }}>Creator Attribution & Non-Affiliation:</strong> Resolve Learn is an independent community project and is not affiliated, endorsed, or sponsored by Blackmagic Design Pty. Ltd. DaVinci Resolve is a registered trademark of Blackmagic Design. All referenced instructional videos and assets remain the copyrighted property of their respective creators and are linked with full creator attribution.
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
            }}
          >
            <span>&copy; {new Date().getFullYear()} Resolve Learn. Free education for creative professionals.</span>
          </div>
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: var(--space-8) !important;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .footer-link:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </footer>
  );
};
