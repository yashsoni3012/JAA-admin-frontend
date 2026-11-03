import { getAuthToken } from './admin.service';

const BASE_API_URL =
  process.env.NEXT_PUBLIC_GROUPS_API_URL || 'http://localhost:5000/api/admin/groups';

// Fallback dummy groups matching Image 1
export const FALLBACK_GROUPS = [
  {
    id: 1,
    name: 'Executive Committee',
    about: 'Executive committee responsible for management and strategic decisions.',
    description: 'Executive committee responsible for management and strategic decisions.',
    memberCount: 25,
    groupType: 'All Members',
    createdOn: '12 December 2025',
    createdBy: 'Admin User',
    status: true,
    recentBroadcasts: [
      {
        id: 1,
        title: 'Jewellery Exhibition 2026',
        message: 'Dear Members, We are excited to announce the upcoming annual jewellery exhibition.',
        sentOn: '15 May 2026, 10:30AM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
      {
        id: 2,
        title: 'AGM Meeting Notification',
        message: 'Annual General Meeting is scheduled for next Monday at 11:00 AM.',
        sentOn: '10 May 2026, 04:00PM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
    ],
  },
  {
    id: 2,
    name: 'Ahmedabad Members',
    about: 'This group includes all members from Ahmedabad city.',
    description: 'This group includes all members from Ahmedabad city.',
    memberCount: 25,
    groupType: 'All Members',
    createdOn: '12 December 2025',
    createdBy: 'Admin User',
    status: true,
    recentBroadcasts: [
      {
        id: 1,
        title: 'Jewellery Exhibition 2026',
        message: 'Dear Members, We are excited to announce the upcoming annual jewellery exhibition.',
        sentOn: '15 May 2026, 10:30AM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
      {
        id: 2,
        title: 'Gold Rate Update & Market Meeting',
        message: 'Dear Members, Please find the weekly market analysis and bullion update.',
        sentOn: '18 May 2026, 02:15PM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
      {
        id: 3,
        title: 'Safety Guidelines & Security Advisory',
        message: 'Please review the updated security protocols for all showroom locations.',
        sentOn: '20 May 2026, 11:45AM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
      {
        id: 4,
        title: 'Festival Season Buying Trends',
        message: 'Report on customer buying behaviors for the upcoming Diwali festive season.',
        sentOn: '25 May 2026, 05:30PM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
      {
        id: 5,
        title: 'Hallmarking Certification Notice',
        message: 'Reminder regarding mandatory BIS hallmarking compliance renewals.',
        sentOn: '01 June 2026, 09:15AM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
    ],
  },
  {
    id: 3,
    name: 'Surat Members',
    about: 'This group includes all members from Surat city.',
    description: 'This group includes all members from Surat city.',
    memberCount: 25,
    groupType: 'All Members',
    createdOn: '12 December 2025',
    createdBy: 'Admin User',
    status: true,
    recentBroadcasts: [
      {
        id: 1,
        title: 'Diamond Expo Registration',
        message: 'Registration is now open for the Surat International Diamond Expo.',
        sentOn: '12 May 2026, 11:00AM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
    ],
  },
  {
    id: 4,
    name: 'Manufactures Group',
    about: 'Manufacturing units and production partners.',
    description: 'Manufacturing units and production partners.',
    memberCount: 25,
    groupType: 'All Members',
    createdOn: '12 December 2025',
    createdBy: 'Admin User',
    status: true,
    recentBroadcasts: [
      {
        id: 1,
        title: 'Machinery & Equipment Subsidy',
        message: 'Government subsidy details for state-of-the-art jewelry casting machines.',
        sentOn: '08 May 2026, 03:30PM',
        sentTo: 'All Members',
        status: 'Delivered',
      },
    ],
  },
];

/**
 * Normalizes group records from API
 */
export function normalizeGroup(group) {
  if (!group) return null;
  const id = typeof group.id === 'number' ? group.id : Number(group.id) || group._id || 1;
  const memberCount =
    typeof group.memberCount === 'number'
      ? group.memberCount
      : Array.isArray(group.members)
      ? group.members.length
      : 0;

  return {
    ...group,
    id,
    name: group.name || 'Untitled Group',
    about: group.about || group.description || 'This group includes registered association members.',
    description: group.description || group.about || '',
    memberCount,
    members: Array.isArray(group.members) ? group.members : [],
    groupType: group.groupType || 'All Members',
    createdOn: group.createdOn || '12 December 2025',
    createdBy: group.createdBy || 'Admin User',
    status: group.status !== undefined ? Boolean(group.status) : true,
    recentBroadcasts: Array.isArray(group.recentBroadcasts) && group.recentBroadcasts.length > 0
      ? group.recentBroadcasts
      : [
          {
            id: 1,
            title: 'Jewellery Exhibition 2026',
            message: 'Dear Members, We are excited to announce the upcoming annual exhibition.',
            sentOn: '15 May 2026, 10:30AM',
            sentTo: 'All Members',
            status: 'Delivered',
          },
        ],
  };
}

/**
 * Fetch all groups with pagination & search
 */
export async function getGroups(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 10;

  try {
    const url = new URL(BASE_API_URL);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

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
      const rawList = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      const groups = rawList.map(normalizeGroup);
      const rawPagination = data.pagination || {};

      const total =
        rawPagination.total_items !== undefined
          ? rawPagination.total_items
          : rawPagination.total !== undefined
          ? rawPagination.total
          : groups.length;

      const totalPages =
        rawPagination.total_page !== undefined
          ? rawPagination.total_page
          : Math.max(1, Math.ceil(total / limit));

      return {
        groups,
        pagination: {
          total,
          total_items: total,
          totalPages,
          total_page: totalPages,
          page: rawPagination.current_page || page,
          current_page: rawPagination.current_page || page,
          limit: rawPagination.item_per_page || limit,
          item_per_page: rawPagination.item_per_page || limit,
          has_more: Boolean(rawPagination.has_more),
        },
      };
    }
  } catch (err) {
    console.warn('[group.service] Failed to fetch groups from API, falling back to local data:', err.message);
  }

  // Fallback data
  let filtered = [...FALLBACK_GROUPS];
  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (g) => g.name.toLowerCase().includes(q) || g.about.toLowerCase().includes(q)
    );
  }

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit).map(normalizeGroup);

  return {
    groups: paginated,
    pagination: {
      total: filtered.length,
      total_items: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      total_page: Math.max(1, Math.ceil(filtered.length / limit)),
      page,
      current_page: page,
      limit,
      item_per_page: limit,
      has_more: start + limit < filtered.length,
    },
  };
}

/**
 * Fetch single group by ID
 */
export async function getGroupById(id) {
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
      if (data.data) {
        return normalizeGroup(data.data);
      }
    }
  } catch (err) {
    console.warn(`[group.service] Failed to fetch group #${id}:`, err.message);
  }

  const fallback = FALLBACK_GROUPS.find((g) => String(g.id) === String(id));
  return fallback ? normalizeGroup(fallback) : null;
}

/**
 * Create a new group via POST /api/admin/groups
 */
export async function createGroup(groupData) {
  const token = getAuthToken();
  const res = await fetch(BASE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create group');
  }

  const result = await res.json();
  return normalizeGroup(result.data);
}

/**
 * Update group via PUT /api/admin/groups/:id
 */
export async function updateGroup(id, updates) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update group');
  }

  const result = await res.json();
  return normalizeGroup(result.data);
}

/**
 * Toggle group status (active/inactive) via PATCH /api/admin/groups/:id/status
 */
export async function toggleGroupStatus(id) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to toggle group status');
  }

  const result = await res.json();
  return normalizeGroup(result.data);
}

/**
 * Delete group via DELETE /api/admin/groups/:id
 */
export async function deleteGroup(id) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to delete group');
  }

  return await res.json();
}

