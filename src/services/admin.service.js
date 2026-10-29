import { DEMO_AUTH } from '@/config/demo-auth';

const BASE_API_URL =
  process.env.NEXT_PUBLIC_MEMBERS_API_URL || 'http://localhost:5000/api/admin/members';
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
export const PROFILE_API_URL =
  process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:5000/api/admin/profile';


/**
 * Get active auth token from local storage or fallback to development token
 */
export function getAuthToken() {
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
 * Formats avatar URLs to always point to the full accessible URL
 */
export function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('data:')
  ) {
    return avatar;
  }
  return `${SERVER_URL}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
}

/**
 * Normalizes member records from the backend API into standard frontend shape
 */
export function normalizeMember(member) {
  if (!member) return null;
  const rawStatus = (member.status || 'pending').toString().toLowerCase();
  const status =
    rawStatus === 'approved'
      ? 'Approved'
      : rawStatus === 'rejected'
      ? 'Rejected'
      : 'Pending';

  const numericId = typeof member.id === 'number' ? member.id : Number(member.id) || member.id;

  return {
    ...member,
    id: numericId,
    membershipId: member.membershipId || `JBAD${150 + (Number(numericId) || 0)}`,
    name: member.name || member.fullName || '',
    fullName: member.name || member.fullName || '',
    business: member.business || member.businessName || '',
    businessName: member.business || member.businessName || '',
    mobile: member.mobile || member.phone || '',
    phone: member.mobile || member.phone || '',
    email: member.email || '',
    city: member.city || 'Ahmedabad',
    country: member.country || member.city || 'India',
    address: member.address || '',
    businessType: member.businessType || 'Retailer',
    dob: member.dob || member.dateOfBirth || '',
    dateOfBirth: member.dateOfBirth || member.dob || '',
    joinedOn: member.joinedOn || member.createdAt || '',
    avatar: getAvatarUrl(member.avatar || member.image || member.profilePhoto),
    image: getAvatarUrl(member.image || member.avatar || member.profilePhoto),
    profilePhoto: getAvatarUrl(member.profilePhoto || member.image || member.avatar),
    status,
    rawStatus,
    rejectionReason: member.rejectionReason || member.reason || '',
    createdAt: member.createdAt || '',
    updatedAt: member.updatedAt || '',
  };
}

/**
 * Fetch all members from the backend API with query filtering and fallback
 */
export async function getMembers(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  try {
    const url = new URL(BASE_API_URL);

    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    if (params.status && params.status !== 'All') {
      url.searchParams.set('status', params.status.toLowerCase());
    }
    if (params.search && params.search.trim()) {
      url.searchParams.set('search', params.search.trim());
    }

    const token = getAuthToken();
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data.data?.members)
        ? data.data.members
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.members)
        ? data.members
        : Array.isArray(data)
        ? data
        : [];

      const members = rawList.map(normalizeMember);
      const pagination = data.pagination || data.data?.pagination || {
        total: members.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(members.length / limit)),
        hasNext: false,
        hasPrev: page > 1,
      };
      const counts = data.counts || data.data?.counts || null;

      members.members = members;
      members.pagination = pagination;
      members.counts = counts;
      members.total = pagination.total ?? members.length;

      return members;
    }

    console.warn(`[admin.service] API responded with ${res.status}. Falling back to cached members.`);
  } catch (err) {
    console.error('[admin.service] Failed to fetch members from API:', err);
  }

  // Graceful fallback dummy members if API is temporarily unavailable
  const fallback = FALLBACK_MEMBERS.map(normalizeMember);
  fallback.members = fallback;
  fallback.pagination = {
    total: fallback.length,
    page: 1,
    limit: 20,
    totalPages: Math.max(1, Math.ceil(fallback.length / 20)),
    hasNext: false,
    hasPrev: false,
  };
  fallback.counts = {
    all: fallback.length,
    pending: fallback.filter((m) => m.status === 'Pending').length,
    approved: fallback.filter((m) => m.status === 'Approved').length,
    rejected: fallback.filter((m) => m.status === 'Rejected').length,
  };
  fallback.total = fallback.length;
  return fallback;
}

/**
 * Create a new member via POST http://localhost:5000/api/admin/members
 * Supports both FormData (with avatar file) and JSON
 */
export async function createMember(memberData) {
  const token = getAuthToken();

  // If a profile image file was selected, send as multipart/form-data
  if (memberData.profileImage instanceof File) {
    const formData = new FormData();
    formData.append('name', memberData.name || memberData.fullName);
    formData.append('business', memberData.business || memberData.businessName);
    formData.append('mobile', memberData.mobile);
    formData.append('email', memberData.email);
    formData.append('address', memberData.address || '');
    formData.append('city', memberData.city || 'Ahmedabad');
    formData.append('businessType', memberData.businessType || 'Retailer');
    formData.append('avatar', memberData.profileImage);

    const res = await fetch(BASE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to create member');
    }

    const json = await res.json();
    return normalizeMember(json.data || json);
  }

  // JSON payload
  const payload = {
    name: memberData.name || memberData.fullName,
    business: memberData.business || memberData.businessName,
    mobile: memberData.mobile,
    email: memberData.email,
    address: memberData.address || '',
    city: memberData.city || 'Ahmedabad',
    businessType: memberData.businessType || 'Retailer',
    avatar: memberData.avatar || null,
  };

  const res = await fetch(BASE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create member');
  }

  const json = await res.json();
  return normalizeMember(json.data || json);
}

/**
 * Update member approval status via PATCH http://localhost:5000/api/admin/members/:id/status
 */
export async function updateMemberStatus(id, status, reason = '') {
  const token = getAuthToken();
  const lowerStatus = status.toLowerCase();
  const url = `${BASE_API_URL}/${id}/status`;

  const payload = {
    status: lowerStatus,
    reason: reason || '',
    rejectionReason: reason || '',
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to update member status to ${status}`);
  }

  const json = await res.json();
  return normalizeMember(json.data || json);
}

