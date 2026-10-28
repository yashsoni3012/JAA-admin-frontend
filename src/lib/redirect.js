// Only allow redirects to internal admin paths. Blocks open redirects such as
// "https://evil.com" or "//evil.com" passed through the ?next= query param.
export function getSafeRedirect(path, fallback = '/admin/dashboard') {
  if (typeof path !== 'string') return fallback;
  if (!path.startsWith('/admin')) return fallback;
  if (path.startsWith('//') || path.includes('\\')) return fallback;
  return path;
}
