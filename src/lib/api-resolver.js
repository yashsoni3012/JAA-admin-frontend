/**
 * API URL Resolver & Cookie-based Fetch Interceptor
 * Allows seamless data fetching from BOTH:
 * - http://localhost:5000/api/admin
 * - http://192.168.1.26:5000/api/admin
 *
 * Automatically detects when accessed via IP in the browser (e.g. mobile/laptop on LAN)
 * and ensures requests to localhost:5000 resolve to the active host's IP port 5000.
 *
 * Also automatically attaches `credentials: 'include'` to every fetch request
 * so that HTTP-only authentication cookies are sent seamlessly to the backend.
 */

export function resolveApiUrl(url) {
  if (!url || typeof url !== 'string') return url;

  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname;

    // When accessing via network IP (e.g. 192.168.1.26), adapt localhost/127.0.0.1 to current host IP
    if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      return url
        .replace(/:\/\/localhost:5000/g, `://${currentHost}:5000`)
        .replace(/:\/\/127\.0\.0\.1:5000/g, `://${currentHost}:5000`);
    }
  }

  return url;
}

/**
 * Initializes global client-side fetch interception so that:
 * 1. URLs are dynamically resolved (localhost <-> network IP).
 * 2. Every fetch call automatically includes credentials (cookies) with `credentials: 'include'`.
 * 3. Empty or null Authorization headers are stripped to rely purely on HTTP-only cookies.
 */
export function initApiInterceptor() {
  if (typeof window === 'undefined') return;
  if (window.__jaa_api_interceptor_init) return;
  window.__jaa_api_interceptor_init = true;

  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    // Ensure init object exists
    init = init ? { ...init } : {};

    // Automatically send HTTP-only cookies with every request
    if (!init.credentials) {
      init.credentials = 'include';
    }

    // Strip out null or undefined Authorization headers so backend purely uses Cookie
    if (init.headers) {
      if (typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        const auth = init.headers['Authorization'] || init.headers['authorization'];
        if (auth && (auth === 'Bearer null' || auth === 'Bearer undefined' || auth === 'Bearer ')) {
          delete init.headers['Authorization'];
          delete init.headers['authorization'];
        }
      } else if (init.headers instanceof Headers) {
        const auth = init.headers.get('Authorization');
        if (auth && (auth === 'Bearer null' || auth === 'Bearer undefined' || auth === 'Bearer ')) {
          init.headers.delete('Authorization');
        }
      }
    }

    try {
      if (typeof input === 'string') {
        input = resolveApiUrl(input);
      } else if (input instanceof Request) {
        const resolved = resolveApiUrl(input.url);
        if (resolved !== input.url) {
          input = new Request(resolved, {
            ...input,
            credentials: input.credentials || 'include',
          });
        }
      }
    } catch {
      // Fallback cleanly to original input if URL transformation errors
    }

    return originalFetch.call(this, input, init);
  };
}