/**
 * Update member details via PATCH http://localhost:5000/api/admin/members/:id
 * Supports both FormData (with avatar/image file) and JSON
 */
export async function updateMember(id, memberData) {
  const token = getAuthToken();
  const url = `${BASE_API_URL}/${id}`;

  const isFormData = typeof FormData !== 'undefined' && memberData instanceof FormData;

  if (isFormData) {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: memberData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update member');
    }

    const json = await res.json();
    return normalizeMember(json.data || json);
  }

  // If a profile image file was selected in an object
  if (
    memberData.profileImage instanceof File ||
    memberData.avatar instanceof File ||
    memberData.image instanceof File
  ) {
    const formData = new FormData();
    const file =
      memberData.profileImage instanceof File
        ? memberData.profileImage
        : memberData.avatar instanceof File
        ? memberData.avatar
        : memberData.image;

    formData.append('avatar', file);

    Object.entries(memberData).forEach(([key, val]) => {
      if (!['profileImage', 'avatar', 'image'].includes(key) && val !== undefined && val !== null) {
        if (key === 'status') {
          formData.append(key, val.toString().toLowerCase());
        } else {
          formData.append(key, val.toString());
        }
      }
    });

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to update member');
    }

    const json = await res.json();
    return normalizeMember(json.data || json);
  }

  // JSON payload
  const payload = { ...memberData };
  delete payload._id;

  if (payload.status) {
    payload.status = payload.status.toString().toLowerCase();
  }
  if (payload.reason !== undefined && payload.rejectionReason === undefined) {
    payload.rejectionReason = payload.reason;
  }
  if (payload.fullName && !payload.name) {
    payload.name = payload.fullName;
  }
  if (payload.businessName && !payload.business) {
    payload.business = payload.businessName;
  }
  if (payload.phone && !payload.mobile) {
    payload.mobile = payload.phone;
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update member');
  }

  const json = await res.json();
  return normalizeMember(json.data || json);
}

/**
 * Delete a member via DELETE http://localhost:5000/api/admin/members/:id
 */
