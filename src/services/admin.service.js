import { DEMO_AUTH } from '@/config/demo-auth';
import { resolveApiUrl } from '@/lib/api-resolver';

const BASE_API_URL =
  process.env.NEXT_PUBLIC_MEMBERS_API_URL || 'http://localhost:5000/api/admin/members';
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
export const PROFILE_API_URL =
  process.env.NEXT_PUBLIC_PROFILE_API_URL || 'http://localhost:5000/api/admin/profile';


/**
 * In cookie-based authentication, the browser automatically sends HTTP-only cookies
 */
export function getAuthToken() {
  return '';
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
    return resolveApiUrl(avatar);
  }
  return resolveApiUrl(`${SERVER_URL}${avatar.startsWith('/') ? '' : '/'}${avatar}`);
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
  const membershipId = member.membershipId || `JBAD${150 + (Number(numericId) || 0)}`;

  const idCardData = member.idCard || {};
  const idCard = {
    cardNumber: idCardData.cardNumber || membershipId,
    status: idCardData.status || (rawStatus === 'approved' ? 'active' : rawStatus),
    issuedAt: idCardData.issuedAt || member.joinedOn || '28-10-2026',
    validUntil: idCardData.validUntil || null,
    qrCode: idCardData.qrCode || `https://yourdomain.com/verify/${membershipId}`,
  };

  return {
    ...member,
    id: numericId,
    membershipId,
    name: member.name || member.fullName || '',
    fullName: member.name || member.fullName || '',
    business: member.business || member.businessName || '',
    businessName: member.business || member.businessName || '',
    mobile: member.mobile || member.phone || '',
    phone: member.mobile || member.phone || '',
    email: member.email || '',
    city: member.city || 'Ahmedabad',
    country: member.country || 'India',
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
    isActive: member.isActive !== undefined ? Boolean(member.isActive) : (rawStatus === 'approved' || rawStatus === 'active'),
    rejectionReason: member.rejectionReason || member.reason || '',
    idCard,
    createdAt: member.createdAt || '',
    updatedAt: member.updatedAt || '',
  };
}

/**
 * Fetch a single member by ID from the backend API
 * Endpoint: GET http://localhost:5000/api/admin/members/:id
 */
export async function getMemberById(id) {
  if (!id) return null;
  try {
    const token = getAuthToken();
    const res = await fetch(`${BASE_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return normalizeMember(data.data);
      }
    }
  } catch (err) {
    console.warn(`[admin.service] Failed to fetch member #${id}:`, err.message);
  }
  return null;
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

    if (params.isActive !== undefined && params.isActive !== 'all' && params.isActive !== '') {
      url.searchParams.set('isActive', params.isActive.toString());
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
      const rawPagination = data.pagination || data.data?.pagination || {};
      const total =
        rawPagination.total_items !== undefined
          ? rawPagination.total_items
          : rawPagination.total !== undefined
          ? rawPagination.total
          : rawPagination.totalCount !== undefined
          ? rawPagination.totalCount
          : members.length;

      const totalPages =
        rawPagination.total_page !== undefined
          ? rawPagination.total_page
          : rawPagination.totalPages !== undefined
          ? rawPagination.totalPages
          : Math.max(1, Math.ceil(total / limit));

      const currentPage =
        rawPagination.current_page !== undefined
          ? rawPagination.current_page
          : rawPagination.page !== undefined
          ? rawPagination.page
          : page;

      const itemPerPage =
        rawPagination.item_per_page !== undefined
          ? rawPagination.item_per_page
          : rawPagination.limit !== undefined
          ? rawPagination.limit
          : limit;

      const hasNext = Boolean(
        rawPagination.has_more !== undefined
          ? rawPagination.has_more
          : rawPagination.hasNext !== undefined
          ? rawPagination.hasNext
          : currentPage < totalPages
      );

      const hasPrev = Boolean(
        rawPagination.has_prev !== undefined
          ? rawPagination.has_prev
          : rawPagination.hasPrev !== undefined
          ? rawPagination.hasPrev
          : currentPage > 1
      );

      const pagination = {
        total,
        total_items: total,
        totalPages,
        total_page: totalPages,
        page: currentPage,
        current_page: currentPage,
        limit: itemPerPage,
        item_per_page: itemPerPage,
        hasNext,
        hasPrev,
        has_more: hasNext,
      };
      const counts = data.counts || data.data?.counts || null;

      members.members = members;
      members.pagination = pagination;
      members.counts = counts;
      members.total = total;

      return members;
    }

    console.warn(`[admin.service] API responded with ${res.status}. Falling back to cached members.`);
  } catch (err) {
    console.warn('[admin.service] Failed to fetch members from API:', err.message);
  }

  // Graceful fallback dummy members if API is temporarily unavailable
  const fallback = FALLBACK_MEMBERS.map(normalizeMember);
  fallback.members = fallback;
  fallback.pagination = {
    total: fallback.length,
    total_items: fallback.length,
    page: 1,
    current_page: 1,
    limit: 20,
    item_per_page: 20,
    totalPages: Math.max(1, Math.ceil(fallback.length / 20)),
    total_page: Math.max(1, Math.ceil(fallback.length / 20)),
    hasNext: false,
    has_more: false,
    hasPrev: false,
    has_prev: false,
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
    if (memberData.password) {
      formData.append('password', memberData.password);
      formData.append('confirmPassword', memberData.confirmPassword || memberData.password);
    }
    formData.append('address', memberData.address || '');
    formData.append('city', memberData.city || 'Ahmedabad');
    formData.append('businessType', memberData.businessType || 'Retailer');
    if (memberData.isActive !== undefined) {
      formData.append('isActive', Boolean(memberData.isActive).toString());
    }
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
      const errorMsg =
        errData.message ||
        (Array.isArray(errData.errors) && errData.errors[0]?.message) ||
        'Failed to create member';
      throw new Error(errorMsg);
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
    password: memberData.password,
    confirmPassword: memberData.confirmPassword || memberData.password,
    address: memberData.address || '',
    city: memberData.city || 'Ahmedabad',
    businessType: memberData.businessType || 'Retailer',
    isActive: memberData.isActive !== undefined ? Boolean(memberData.isActive) : true,
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
      const rawSession = window.localStorage.getItem('jaa_admin_user');
      if (rawSession) {
        const session = JSON.parse(rawSession);
        if (session?.user) {
          const userImg = data.data?.image || data.data?.profilePhoto || data.data?.avatar || session.user.image || session.user.avatar;
          session.user.name = data.data?.fullName || data.data?.name || session.user.name;
          session.user.image = userImg;
          session.user.avatar = userImg;
          window.localStorage.setItem('jaa_admin_user', JSON.stringify(session));
        }
      }
    } catch {}
  }

  return data.data;
}





/**
 * Bulk import members via POST http://localhost:5000/api/admin/members/bulk
 * @param {Array<Object>} members
 */
export async function bulkImportMembers(members) {
  const token = getAuthToken();
  const url = `${BASE_API_URL}/bulk`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ members }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to import members');
  }

  const result = await res.json();
  return result;
}

/**
 * Toggle member active/inactive status
 */
export async function toggleMemberActive(id, isActive) {
  return await updateMember(id, { isActive: Boolean(isActive) });
}
