import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  to?: string;
  href?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'right',
  to,
  href,
  fullWidth = false,
  className = '',
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 'var(--weight-medium)',
    fontFamily: 'var(--font-sans)',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '0.45rem 0.85rem',
      fontSize: 'var(--text-xs)',
      letterSpacing: '0.01em',
    },
    md: {
      padding: '0.65rem 1.25rem',
      fontSize: 'var(--text-sm)',
      letterSpacing: '0.01em',
    },
    lg: {
      padding: '0.85rem 1.75rem',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-semibold)',
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: '#ffffff',
      border: '1px solid transparent',
      boxShadow: '0 2px 8px rgba(229, 57, 53, 0.25)',
    },
    secondary: {
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
    },
  };

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && <span style={{ display: 'flex' }}>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span style={{ display: 'flex' }}>{icon}</span>}
    </>
  );

  const hoverClass = `btn-${variant}`;

  if (to) {
    return (
      <Link
        to={to}
        style={combinedStyles}
        className={`btn ${hoverClass} ${className}`.trim()}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={combinedStyles}
        className={`btn ${hoverClass} ${className}`.trim()}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      style={combinedStyles}
      className={`btn ${hoverClass} ${className}`.trim()}
      {...props}
    >
      {content}
    </button>
  );
};
