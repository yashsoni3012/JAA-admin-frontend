const LEADS_API_URL =
  process.env.NEXT_PUBLIC_LEADS_API_URL || 'http://localhost:5000/api/admin/leads';
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * Retrieve auth token from storage with graceful fallback
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
 * Clean & accessible URL for lead images
 */
export function getLeadImageUrl(image) {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image;
  }
  return `${SERVER_URL}${image.startsWith('/') ? '' : '/'}${image}`;
}

/**
 * Formats date to readable string matching design: "12 May 2026"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes lead data model from API
 */
export function normalizeLead(lead) {
  if (!lead) return null;
  const numId = typeof lead.id === 'number' ? lead.id : Number(lead.id) || lead._id;

  const member = lead.member || {};

  return {
    id: numId,
    memberId: lead.memberId || member.id || null,
    title: lead.title || 'Untitled Lead',
    source: lead.source || 'WhatsApp',
    description: lead.description || '',
    image: getLeadImageUrl(lead.image),
    rawImage: lead.image || null,
    status: (lead.status || 'ACTIVE').toUpperCase(),
    createdAt: lead.createdAt || '',
    updatedAt: lead.updatedAt || '',
    displayDate: formatDisplayDate(lead.createdAt),
    member: {
      id: member.id || lead.memberId || null,
      membershipId: member.membershipId || '',
      name: member.name || lead.title || 'Member',
      business: member.business || member.businessName || '-',
      mobile: member.mobile || member.phone || '-',
      email: member.email || '-',
      city: member.city || '-',
      address: member.address || '-',
      businessType: member.businessType || 'B2C',
      avatar: getLeadImageUrl(member.avatar),
      gstNumber: member.gst || member.gstNumber || '',
      pincode: member.pincode || '',
    },
  };
}

/**
 * Fetch a single lead by ID
 * Endpoint: GET http://localhost:5000/api/admin/leads/:id
 */
export async function getLeadById(id) {
  if (!id) return null;
  const token = getAuthToken();
  const res = await fetch(`${LEADS_API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch lead details (status ${res.status})`);
  }

  const json = await res.json();
  const leadData = json.data?.lead || json.data || json.lead || json;
  if (!leadData) {
    throw new Error(json.message || 'Failed to fetch lead details');
  }

  return normalizeLead(leadData);
}

/**
 * Fetch leads list from API
 * Endpoint: GET http://localhost:5000/api/admin/leads
 */
export async function getLeads(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const search = params.search || '';

  const url = new URL(LEADS_API_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (search) {
    url.searchParams.set('search', search);
  }

  const token = getAuthToken();
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leads list (status ${res.status})`);
  }

  const json = await res.json();
  const payload = json.data || {};
  const rawLeads = Array.isArray(payload.leads)
    ? payload.leads
    : Array.isArray(payload)
    ? payload
    : Array.isArray(json.leads)
    ? json.leads
    : [];

  // Map leads directly from list API response without extra per-lead network requests
  const leads = rawLeads.map((item) => normalizeLead(item));

  const pagination = payload.pagination || json.pagination || {
    total: leads.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(leads.length / limit)),
    hasNext: false,
    hasPrev: page > 1,
  };

  return {
    leads,
    pagination: {
      total: pagination.total ?? pagination.total_items ?? leads.length,
      page: pagination.page ?? pagination.current_page ?? page,
      limit: pagination.limit ?? pagination.item_per_page ?? limit,
      totalPages:
        pagination.totalPages ??
        pagination.total_page ??
        Math.max(1, Math.ceil((pagination.total ?? leads.length) / limit)),
      hasNext: Boolean(pagination.hasNext || pagination.has_more),
      hasPrev: Boolean(pagination.hasPrev || page > 1),
    },
  };
}

/**
 * Delete a lead
 * Endpoint: DELETE http://localhost:5000/api/admin/leads/:id
 */
export async function deleteLead(id) {
  if (!id) return false;
  const token = getAuthToken();
  const res = await fetch(`${LEADS_API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete lead');
  }

  return true;
}

