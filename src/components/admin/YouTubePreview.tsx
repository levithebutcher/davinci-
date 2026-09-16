import React from 'react';
import { generateYouTubeEmbedUrl } from '../../utils/youtube';
import { Play, VideoOff } from 'lucide-react';

interface YouTubePreviewProps {
  videoId: string | null | undefined;
  title?: string;
}

export const YouTubePreview: React.FC<YouTubePreviewProps> = ({ videoId, title = 'Lesson Video' }) => {
  if (!videoId) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: 'var(--bg-primary)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          gap: '0.5rem',
          padding: '1rem',
        }}
      >
        <VideoOff size={24} />
        <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>
          No YouTube video assigned yet
        </span>
      </div>
    );
  }

  const embedUrl = generateYouTubeEmbedUrl(videoId);

  return (
    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: '#000000',
        }}
      >
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
      <div
        style={{
          padding: '0.4rem 0.65rem',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Play size={10} color="#10b981" />
          <span>ID: {videoId}</span>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
        >
          Open in YouTube ↗
        </a>
      </div>
    </div>
  );
};
