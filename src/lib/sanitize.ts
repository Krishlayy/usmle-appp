import DOMPurify from 'dompurify';

export const sanitizeHTML = (html: string) => {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['style', 'data-url', 'class', 'target', 'color', 'size', 'face'],
    ADD_TAGS: ['font'],
  });
};
