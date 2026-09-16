import React from 'react';
import { Container } from '../components/common/Container';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heart, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  React.useEffect(() => {
    document.title = 'About & Manifesto — Resolve Learn';
  }, []);

  return (
    <div className="about-page" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Header */}
      <div
        style={{
          paddingTop: 'var(--space-16)',
          paddingBottom: 'var(--space-12)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <Container size="md">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Project Manifesto
          </div>

          <h1 style={{ marginBottom: '1rem' }}>About Resolve Learn</h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            DaVinci Resolve is the most capable free post-production software on earth. Our goal is to make learning it just as accessible, structured, and friction-free.
          </p>
        </Container>
      </div>

      <Container size="md" style={{ paddingTop: 'var(--space-12)' }}>
        {/* Core Narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {/* Section 1: The Problem & Origin */}
          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: '1rem' }}>
              Why this platform exists
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: 'var(--text-base)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              <p>
                There are thousands of brilliant free DaVinci Resolve tutorials on YouTube, created by generous colorists, VFX artists, and editors. However, for a beginner or self-directed learner, the experience can be overwhelming:
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingLeft: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-primary)', marginTop: '0.2rem' }}>—</span>
                  <span>Which video should you watch first?</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-primary)', marginTop: '0.2rem' }}>—</span>
                  <span>How do you know if a tutorial is teaching modern color management or outdated methods?</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-primary)', marginTop: '0.2rem' }}>—</span>
                  <span>How do you bridge the gap between watching a 10-minute tip and mastering a complete project workflow?</span>
                </li>
              </ul>
              <p>
                <strong>Resolve Learn</strong> eliminates this cognitive fatigue. Instead of scouring YouTube search results and algorithmic recommendation rabbit holes, learners follow clear, curated pathways designed to build genuine skills.
              </p>
            </div>
          </section>

          {/* Section 2: Three Core Pillars */}
          <section>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: '1.25rem' }}>
              Our Core Principles
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card variant="elevated" padding="md">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent-hover)',
                      flexShrink: 0,
                    }}
                  >
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.35rem' }}>
                      1. Structured Curriculums, Not Random Videos
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      Every module is sequenced logically. You start with project setup and timeline assembly, then advance into color science, node compositing, and audio dynamics.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--status-beginner)',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.35rem' }}>
                      2. Always 100% Free
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      Blackmagic Design revolutionized post-production by offering DaVinci Resolve free to anyone with a computer. We believe creative education should follow the exact same democratization.
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md" id="attribution">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--status-intermediate)',
                      flexShrink: 0,
                    }}
                  >
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.35rem' }}>
                      3. Uncompromising Creator Attribution
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      Original creators spend days producing stellar instructional material. We never re-host, scrape, or conceal video origin. All lessons embed or link directly to the creator’s original YouTube uploads with prominent attribution and channel links.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Section 3: Non-Affiliation Disclaimer */}
          <section
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Legal & Trademark Notice
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
              Resolve Learn is an independent open educational guide created by video editors. DaVinci Resolve, Blackmagic, Fusion, and Fairlight are trademarks of Blackmagic Design Pty. Ltd. This website is neither affiliated with nor endorsed by Blackmagic Design.
            </p>
          </section>

          {/* Section 4: Action */}
          <div
            style={{
              textAlign: 'center',
              paddingTop: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
              Start your journey into professional post-production.
            </p>
            <Button
              variant="primary"
              size="lg"
              to="/courses"
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              Explore the Courses
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};
