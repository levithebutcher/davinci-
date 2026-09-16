import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  style,
  ...props
}) => {
  const paddingMap = {
    none: '0',
    sm: 'var(--space-4)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)',
  };

  const bgMap = {
    default: 'var(--bg-secondary)',
    elevated: 'var(--bg-elevated)',
    outlined: 'transparent',
  };

  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`.trim()}
      style={{
        backgroundColor: bgMap[variant],
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: paddingMap[padding],
        transition: 'border-color var(--transition-fast), transform var(--transition-fast), background-color var(--transition-fast)',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
