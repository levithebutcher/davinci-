import React from 'react';
import { Card } from './Card';

interface SkeletonCardProps {
  type?: 'course' | 'asset';
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'course' }) => {
  return (
    <Card
      variant="default"
      padding="none"
      style={{
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="skeleton-card"
    >
      {/* Top Banner Skeleton */}
      <div
        style={{
          height: type === 'course' ? '140px' : '52px',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="skeleton-shimmer"
      />

      {/* Body Skeleton */}
      <div
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            height: '12px',
            width: '35%',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xs)',
          }}
          className="skeleton-shimmer"
        />

        <div
          style={{
            height: '22px',
            width: '80%',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-xs)',
          }}
          className="skeleton-shimmer"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div
            style={{
              height: '12px',
              width: '100%',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xs)',
            }}
            className="skeleton-shimmer"
          />
          <div
            style={{
              height: '12px',
              width: '65%',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xs)',
            }}
            className="skeleton-shimmer"
          />
        </div>

        {/* Footer Skeleton */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              height: '14px',
              width: '40%',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xs)',
            }}
            className="skeleton-shimmer"
          />
          <div
            style={{
              height: '14px',
              width: '20%',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xs)',
            }}
            className="skeleton-shimmer"
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.4;
          }
        }
        .skeleton-shimmer {
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
};
