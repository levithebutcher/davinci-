import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Play } from 'lucide-react';
import type { Course } from '../../types/course';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface CourseCardProps {
  course: Course;
  onSelect?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'editing': return '#38BDF8';
      case 'color': return '#F59E0B';
      case 'fusion': return '#A855F7';
      case 'fairlight': return '#10B981';
      default: return 'var(--accent-primary)';
    }
  };

  const domainColor = getDomainColor(course.domain);

  return (
    <Link
      to={`/courses/${course.slug}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Card
        variant="default"
        hoverable
        padding="none"
        className="course-card-wrapper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        {/* Cinematic Abstract Course Banner */}
        <div
          style={{
            height: '140px',
            backgroundColor: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1rem',
            overflow: 'hidden',
          }}
        >
          {/* Real Thumbnail Background if available */}
          {course.thumbnailUrl && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${course.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.35,
                filter: 'brightness(0.7)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Subtle grid pattern background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

        {/* Abstract timeline / scope / waveform visual cue */}
        <div
          style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            opacity: 0.08,
            fontFamily: 'var(--font-mono)',
            fontSize: '4.5rem',
            fontWeight: 800,
            lineHeight: 1,
            color: domainColor,
            userSelect: 'none',
            textTransform: 'uppercase',
          }}
        >
          {course.domain}
        </div>

        {/* Top Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(11, 11, 12, 0.75)',
                backdropFilter: 'blur(4px)',
                border: `1px solid ${domainColor}44`,
                color: domainColor,
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: domainColor,
                }}
              />
              {course.domain}
            </span>

            <Badge variant={course.level} size="sm">
              {course.level}
            </Badge>
          </div>

          {course.featured && (
            <Badge variant="accent" size="sm">
              Curated Pick
            </Badge>
          )}
        </div>

        {/* Banner Bottom Cues: Timecode & Duration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={12} />
            <span>{course.lessonsCount} lessons</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            marginBottom: '0.5rem',
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {course.title}
        </h3>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: '1.25rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.description}
        </p>

        {/* Topic tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginBottom: '1.25rem',
          }}
        >
          {course.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-elevated)',
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              #{topic}
            </span>
          ))}
          {course.topics.length > 3 && (
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                padding: '0.15rem 0.35rem',
              }}
            >
              +{course.topics.length - 3} more
            </span>
          )}
        </div>

        {/* Footer info: Creator Attribution & Action */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              Curated Creator
            </span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
              }}
            >
              {course.creator.name}
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-hover)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            <span>Watch Course</span>
            <Play size={10} fill="currentColor" />
          </div>
        </div>
      </div>

      <style>{`
        .course-card-wrapper {
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .course-card-wrapper:hover {
          transform: translateY(-3px);
          border-color: var(--border-strong) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </Card>
    </Link>
  );
};
