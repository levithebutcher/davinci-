import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Unable to Load Content',
  message = 'Something went wrong while loading this content. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`error-message-box ${className}`.trim()}
      style={{
        padding: 'var(--space-12) var(--space-6)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '560px',
        margin: 'var(--space-8) auto',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--accent-subtle)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-hover)',
          marginBottom: '1rem',
        }}
      >
        <AlertTriangle size={20} />
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: onRetry ? '1.5rem' : 0,
          maxWidth: '420px',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RotateCcw size={13} />}
          iconPosition="left"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
