import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  ArrowRight,
  Compass,
  Film,
  Sparkles,
  Sliders,
  Volume2,
  ShieldCheck,
  Layers,
  Award,
  BookOpen,
  Clock,
} from 'lucide-react';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CourseCard } from '../components/courses/CourseCard';
import { AssetCard } from '../components/assets/AssetCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { LEARNING_PATHS } from '../data/learningPaths';
import { courseService } from '../services/courseService';
import { assetService } from '../services/assetService';
import { progressService } from '../services/progressService';
import type { LastWatchedEntry } from '../services/progressService';
import { ResolveEditorMockup } from '../components/hero/ResolveEditorMockup';
import type { Course } from '../types/course';
import type { AssetResource } from '../types/asset';

export const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = React.useState<Course[]>([]);
  const [previewAssets, setPreviewAssets] = React.useState<AssetResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastWatched, setLastWatched] = React.useState<LastWatchedEntry | null>(null);

  React.useEffect(() => {
    document.title = 'Resolve Learn — Master DaVinci Resolve Free';

    // Load "Continue Watching" from localStorage (instant, no async)
    setLastWatched(progressService.getLastWatched());

    let isMounted = true;
    Promise.all([
      courseService.getFeaturedCourses(3),
      assetService.getAssets(),
    ])
      .then(([courses, assets]) => {
        if (isMounted) {
          setFeaturedCourses(courses);
          setPreviewAssets(assets.slice(0, 3));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const getPathIcon = (area: string) => {
    switch (area) {
      case 'Editing': return <Film size={18} />;
      case 'Color': return <Sliders size={18} />;
      case 'Fusion': return <Sparkles size={18} />;
      case 'Fairlight': return <Volume2 size={18} />;
      default: return <Compass size={18} />;
    }
  };

  return (
    <div className="home-page">
      {/* ====================================================================
          HERO SECTION — CINEMATIC DARK STUDIO
          ==================================================================== */}
      <section
        style={{
          position: 'relative',
          paddingTop: 'var(--space-20)',
          paddingBottom: 'var(--space-20)',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        {/* Subtle background studio ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse at top, rgba(229, 57, 53, 0.08) 0%, rgba(11, 11, 12, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container>
          <div
            style={{
              maxWidth: '860px',
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Status Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
              <span>100% Free • Open Learning Curriculum</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
                fontWeight: 'var(--weight-bold)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
                marginBottom: 'var(--space-6)',
                color: 'var(--text-primary)',
              }}
            >
              Learn DaVinci Resolve.<br />
              <span style={{ color: 'var(--text-secondary)' }}>Without the noise.</span>
            </h1>

            {/* Supporting Subtext */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
                color: 'var(--text-secondary)',
                maxWidth: '640px',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-8)',
              }}
            >
              A structured, completely free learning path built from the best resources available on the web. No subscription fees, no algorithmic rabbit holes.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: 'var(--space-16)',
              }}
            >
              <Button
                variant="primary"
                size="lg"
                to="/courses"
                icon={<Play size={16} fill="currentColor" />}
                iconPosition="left"
              >
                Start Learning
              </Button>
              <Button
                variant="secondary"
                size="lg"
                to="/courses"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Explore Courses
              </Button>
            </div>
          </div>

          {/* Realistic DaVinci Resolve Edit Page Mockup */}
          <ResolveEditorMockup />
        </Container>
      </section>

      {/* ====================================================================
          LEARNING PATHS SECTION
          ==================================================================== */}
      <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Container>
          <SectionHeader
            tagline="Structured Progression"
            title="Choose Your Learning Path"
            description="Clear, step-by-step roadmaps from fundamental editing to advanced node-based compositing and broadcast audio mastering."
            action={
              <Button variant="ghost" to="/courses" icon={<ArrowRight size={14} />}>
                View All Courses
              </Button>
            }
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {LEARNING_PATHS.map((path) => (
              <Card
                key={path.id}
                variant="default"
                hoverable
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.45rem',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-hover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getPathIcon(path.focusArea)}
                    </div>

                    <Badge variant="outline" size="sm">
                      {path.badgeText}
                    </Badge>
                  </div>

                  <h3
                    style={{
                      fontSize: 'var(--text-lg)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {path.title}
                  </h3>

                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-primary)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {path.tagline}
                  </div>

                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {path.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>{path.coursesCount} Courses • {path.estimatedHours}</span>
                  <Link
                    to={`/courses?filter=${path.slug}`}
                    style={{
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span>Start</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ====================================================================
          CONTINUE WATCHING BANNER (only shown if user has watch history)
          ==================================================================== */}
      {lastWatched && (
        <section
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 0',
          }}
        >
          <Container>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: '3px solid var(--accent-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(229, 57, 53, 0.12)',
                    border: '1px solid rgba(229, 57, 53, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Continue Watching
                  </div>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lastWatched.courseTitle}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Clock size={11} />
                    <span>
                      Last: {lastWatched.lessonTitle} • {lastWatched.completedCount}/{lastWatched.totalLessons} lessons done
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini progress bar + Resume button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                {lastWatched.totalLessons > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '4px',
                        backgroundColor: 'var(--bg-elevated)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.round((lastWatched.completedCount / lastWatched.totalLessons) * 100)}%`,
                          backgroundColor: 'var(--accent-primary)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-primary)',
                        fontWeight: 700,
                      }}
                    >
                      {Math.round((lastWatched.completedCount / lastWatched.totalLessons) * 100)}%
                    </span>
                  </div>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  to={`/courses/${lastWatched.courseSlug}?lesson=${lastWatched.lessonId}`}
                  icon={<Play size={13} fill="currentColor" />}
                  iconPosition="left"
                >
                  Resume
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ====================================================================
          FEATURED COURSES SECTION
          ==================================================================== */}
      <section
        className="section"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Container>
          <SectionHeader
            tagline="Curated Curriculum"
            title="Featured Courses"
            description="Hand-selected tutorials structured into modular courses, covering essential tools and professional industry workflows."
            action={
              <Button variant="secondary" to="/courses" icon={<ArrowRight size={14} />}>
                Browse All Courses
              </Button>
            }
          />

          <div className="grid-3">
            {loading
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} type="course" />)
              : featuredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>
        </Container>
      </section>

      {/* ====================================================================
          FREE ASSET LIBRARY PREVIEW SECTION
          ==================================================================== */}
      <section className="section" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Container>
          <SectionHeader
            tagline="Production Toolkit"
            title="Free Editing Resources & Assets"
            description="Enhance your edits with royalty-free 3D LUTs, editorial titles, 4K film overlays, and sound design kits."
            action={
              <Button variant="secondary" to="/assets" icon={<ArrowRight size={14} />}>
                Explore Asset Library
              </Button>
            }
          />

          <div className="grid-3">
            {loading
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} type="asset" />)
              : previewAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
          </div>
        </Container>
      </section>

      {/* ====================================================================
          PHILOSOPHY SECTION — LESS SEARCHING. MORE LEARNING.
          ==================================================================== */}
      <section
        className="section"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Container size="md">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
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
              The Core Philosophy
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
              Less searching. More learning.
            </h2>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to master DaVinci Resolve already exists publicly on the internet. The problem is finding the signal through the noise.
            </p>
          </div>

          <div className="grid-3">
            <Card variant="elevated" padding="md">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Layers size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.5rem' }}>
                Curated Step-by-Step Paths
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                No more wondering what tutorial to watch next. Follow chronological paths structured by experienced editors and colorists.
              </p>
            </Card>

            <Card variant="elevated" padding="md">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-beginner-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--status-beginner)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.5rem' }}>
                100% Free Forever
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                No paywalls, no monthly subscription gates, and no bait-and-switch upsells. High quality creative education should be open to all.
              </p>
            </Card>

            <Card variant="elevated" padding="md">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-intermediate-bg)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'var(--status-intermediate)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Award size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.5rem' }}>
                Full Creator Attribution
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Original creators receive full credit, links, and direct YouTube views. We support the community instructors who power this ecosystem.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* ====================================================================
          FINAL CTA SECTION
          ==================================================================== */}
      <section
        style={{
          paddingTop: 'var(--space-20)',
          paddingBottom: 'var(--space-20)',
          backgroundColor: 'var(--bg-primary)',
          textAlign: 'center',
        }}
      >
        <Container size="sm">
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Ready to master post-production?
          </h2>
          <p
            style={{
              fontSize: 'var(--text-md)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-8)',
              maxWidth: '520px',
              margin: '0 auto var(--space-8)',
            }}
          >
            Jump into our fundamentals course or pick a specialized domain like Color or Fusion.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              to="/courses"
              icon={<Play size={16} fill="currentColor" />}
              iconPosition="left"
            >
              Start Learning Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              to="/about"
            >
              Read Our Mission
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};
