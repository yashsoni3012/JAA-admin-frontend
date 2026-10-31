const POSTS_API_URL =
  process.env.NEXT_PUBLIC_POSTS_API_URL || 'http://localhost:5000/api/admin/posts';
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Retrieve auth token from storage with graceful development fallback
 */
function getAuthToken() {
  if (typeof window === 'undefined') return 'mock-jwt-token-JAA-admin';
  try {
    const directToken =
      window.localStorage.getItem('token') ||
      window.localStorage.getItem('jwt') ||
      window.localStorage.getItem('accessToken');
    if (directToken) return directToken;

    const sessionRaw =
      window.localStorage.getItem('jaa_admin_session') ||
      window.localStorage.getItem('jaa_demo_session');
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed?.token) return parsed.token;
    }
    return 'mock-jwt-token-JAA-admin';
  } catch {
    return 'mock-jwt-token-JAA-admin';
  }
}

/**
 * Normalize Media and Avatar URLs
 */
export function getMediaUrl(url) {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Detect post type: Photo, Video, or Notice
 */
export function detectPostType(post) {
  if (!post) return 'Photo';

  // Check explicit type if passed
  if (post.type) {
    const t = String(post.type).toLowerCase();
    if (t.includes('video')) return 'Video';
    if (t.includes('notice') || t.includes('pdf') || t.includes('doc')) return 'Notice';
    return 'Photo';
  }

  // Check media array
  const mediaList = Array.isArray(post.media) ? post.media : [];
  for (const item of mediaList) {
    const fileType = (typeof item === 'object' ? item.fileType || '' : '').toLowerCase();
    const url = (typeof item === 'object' ? item.url || '' : String(item || '')).toLowerCase();

    if (fileType.startsWith('video/') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.endsWith('.mkv')) {
      return 'Video';
    }
    if (fileType.includes('pdf') || url.endsWith('.pdf') || fileType.includes('document')) {
      return 'Notice';
    }
  }

  // Check title or description heuristics
  const title = (post.title || '').toLowerCase();
  if (title.includes('notice') || title.includes('circular') || title.includes('agm') || title.includes('meeting')) {
    return 'Notice';
  }
  if (title.includes('video') || title.includes('highlights') || title.includes('clip')) {
    return 'Video';
  }

  return 'Photo';
}

/**
 * Fetch all posts with filters & pagination
 */
export async function getPosts({
  search = '',
  mediaType = '',
  status = '',
  page = 1,
  limit = 10,
} = {}) {
  const token = getAuthToken();
  const url = new URL(POSTS_API_URL);

  if (search) url.searchParams.set('search', search);
  if (mediaType && mediaType !== 'all' && mediaType !== 'All' && mediaType !== 'ALL') {
    url.searchParams.set('mediaType', mediaType);
  }
  if (status && status !== 'all' && status !== 'All' && status !== 'ALL') {
    url.searchParams.set('status', status);
  }
  if (page) url.searchParams.set('page', page);
  if (limit) url.searchParams.set('limit', limit);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch posts (${res.status})`);
  }

  const json = await res.json();
  return {
    posts: json.data || [],
    pagination: json.pagination || {
      total: json.data?.length || 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(postId) {
  const token = getAuthToken();
  const cleanId = String(postId).trim();
  const res = await fetch(`${POSTS_API_URL}/${cleanId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch post #${postId}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Create a new post (supports multipart/form-data for file upload or JSON)
 */
export async function createPost(payload) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

  const res = await fetch(POSTS_API_URL, {
    method: 'POST',
    headers: isFormData
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
    body: isFormData ? payload : JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create post');
  }

  const json = await res.json();
  return json.data;
}

/**
 * Delete a post by ID
 */
export async function deletePost(postId) {
  const token = getAuthToken();
  const cleanId = String(postId).trim();
  const res = await fetch(`${POSTS_API_URL}/${cleanId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete post');
  }

  const json = await res.json();
  return json.data;
}

