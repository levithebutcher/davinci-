import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'beginner' | 'intermediate' | 'advanced' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'sm',
  children,
  icon,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    },
    neutral: {
      backgroundColor: '#1C1D20',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
    },
    accent: {
      backgroundColor: 'var(--accent-subtle)',
      color: 'var(--accent-hover)',
      border: '1px solid var(--border-accent)',
    },
    beginner: {
      backgroundColor: 'var(--status-beginner-bg)',
      color: 'var(--status-beginner)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
    },
    intermediate: {
      backgroundColor: 'var(--status-intermediate-bg)',
      color: 'var(--status-intermediate)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
    },
    advanced: {
      backgroundColor: 'var(--status-advanced-bg)',
      color: 'var(--status-advanced)',
      border: '1px solid rgba(168, 85, 247, 0.25)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-subtle)',
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '0.15rem 0.5rem',
      fontSize: 'var(--text-xs)',
      gap: '0.35rem',
    },
    md: {
      padding: '0.25rem 0.65rem',
      fontSize: 'var(--text-sm)',
      gap: '0.45rem',
    },
  };

  return (
    <span
      className={`badge badge-${variant} ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 'var(--weight-medium)',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </span>
  );
};
