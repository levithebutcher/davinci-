import React from 'react';
import { ExternalLink, FileCode, CheckCircle2 } from 'lucide-react';
import type { AssetResource } from '../../types/asset';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export interface AssetCardProps {
  asset: AssetResource;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  return (
    <Card
      variant="default"
      hoverable
      padding="none"
      className="asset-card-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top Media / Technical Header */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              padding: '0.35rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-hover)',
            }}
          >
            <FileCode size={14} />
          </div>

          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            {asset.fileFormat}
          </span>
        </div>

        <Badge variant="outline" size="sm">
          {asset.fileSize}
        </Badge>
      </div>

      {/* Main Asset Content */}
      <div
        style={{
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-primary)',
              fontWeight: 'var(--weight-semibold)',
            }}
          >
            {asset.category}
          </span>

          {asset.previewNote && (
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              {asset.previewNote}
            </span>
          )}
        </div>

        <h3
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-semibold)',
            marginBottom: '0.5rem',
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {asset.title}
        </h3>

        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: '1rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {asset.description}
        </p>

        {/* License & Attribution Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.25rem',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--status-beginner)',
          }}
        >
          <CheckCircle2 size={12} />
          <span>{asset.license}</span>
        </div>

        {/* Card Footer: Creator & Source Link */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                display: 'block',
              }}
            >
              Provided by
            </span>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
              }}
            >
              {asset.creator.name}
            </span>
          </div>

          <a
            href={asset.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
            className="asset-source-btn"
          >
            <span>Get Asset</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <style>{`
        .asset-card-wrapper {
          transition: transform var(--transition-fast), border-color var(--transition-fast);
        }
        .asset-card-wrapper:hover {
          transform: translateY(-3px);
          border-color: var(--border-strong) !important;
        }
        .asset-source-btn:hover {
          border-color: var(--accent-primary) !important;
          color: var(--accent-hover) !important;
        }
      `}</style>
    </Card>
  );
};
