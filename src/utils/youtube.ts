/**
 * Extracts an 11-character YouTube video ID from various URL formats or raw ID.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://youtube.com/shorts/dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw 11-character ID)
 */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-character ID (standard YouTube ID pattern)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Check with regex for common youtube URL patterns
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // If parsing fails, return null
  }

  return null;
}

/**
 * Generates privacy-friendly YouTube embed URL
 */
export function generateYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}