export async function deleteMember(id) {
  const token = getAuthToken();
  const url = `${BASE_API_URL}/${id}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to delete member');
  }

  return await res.json();
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
  try {
    const res = await getMembers({ page: 1, limit: 5 });
    const members = Array.isArray(res) ? res : res.members || [];
    const counts = res.counts;
    return {
      total: counts?.all ?? members.length,
      approved: counts?.approved ?? members.filter((m) => m.status === 'Approved').length,
      pending: counts?.pending ?? members.filter((m) => m.status === 'Pending').length,
      rejected: counts?.rejected ?? members.filter((m) => m.status === 'Rejected').length,
      monthly: [42, 58, 49, 71, 66, 84, 77, 92],
      recent: members.slice(0, 5),
    };
  } catch {
    return {
      total: 7,
      approved: 6,
      pending: 1,
      rejected: 0,
      monthly: [42, 58, 49, 71, 66, 84, 77, 92],
      recent: [],
    };
  }
}

// Fallback sample data matching user's backend format
const FALLBACK_MEMBERS = [
  {
    id: 17,
    membershipId: 'JAA-MEM-1088',
    name: 'Yash Ranpura',
    business: 'Soni Diamond House',
    mobile: '9737126164',
    email: 'yashsoni@gmail.com',
    city: 'Ahmedabad',
    address: 'Maninagar, Ahmedabad',
    businessType: 'Jewelry Making',
    joinedOn: '26-10-2026',
    avatar: '/uploads/jaa-logo-1792992678372.png',
    status: 'approved',
    rejectionReason: 'not proper detailed',
  },
  {
    id: 16,
    membershipId: 'JAA-MEM-1088',
    name: 'Yash Soni',
    business: 'Soni Diamond House',
    mobile: '9737126164',
    email: 'yashsoni@gmail.com',
    city: 'Ahmedabad',
    address: 'Maninagar, Ahmedabad',
    businessType: 'Jewelry Making',
    joinedOn: '26-10-2026',
    avatar: '/uploads/jaa-logo-1792992671213.png',
    status: 'approved',
    rejectionReason: 'not proper detailed',
  },
  {
    id: 2,
    membershipId: 'JBAD152',
    name: 'yash soni',
    business: 'Mehta Jewels & Bullion',
    mobile: '9737126164',
    email: 'yashsoni3012@gmail.com',
    city: 'Ahmedabad',
    address: 'C 402 Hirabhai tower, Maninagar, Ahmedabad',
    businessType: 'Wholesaler',
    joinedOn: '21-10-2026',
    avatar: '/uploads/screenshot-2026-10-21-115244-1792587156090.png',
    status: 'pending',
    rejectionReason: '',
  },
];

export const MEMBERS = FALLBACK_MEMBERS.map(normalizeMember);

/**
 * Fetches the currently authenticated admin's profile
 * Endpoint: GET http://localhost:5000/api/admin/profile
 */
export async function fetchAdminProfile() {
  const token = getAuthToken();
  const res = await fetch(PROFILE_API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const errorMsg = data.message || 'Failed to fetch admin profile';
    throw new Error(errorMsg);
  }

  return data.data;
}

/**
 * Updates the currently authenticated admin's profile
 * Endpoint: PUT http://localhost:5000/api/admin/profile
 */
export async function updateAdminProfile(payload) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  const res = await fetch(PROFILE_API_URL, {
    method: 'PUT',
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

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const errorMsg =
      data.message ||
      (Array.isArray(data.errors) && data.errors[0]?.message) ||
      'Failed to update admin profile';
    throw new Error(errorMsg);
  }

  // Update stored session if present
  if (typeof window !== 'undefined') {
    try {
      const rawSession = window.localStorage.getItem('jaa_admin_session');
      if (rawSession) {
        const session = JSON.parse(rawSession);
        if (session?.user) {
          const userImg = data.data?.image || data.data?.profilePhoto || data.data?.avatar || session.user.image || session.user.avatar;
          session.user.name = data.data?.fullName || data.data?.name || session.user.name;
          session.user.image = userImg;
          session.user.avatar = userImg;
          window.localStorage.setItem('jaa_admin_session', JSON.stringify(session));
        }
      }
    } catch {}
  }

  return data.data;
}



