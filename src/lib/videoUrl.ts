/**
 * Resolves a site-relative video path (e.g. `/videos/mnemonics/autoimmune/boardroom.mp4`) to the
 * URL the browser should fetch.
 *
 * In production set NEXT_PUBLIC_VIDEO_BASE_URL to the CDN origin that holds the videos
 * (e.g. https://videos.example.com) so large files never touch the app server. Locally it is
 * unset and the files are served from /public. Absolute URLs (YouTube, Vimeo, S3, ...) pass through.
 */
const BASE = (process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? '').replace(/\/+$/, '');

export function videoSrc(url: string): string {
  if (!url || /^(https?:)?\/\//i.test(url) || !url.startsWith('/videos/')) return url;
  return `${BASE}${url}`;
}
