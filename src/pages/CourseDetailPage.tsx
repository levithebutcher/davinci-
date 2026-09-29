import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Container } from '../components/common/Container';
import { Button } from '../components/common/Button';
import { getCourseWithCurriculum } from '../services/courseService';
import type { CourseWithCurriculum, PublicLesson } from '../services/courseService';
import { progressService } from '../services/progressService';
import type { LastWatchedEntry } from '../services/progressService';
import { generateYouTubeEmbedUrl } from '../utils/youtube';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseWithCurriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active playing lesson
  const [activeLesson, setActiveLesson] = useState<PublicLesson | null>(null);

  // Completed lessons tracking
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Celebration modal — shows when course reaches 100%
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/courses');
      return;
    }
    loadCourse();
  }, [slug]);

  // Update dynamic document title for SEO
  useEffect(() => {
    if (course) {
      document.title = `${course.title} — Resolve Learn`;
    }
  }, [course]);

  const loadCourse = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCourseWithCurriculum(slug);
      if (!data) {
        setError('Course not found or currently in draft.');
        setLoading(false);
        return;
      }
      setCourse(data);

      // Load saved progress from localStorage
      const savedCompleted = progressService.getCompletedLessons(data.slug || slug);
      setCompletedLessons(savedCompleted);

      // Collect all lessons in sequential order
      const allLessons = data.modules.flatMap((m) => m.lessons);

      // Check if URL has ?lesson= parameter
      const requestedLessonId = searchParams.get('lesson');
      const foundLesson = allLessons.find((l) => l.id === requestedLessonId || l.slug === requestedLessonId);

      if (foundLesson) {
        setActiveLesson(foundLesson);
      } else if (allLessons.length > 0) {
        setActiveLesson(allLessons[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load course';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const allSequentialLessons: PublicLesson[] = course
    ? course.modules.flatMap((m) => m.lessons)
    : [];

  const activeIndex = activeLesson
    ? allSequentialLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;

  const handleSelectLesson = (lesson: PublicLesson) => {
    setActiveLesson(lesson);
    setSearchParams({ lesson: lesson.id });
    window.scrollTo({ top: 120, behavior: 'smooth' });

    // Save "Continue Watching" data to localStorage
    if (course && slug) {
      const allLessons = course.modules.flatMap((m) => m.lessons);
      const completed = progressService.getCompletedLessons(slug);
      const entry: LastWatchedEntry = {
        courseSlug: slug,
        courseTitle: course.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        completedCount: completed.length,
        totalLessons: allLessons.length,
        updatedAt: new Date().toISOString(),
      };
      progressService.saveLastWatched(entry);
    }
  };

  const handleNextLesson = () => {
    if (activeIndex >= 0 && activeIndex < allSequentialLessons.length - 1) {
      handleSelectLesson(allSequentialLessons[activeIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (activeIndex > 0) {
      handleSelectLesson(allSequentialLessons[activeIndex - 1]);
    }
  };

  const handleToggleCompleted = (lessonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!slug) return;
    const updated = progressService.toggleLesson(slug, lessonId);
    setCompletedLessons(updated);
  };

  const handleMarkCompleteAndContinue = () => {
    if (!activeLesson || !slug) return;
    const updated = progressService.markCompleted(slug, activeLesson.id);
    setCompletedLessons(updated);

    // Check if all lessons are now completed → show celebration
    if (updated.length >= allSequentialLessons.length && allSequentialLessons.length > 0) {
      setShowCelebration(true);
      return; // Don't auto-advance — let user dismiss the modal
    }

    if (activeIndex >= 0 && activeIndex < allSequentialLessons.length - 1) {
      handleSelectLesson(allSequentialLessons[activeIndex + 1]);
    }
  };

  const completedCount = allSequentialLessons.filter((l) => completedLessons.includes(l.id)).length;
  const progressPercentage = allSequentialLessons.length > 0
    ? Math.round((completedCount / allSequentialLessons.length) * 100)
    : 0;
  const isCurrentCompleted = activeLesson ? completedLessons.includes(activeLesson.id) : false;

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'editing': return '#38BDF8';
      case 'color': return '#F59E0B';
      case 'fusion': return '#A855F7';
      case 'fairlight': return '#10B981';
      default: return 'var(--accent-primary)';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="animate-spin" />
          <span>Loading DaVinci Resolve Masterclass...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
        <Container size="sm">
          <AlertCircle size={36} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Course Unavailable</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'This course could not be found.'}</p>
          <Button variant="primary" to="/courses">
            Browse Available Courses
          </Button>
        </Container>
      </div>
    );
  }

  const domainColor = getDomainColor(course.domain);

  return (
    <div className="course-watch-page" style={{ paddingBottom: 'var(--space-20)' }}>
      {/* Top Breadcrumb & Metadata Bar */}
      <section
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem 0',
        }}
      >
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Link
                to="/courses"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
                className="hover:text-white"
              >
                <ArrowLeft size={14} />
                All Courses
              </Link>
              <span style={{ color: 'var(--border-strong)' }}>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{course.title}</span>
            </div>

            {/* Quick Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(229, 57, 53, 0.12)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(229, 57, 53, 0.3)',
                }}
              >
                {course.level}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: domainColor,
                  border: '1px solid var(--border-subtle)',
                  textTransform: 'uppercase',
                }}
              >
                {course.domain}
              </span>
              {course.creator.channelUrl ? (
                <a
                  href={course.creator.channelUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)',
                  }}
                >
                  <span>Instructor: <strong>{course.creator.name}</strong></span>
                  <ExternalLink size={11} />
                </a>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Instructor: <strong>{course.creator.name}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Student Course Progress Bar */}
          <div
            style={{
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: progressPercentage === 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(229, 57, 53, 0.15)',
                  color: progressPercentage === 100 ? '#10B981' : 'var(--accent-primary)',
                }}
              >
                <CheckCircle2 size={13} />
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Your Progress: <strong style={{ color: '#ffffff' }}>{completedCount}</strong> of <strong style={{ color: '#ffffff' }}>{allSequentialLessons.length}</strong> lessons completed
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: progressPercentage === 100 ? '#10B981' : 'var(--accent-primary)',
                  fontWeight: 700,
                }}
              >
                {progressPercentage}%
              </span>
            </div>

            {/* Visual Progress Track */}
            <div
              style={{
                flex: '1',
                minWidth: '160px',
                maxWidth: '320px',
                height: '6px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  backgroundColor: progressPercentage === 100 ? '#10B981' : 'var(--accent-primary)',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Main Cinema Workspace: Player on Left/Center, Curriculum on Right */}
      <section style={{ paddingTop: '1.75rem' }}>
        <Container>
          <div className="course-player-grid">
            {/* Left Column: Video Player & Lesson Notes */}
            <div>
              {/* 16:9 Cinema Player Stage */}
              <div
                style={{
                  backgroundColor: '#000000',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  width: '100%',
                }}
              >
                {activeLesson?.youtube_video_id ? (
                  <iframe
                    src={generateYouTubeEmbedUrl(activeLesson.youtube_video_id)}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'var(--text-muted)',
                      gap: '0.75rem',
                    }}
                  >
                    <Video size={36} />
                    <span style={{ fontSize: '0.875rem' }}>No video assigned for this lesson</span>
                  </div>
                )}
              </div>

              {/* Player Bottom Control & Next/Prev Bar */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderTop: 'none',
                  borderBottomLeftRadius: 'var(--radius-md)',
                  borderBottomRightRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Previous Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={activeIndex <= 0}
                  onClick={handlePrevLesson}
                  icon={<ChevronLeft size={15} />}
                  iconPosition="left"
                  style={{ opacity: activeIndex <= 0 ? 0.35 : 1 }}
                >
                  Previous Lesson
                </Button>

                {/* Middle: Lesson Counter & Mark as Complete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Lesson</span>
                    <strong style={{ color: '#ffffff' }}>{activeIndex + 1}</strong>
                    <span>of</span>
                    <strong style={{ color: '#ffffff' }}>{allSequentialLessons.length}</strong>
                  </div>

                  {activeLesson && (
                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(activeLesson.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isCurrentCompleted ? '1px solid #10B98166' : '1px solid var(--border-subtle)',
                        backgroundColor: isCurrentCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-elevated)',
                        color: isCurrentCompleted ? '#10B981' : 'var(--text-secondary)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{isCurrentCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
                    </button>
                  )}
                </div>

                {/* Next Button */}
                <Button
                  variant="primary"
                  size="sm"
                  disabled={activeIndex >= allSequentialLessons.length - 1}
                  onClick={handleNextLesson}
                  icon={<ChevronRight size={15} />}
                  iconPosition="right"
                  style={{ opacity: activeIndex >= allSequentialLessons.length - 1 ? 0.35 : 1 }}
                >
                  Next Lesson
                </Button>
              </div>

              {/* Active Lesson Details Card */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Now Playing • Lesson {activeIndex + 1}
                    </span>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                      {activeLesson?.title || 'Lesson Overview'}
                    </h1>
                  </div>

                  {activeLesson?.duration_minutes && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Clock size={12} />
                      {activeLesson.duration_minutes} Minutes
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: '0 0 1rem 0',
                  }}
                >
                  {activeLesson?.description || course.description}
                </p>

                {/* Action Row inside Lesson Details Card */}
                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <Button
                    variant={isCurrentCompleted ? 'ghost' : 'secondary'}
                    size="sm"
                    onClick={handleMarkCompleteAndContinue}
                    icon={<CheckCircle2 size={14} style={{ color: isCurrentCompleted ? '#10B981' : 'inherit' }} />}
                  >
                    {isCurrentCompleted ? 'Completed ✓ (Next Lesson →)' : 'Mark as Complete & Next →'}
                  </Button>

                  {activeLesson?.youtube_video_id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Credit: <strong>{course.creator.name}</strong>
                      </span>
                      <a
                        href={`https://www.youtube.com/watch?v=${activeLesson.youtube_video_id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: '#f87171',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <span>YouTube</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Learning Objectives */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>
                  About This Masterclass
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                  {course.description}
                </p>

                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  Key Topics Covered
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {course.topics.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sequential Curriculum Sidebar */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  position: 'sticky',
                  top: '1.5rem',
                }}
              >
                {/* Sidebar Header */}
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      Course Curriculum
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#ffffff' }}>
                      {allSequentialLessons.length} Sequential Lessons
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {course.duration}
                    </span>
                  </div>
                </div>

                {/* Modules & Lessons Accordion List */}
                <div style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  {course.modules.map((mod, modIdx) => (
                    <div key={mod.id} style={{ borderBottom: modIdx === course.modules.length - 1 ? 'none' : '1px solid var(--border-subtle)' }}>
                      {/* Module Title */}
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderBottom: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            color: 'var(--accent-primary)',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            backgroundColor: 'rgba(229, 57, 53, 0.1)',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          M{modIdx + 1}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#ffffff' }}>
                          {mod.title}
                        </span>
                      </div>

                      {/* Lessons in Module */}
                      <div>
                        {mod.lessons.map((lesson) => {
                          const isCurrent = activeLesson?.id === lesson.id;
                          const lessonGlobalIndex = allSequentialLessons.findIndex((l) => l.id === lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson)}
                              style={{
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                                backgroundColor: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                                borderLeft: isCurrent ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                transition: 'all var(--transition-fast)',
                              }}
                              className="lesson-sidebar-item"
                            >
                              {/* Icon indicator */}
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: isCurrent ? 'rgba(229, 57, 53, 0.2)' : 'var(--bg-primary)',
                                  border: `1px solid ${isCurrent ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)',
                                  flexShrink: 0,
                                }}
                              >
                                {isCurrent ? (
                                  <Play size={10} fill="currentColor" />
                                ) : (
                                  <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)' }}>
                                    {lessonGlobalIndex + 1}
                                  </span>
                                )}
                              </div>

                              {/* Lesson Title & Duration */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '0.8125rem',
                                    fontWeight: isCurrent ? 600 : 500,
                                    color: isCurrent ? '#ffffff' : (completedLessons.includes(lesson.id) ? 'var(--text-secondary)' : '#e4e4e7'),
                                    lineHeight: 1.35,
                                    marginBottom: '0.2rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {lesson.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                  {lesson.duration_minutes ? (
                                    <span>{lesson.duration_minutes} min</span>
                                  ) : (
                                    <span>Video</span>
                                  )}
                                  {isCurrent && (
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>• Now Playing</span>
                                  )}
                                  {completedLessons.includes(lesson.id) && !isCurrent && (
                                    <span style={{ color: '#10B981', fontWeight: 500 }}>• Completed</span>
                                  )}
                                </div>
                              </div>

                              {/* Checkmark Completion Button */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleCompleted(lesson.id, e)}
                                title={completedLessons.includes(lesson.id) ? 'Click to mark incomplete' : 'Click to mark complete'}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.35rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: completedLessons.includes(lesson.id) ? '#10B981' : 'var(--text-muted)',
                                  borderRadius: 'var(--radius-xs)',
                                  transition: 'all var(--transition-fast)',
                                  flexShrink: 0,
                                }}
                              >
                                {completedLessons.includes(lesson.id) ? (
                                  <CheckCircle2 size={16} />
                                ) : (
                                  <Circle size={15} style={{ opacity: 0.35 }} />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Course Completion Celebration Modal ─────────────────────────── */}
      {showCelebration && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setShowCelebration(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(16, 185, 129, 0.15)',
              position: 'relative',
            }}
          >
            {/* Green glow ring */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <CheckCircle2 size={34} style={{ color: '#10B981' }} />
            </div>

            <div
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: '#10B981',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Course Complete
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '0.75rem',
              }}
            >
              You&apos;ve mastered{' '}
              <span style={{ color: '#10B981' }}>{course?.title}</span>!
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              Congratulations! You finished all {allSequentialLessons.length} lessons. Your skills in DaVinci Resolve are leveling up. Keep the momentum going!
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                to="/courses"
                icon={<Play size={14} fill="currentColor" />}
                iconPosition="left"
              >
                Explore More Courses
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCelebration(false)}
              >
                Continue Reviewing
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .course-player-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.75rem;
          align-items: flex-start;
        }
        @media (max-width: 980px) {
          .course-player-grid {
            grid-template-columns: 1fr;
          }
          .curriculum-sidebar-sticky {
            position: static !important;
          }
        }
        @media (max-width: 640px) {
          .course-player-grid {
            gap: 1rem;
          }
        }
        .lesson-sidebar-item:hover {
          background-color: var(--bg-surface) !important;
        }
      `}</style>
    </div>
  );
};
