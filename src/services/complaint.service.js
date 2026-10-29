const COMPLAINTS_API_URL =
  process.env.NEXT_PUBLIC_COMPLAINTS_API_URL || 'http://localhost:5000/api/admin/complaints';
const MEMBERS_API_URL =
  process.env.NEXT_PUBLIC_MEMBERS_API_URL || 'http://localhost:5000/api/admin/members';
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Retrieve auth token from storage with fallback for development
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
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Format Complaint ID or Object to CMP-2026-XXX
 */
export function formatComplaintCode(itemOrId) {
  if (!itemOrId && itemOrId !== 0) return 'CMP-2026-001';
  if (typeof itemOrId === 'object') {
    if (itemOrId.complaintNumber) return itemOrId.complaintNumber;
    return formatComplaintCode(itemOrId.complaintId ?? itemOrId.id);
  }
  const str = String(itemOrId).trim();
  if (str.startsWith('CMP-')) return str;
  const num = parseInt(str, 10);
  if (isNaN(num)) return `CMP-2026-${str}`;
  return `CMP-2026-${String(num).padStart(3, '0')}`;
}

/**
 * Format Currency Amount
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') return '₹ 0';
  const num = typeof amount === 'number' ? amount : Number(String(amount).replace(/[^0-9.-]+/g, '')) || 0;
  return `₹ ${num.toLocaleString('en-IN')}`;
}

/**
 * Check if a person or entity object is an associated member
 */
export function isMemberEntity(entity) {
  if (!entity || typeof entity !== 'object') return false;
  if (entity.membershipId && String(entity.membershipId).trim() !== '') {
    return true;
  }
  if (
    entity.memberId !== null &&
    entity.memberId !== undefined &&
    entity.memberId !== '' &&
    Number(entity.memberId) > 0
  ) {
    return true;
  }
  if (entity.memberObjectId && String(entity.memberObjectId).trim() !== '' && entity.memberObjectId !== 'null') {
    return true;
  }
  if (entity._id && String(entity._id).trim() !== '' && entity._id !== 'null') {
    return true;
  }
  if (entity.id && String(entity.id).trim() !== '' && entity.id !== 'null' && Number(entity.id) > 0) {
    return true;
  }
  return false;
}

/**
 * Check if a complaint target is an associated member vs outside non-member
 */
export function isComplaintAgainstMember(complaint) {
  if (!complaint) return false;
  const againstType = String(complaint.complaintAgainst || '').trim().toLowerCase();

  // If explicitly other / non-member / outside
  if (againstType === 'other' || againstType === 'non-member' || againstType === 'outside') {
    return false;
  }

  // If againstPerson is present and no targetMember is present
  if (complaint.againstPerson && !complaint.targetMember) {
    return false;
  }

  const target = complaint.targetMember || complaint.member;
  if (!target) return false;

  return isMemberEntity(target);
}

/**
 * Fetch Complaints list from backend
 */
export async function getComplaints({
  search = '',
  status = '',
  priority = '',
  page = 1,
  limit = 10,
} = {}) {
  const token = getAuthToken();
  const url = new URL(COMPLAINTS_API_URL);

  if (search) url.searchParams.set('search', search);
  if (status && status !== 'All' && status !== 'ALL') url.searchParams.set('status', status);
  if (priority && priority !== 'All' && priority !== 'ALL') url.searchParams.set('priority', priority);
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
    throw new Error(errorData.message || `Failed to fetch complaints (${res.status})`);
  }

  const json = await res.json();
  return {
    complaints: json.data || [],
    pagination: json.pagination || {
      total: json.data?.length || 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    summary: json.summary || {
      totalComplaints: json.data?.length || 0,
      againstMember: 0,
      againstOther: 0,
    },
  };
}

/**
 * Fetch single Complaint details by ID
 */
export async function getComplaintById(complaintId) {
  const token = getAuthToken();
  let idToCall = complaintId;
  if (typeof complaintId === 'object' && complaintId !== null) {
    idToCall = complaintId.complaintId ?? complaintId.id ?? complaintId.complaintNumber;
  }
  const cleanId = String(idToCall).replace(/^CMP-2026-0*/i, '') || idToCall;

  let res = await fetch(`${COMPLAINTS_API_URL}/${cleanId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  // If numeric cleanId fails and idToCall was different (e.g. original code CMP-2026-003), fallback
  if (!res.ok && String(cleanId) !== String(idToCall)) {
    try {
      const fallbackRes = await fetch(`${COMPLAINTS_API_URL}/${idToCall}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      if (fallbackRes.ok) {
        res = fallbackRes;
      }
    } catch {
      // Ignore fallback error
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch complaint details (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch Members list for data lookup/enrichment
 */
export async function getMembers() {
  const token = getAuthToken();
  try {
    const res = await fetch(MEMBERS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch members list:', err);
    return [];
  }
}

/**
 * Update Complaint status
 */
export async function updateComplaintStatus(complaintId, { status, resolutionNotes = '' }) {
  const token = getAuthToken();
  let idToCall = complaintId;
  if (typeof complaintId === 'object' && complaintId !== null) {
    idToCall = complaintId.complaintId ?? complaintId.id ?? complaintId.complaintNumber;
  }
  const cleanId = String(idToCall).replace(/^CMP-2026-0*/i, '') || idToCall;

  const res = await fetch(`${COMPLAINTS_API_URL}/${cleanId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, resolutionNotes }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update complaint status (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

