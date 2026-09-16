import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  badge?: string;
}

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({
  title,
  description,
  badge = 'Coming in Step 4',
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '2rem auto',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        className="admin-badge admin-badge-amber"
        style={{ marginBottom: '0.85rem' }}
      >
        <span
          className="admin-badge-dot"
          style={{ backgroundColor: '#fbbf24' }}
        />
        {badge}
      </div>

      <h1
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
          maxWidth: '440px',
          margin: '0 auto 1.5rem',
        }}
      >
        {description}
      </p>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          textAlign: 'left',
          marginBottom: '1.75rem',
          lineHeight: 1.7,
        }}
      >
        <div style={{ color: 'var(--text-muted)' }}>
          // Implementation Plan:
        </div>
        <div style={{ color: '#34d399' }}>
          ✓ Admin authentication &amp; route guard active
        </div>
        <div style={{ color: '#34d399' }}>
          ✓ Database write security policies (RLS) active
        </div>
        <div style={{ color: '#fbbf24' }}>
          ⏳ Interactive CRUD editor interfaces scheduled for Step 4
        </div>
      </div>

      <Link
        to="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#ffffff',
          padding: '0.45rem 0.85rem',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={13} />
        <span>Back to Studio Overview</span>
      </Link>
    </div>
  );
};

