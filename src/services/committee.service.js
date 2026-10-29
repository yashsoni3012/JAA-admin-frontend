const COMMITTEE_API_URL =
  process.env.NEXT_PUBLIC_COMMITTEE_API_URL || 'http://localhost:5000/api/admin/committee';
const MEMBERS_API_URL =
  process.env.NEXT_PUBLIC_MEMBERS_API_URL || 'http://localhost:5000/api/admin/members';
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Retrieve auth token from storage with graceful fallback
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
 * Format media/avatar URLs to full accessible URL
 */
export function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Fetch all committee positions from backend API
 */
export async function getCommittees({ search = '', page = 1, limit = 50 } = {}) {
  const token = getAuthToken();
  const url = new URL(COMMITTEE_API_URL);

  if (search) url.searchParams.set('search', search);
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
    throw new Error(errorData.message || `Failed to fetch committees (${res.status})`);
  }

  const json = await res.json();
  return {
    committees: json.data || [],
    pagination: json.pagination || null,
  };
}

/**
 * Fetch member directory for assignment popup and card enrichment
 */
export async function getAllMembers() {
  const token = getAuthToken();
  try {
    const url = new URL(MEMBERS_API_URL);
    url.searchParams.set('limit', '500');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json.data || json.members || [];
  } catch (err) {
    console.warn('Failed to fetch members list:', err);
    return [];
  }
}

/**
 * Create a new committee position/role
 */
export async function createPosition(positionName) {
  const token = getAuthToken();
  const res = await fetch(COMMITTEE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      position: positionName.trim(),
      members: [],
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create position');
  }

  const json = await res.json();
  return json.data;
}

/**
 * Delete a committee position
 */
export async function deletePosition(positionId) {
  const token = getAuthToken();
  const res = await fetch(`${COMMITTEE_API_URL}/${positionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete position');
  }

  const json = await res.json();
  return json.data;
}

/**
 * Add / assign a member to a committee position
 */
export async function addMemberToPosition(positionId, existingMembers = [], newMemberId) {
  const token = getAuthToken();
  // Filter out duplicates and append new member
  const currentIds = existingMembers
    .map((m) => Number(m.memberId || m.id))
    .filter((id) => !isNaN(id) && id > 0);

  const updatedIds = Array.from(new Set([...currentIds, Number(newMemberId)]));

  const res = await fetch(`${COMMITTEE_API_URL}/${positionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      members: updatedIds.map((id) => ({ memberId: id })),
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add member to position');
  }

  const json = await res.json();
  return json.data;
}

/**
 * Remove a member from a committee position
 */
export async function removeMemberFromPosition(positionId, existingMembers = [], memberIdToRemove) {
  const token = getAuthToken();
  const updatedMembers = existingMembers
    .filter((m) => Number(m.memberId || m.id) !== Number(memberIdToRemove))
    .map((m) => ({ memberId: Number(m.memberId || m.id) }));

  const res = await fetch(`${COMMITTEE_API_URL}/${positionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      members: updatedMembers,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to remove member from position');
  }

  const json = await res.json();
  return json.data;
}

