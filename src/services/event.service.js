const EVENTS_API_URL =
  process.env.NEXT_PUBLIC_EVENTS_API_URL || 'http://localhost:5000/api/admin/events';
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
 * Clean & accessible URL for event thumbnail images
 */
export function getEventImageUrl(image) {
  if (!image) {
    return `${SERVER_URL}/uploads/events/workshop.jpg`;
  }
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image;
  }
  return `${SERVER_URL}${image.startsWith('/') ? '' : '/'}${image}`;
}

/**
 * Formats date into readable string, e.g. "2026-07-27" -> "27 July 2026"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const trimmed = String(dateStr).trim();
    const parts = trimmed.split(/[-/]/);
    if (parts.length === 3) {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(monthIdx) && months[monthIdx]) {
          return `${day} ${months[monthIdx]} ${year}`;
        }
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        if (!isNaN(monthIdx) && months[monthIdx]) {
          return `${day} ${months[monthIdx]} ${year}`;
        }
      }
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return trimmed;
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes event items from API into consistent frontend model
 */
export function normalizeEvent(item) {
  if (!item) return null;
  const numId = typeof item.id === 'number' ? item.id : Number(item.id) || item._id;

  return {
    ...item,
    id: numId,
    _id: item._id,
    title: item.title || item.name || 'Untitled Event',
    name: item.title || item.name || 'Untitled Event',
    image: getEventImageUrl(item.image),
    rawImage: item.image || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    displayStartDate: formatDisplayDate(item.startDate),
    displayEndDate: formatDisplayDate(item.endDate),
    startTime: item.startTime || '10:00 AM',
    endTime: item.endTime || '07:00 PM',
    city: item.city || 'Ahmedabad',
    address: item.address || 'The Exhibition Center, Science City Road, Ahmedabad, Gujarat - 380009',
    postedBy: item.postedBy || 'Admin',
    description: item.description || '',
    isActive: Boolean(item.isActive),
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
  };
}

export const FALLBACK_EVENTS = [
  {
    id: 1,
    title: 'Workshop on Gold Purity',
    image: '/uploads/events/workshop.jpg',
    startDate: '2026-07-27',
    endDate: '2026-07-27',
    startTime: '10:00 AM',
    endTime: '07:00 PM',
    city: 'Ahmedabad',
    address: 'The Exhibition Center, Science City Road, Ahmedabad, Gujarat - 380009',
    postedBy: 'Dholu Bhai Zaveri',
    description: 'Premier B2B jewellery exhibition for verified jewellers across Gujarat.',
    isActive: true,
  },
  {
    id: 2,
    title: 'Workshop on Gold Purity',
    image: '/uploads/events/workshop.jpg',
    startDate: '2026-07-27',
    endDate: '2026-07-27',
    startTime: '10:00 AM',
    endTime: '07:00 PM',
    city: 'Ahmedabad',
    address: 'The Exhibition Center, Science City Road, Ahmedabad, Gujarat - 380009',
    postedBy: 'Dholu Bhai Zaveri',
    description: 'Premier B2B jewellery exhibition for verified jewellers across Gujarat.',
    isActive: false,
  },
  {
    id: 3,
    title: 'Workshop on Gold Purity',
    image: '/uploads/events/workshop.jpg',
    startDate: '2026-07-27',
    endDate: '2026-07-27',
    startTime: '10:00 AM',
    endTime: '07:00 PM',
    city: 'Ahmedabad',
    address: 'The Exhibition Center, Science City Road, Ahmedabad, Gujarat - 380009',
    postedBy: 'Dholu Bhai Zaveri',
    description: 'Premier B2B jewellery exhibition for verified jewellers across Gujarat.',
    isActive: true,
  },
];

/**
 * Fetch events list with server-side pagination and search
 */
export async function getEvents(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const search = params.search || '';

  try {
    const url = new URL(EVENTS_API_URL);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    if (search && search.trim()) {
      url.searchParams.set('search', search.trim());
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
      const rawList = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const events = rawList.map(normalizeEvent);
      const pagination = data.pagination || {
        total: events.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(events.length / limit)),
        hasNext: false,
        hasPrev: page > 1,
      };

      return {
        events,
        pagination,
        total: pagination.total ?? events.length,
      };
    }
  } catch (err) {
    console.error('[event.service] Failed to fetch events from API:', err);
  }

  const fallback = FALLBACK_EVENTS.map(normalizeEvent);
  return {
    events: fallback,
    pagination: {
      total: fallback.length,
      page: 1,
      limit,
      totalPages: Math.max(1, Math.ceil(fallback.length / limit)),
      hasNext: false,
      hasPrev: false,
    },
    total: fallback.length,
  };
}

/**
 * Fetch a single event by ID
 */
export async function getEventById(id) {
  const token = getAuthToken();
  const res = await fetch(`${EVENTS_API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch event #${id}`);
  }

  const json = await res.json();
  return normalizeEvent(json.data || json);
}

/**
 * Create a new event via POST /api/admin/events
 * Supports both FormData (with file) and JSON
 */
export async function createEvent(eventData) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && eventData instanceof FormData;

  let body;
  let headers = { Authorization: `Bearer ${token}` };

  if (isFormData) {
    body = eventData;
  } else if (eventData.imageFile instanceof File) {
    const formData = new FormData();
    formData.append('image', eventData.imageFile);
    Object.entries(eventData).forEach(([k, v]) => {
      if (k !== 'imageFile' && v !== undefined && v !== null) {
        formData.append(k, typeof v === 'boolean' ? v.toString() : v);
      }
    });
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    const cleanData = { ...eventData };
    delete cleanData.imageFile;
    if (cleanData.name && !cleanData.title) cleanData.title = cleanData.name;
    body = JSON.stringify(cleanData);
  }

  const res = await fetch(EVENTS_API_URL, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create event');
  }

  const json = await res.json();
  return normalizeEvent(json.data || json);
}

/**
 * Update an existing event via PATCH /api/admin/events/:id
 * Supports both FormData and JSON
 */
export async function updateEvent(id, updates) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== 'undefined' && updates instanceof FormData;
  const url = `${EVENTS_API_URL}/${id}`;

  let body;
  let headers = { Authorization: `Bearer ${token}` };

  if (isFormData) {
    body = updates;
  } else if (updates.imageFile instanceof File) {
    const formData = new FormData();
    formData.append('image', updates.imageFile);
    Object.entries(updates).forEach(([k, v]) => {
      if (k !== 'imageFile' && v !== undefined && v !== null && k !== '_id' && k !== 'id') {
        formData.append(k, typeof v === 'boolean' ? v.toString() : v);
      }
    });
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    const cleanData = { ...updates };
    delete cleanData.imageFile;
    delete cleanData._id;
    delete cleanData.id;
    if (cleanData.name && !cleanData.title) cleanData.title = cleanData.name;
    body = JSON.stringify(cleanData);
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update event');
  }

  const json = await res.json();
  return normalizeEvent(json.data || json);
}

/**
 * Toggle Active / Inactive status of an event via PATCH /api/admin/events/:id/status
 */
export async function toggleEventStatus(id) {
  const token = getAuthToken();
  const res = await fetch(`${EVENTS_API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to toggle event status');
  }

  const json = await res.json();
  return normalizeEvent(json.data || json);
}

/**
 * Delete an event via DELETE /api/admin/events/:id
 */
export async function deleteEvent(id) {
  const token = getAuthToken();
  const res = await fetch(`${EVENTS_API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete event');
  }

  return true;
}
