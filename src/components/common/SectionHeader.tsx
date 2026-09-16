import React from 'react';

export interface SectionHeaderProps {
  tagline?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  tagline,
  title,
  description,
  action,
  align = 'left',
  className = '',
}) => {
  return (
    <div
      className={`section-header ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: align === 'center' ? 'column' : 'row',
        alignItems: align === 'center' ? 'center' : 'flex-end',
        justifyContent: 'space-between',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-10)',
        textAlign: align,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ maxWidth: align === 'center' ? '720px' : '680px' }}>
        {tagline && (
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
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                display: 'inline-block',
              }}
            />
            {tagline}
          </div>
        )}
        <h2 style={{ marginBottom: description ? '0.65rem' : 0 }}>{title}</h2>
        {description && (
          <p
            style={{
              fontSize: 'var(--text-md)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div style={{ flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  );
};
