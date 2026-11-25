/**
 * Resolves a site-relative video path (e.g. `/videos/mnemonics/autoimmune/boardroom.mp4`) to the
 * URL the browser should fetch.
 *
 * In production set NEXT_PUBLIC_VIDEO_BASE_URL to the CDN origin that holds the videos.
 * Defaults to Vercel Blob CDN, with Cloudflare R2 as secondary fallback CDN.
 */
const PRIMARY_CDN = (
  process.env.NEXT_PUBLIC_VIDEO_BASE_URL ||
  'https://eoks9aa4ko9a9zbl.public.blob.vercel-storage.com'
).replace(/\/+$/, '');

const SECONDARY_CDN = 'https://pub-c41d355e448b44148957890140c7165a.r2.dev';

/**
 * Returns primary CDN source (Vercel Blob or configured NEXT_PUBLIC_VIDEO_BASE_URL).
 */
export function videoSrc(url: string): string {
  if (!url) return '';
  const normalized = url.replace(/\.mov($|\?)/i, '.mp4$1');
  if (/^(https?:)?\/\//i.test(normalized) || !normalized.startsWith('/videos/')) return normalized;
  return `${PRIMARY_CDN}${normalized}`;
}

/**
 * Returns secondary fallback CDN source (Cloudflare R2).
 */
export function fallbackVideoSrc(url: string): string {
  if (!url) return '';
  const normalized = url.replace(/\.mov($|\?)/i, '.mp4$1');
  if (/^(https?:)?\/\//i.test(normalized) || !normalized.startsWith('/videos/')) return normalized;
  return `${SECONDARY_CDN}${normalized}`;
}

/**
 * Returns local fallback path on the origin server.
 */
export function localVideoSrc(url: string): string {
  if (!url) return '';
  const normalized = url.replace(/\.mov($|\?)/i, '.mp4$1');
  if (normalized.includes('/videos/')) {
    const idx = normalized.indexOf('/videos/');
    return normalized.substring(idx);
  }
  return normalized;
}
