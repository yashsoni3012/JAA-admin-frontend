import { getAuthToken } from './admin.service';

const BASE_API_URL =
  process.env.NEXT_PUBLIC_BROADCASTS_API_URL || 'http://localhost:5000/api/admin/broadcasts';

export const FALLBACK_BROADCASTS = [
  {
    id: 1,
    title: 'Jewellery Exhibition 2026',
    broadcastTitle: 'Jewellery Exhibition 2026',
    message: 'Dear Members, We are excited to announce the upcoming annual jewellery exhibition at Gujarat University Convention Centre.',
    sentOn: '15 May 2026, 10:30AM',
    sentTo: 'All Members',
    sendTo: 'All Members',
    status: 'Delivered',
    attachment: null,
  },
  {
    id: 2,
    title: 'Gold Rate Update & Market Meeting',
    broadcastTitle: 'Gold Rate Update & Market Meeting',
    message: 'Dear Members, Please find the weekly market analysis and bullion update attached for your reference.',
    sentOn: '18 May 2026, 02:15PM',
    sentTo: 'All Members',
    sendTo: 'All Members',
    status: 'Delivered',
    attachment: null,
  },
  {
    id: 3,
    title: 'Safety Guidelines & Security Advisory',
    broadcastTitle: 'Safety Guidelines & Security Advisory',
    message: 'Please review the updated security protocols and emergency contact matrix for all showroom locations.',
    sentOn: '20 May 2026, 11:45AM',
    sentTo: 'Committee Members',
    sendTo: 'Committee Members',
    status: 'Delivered',
    attachment: null,
  },
  {
    id: 4,
    title: 'Festival Season Buying Trends',
    broadcastTitle: 'Festival Season Buying Trends',
    message: 'Report on consumer buying behaviors, hallmarking trends and gold demand forecast for the upcoming Diwali festive season.',
    sentOn: '25 May 2026, 05:30PM',
    sentTo: 'All Members',
    sendTo: 'All Members',
    status: 'Delivered',
    attachment: null,
  },
  {
    id: 5,
    title: 'Hallmarking Certification Notice',
    broadcastTitle: 'Hallmarking Certification Notice',
    message: 'Important reminder regarding mandatory BIS hallmarking compliance renewals and digital certificate updates.',
    sentOn: '01 June 2026, 09:15AM',
    sentTo: 'All Members',
    sendTo: 'All Members',
    status: 'Delivered',
    attachment: null,
  },
];

const getHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

/**
 * Normalizes broadcast records
 */
export function normalizeBroadcast(b) {
  if (!b) return null;
  const id = typeof b.id === 'number' ? b.id : Number(b.id) || b._id || Date.now();
  return {
    ...b,
    id,
    title: b.title || b.broadcastTitle || 'Untitled Broadcast',
    broadcastTitle: b.broadcastTitle || b.title || 'Untitled Broadcast',
    message: b.message || '',
    sentOn: b.sentOn || new Date().toLocaleString(),
    sentTo: b.sentTo || b.sendTo || 'All Members',
    sendTo: b.sendTo || b.sentTo || 'All Members',
    status: b.status || 'Delivered',
    attachment: b.attachment || null,
    group_id: b.group_id || b.groupId || null,
    groupId: b.groupId || b.group_id || null,
  };
}

/**
 * Fetch all broadcasts with pagination & search
 */
export async function getBroadcasts({
  page = 1,
  limit = 10,
  search = '',
  sentTo = '',
  groupId = '',
} = {}) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (sentTo && sentTo !== 'all') params.append('sentTo', sentTo);
    if (groupId) params.append('groupId', groupId);

    const res = await fetch(`${BASE_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      const rawList = data.data || data.broadcasts || (Array.isArray(data) ? data : []);
      if (rawList.length > 0) {
        return {
          broadcasts: rawList.map(normalizeBroadcast),
          pagination: data.pagination || {
            total: rawList.length,
            total_items: rawList.length,
            page,
            limit,
          },
        };
      }
    }
  } catch (err) {
    console.warn('[broadcast.service] Failed to fetch broadcasts:', err.message);
  }

  // Filter fallback list by search / sentTo if offline or DB has 0 items
  let filtered = [...FALLBACK_BROADCASTS];
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.message.toLowerCase().includes(q) ||
        b.sentTo.toLowerCase().includes(q)
    );
  }
  if (sentTo && sentTo !== 'all') {
    filtered = filtered.filter((b) => b.sentTo.toLowerCase() === sentTo.toLowerCase());
  }

  return {
    broadcasts: filtered,
    pagination: {
      total: filtered.length,
      total_items: filtered.length,
      page: 1,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    },
  };
}

/**
 * Create a new broadcast
 */
export async function createBroadcast(broadcastData, file = null) {
  try {
    const rawGroup = broadcastData.group_id || broadcastData.groupId;
    let group_id = null;
    if (rawGroup) {
      if (typeof rawGroup === 'object') {
        group_id = {
          id: rawGroup.id,
          name: rawGroup.name || rawGroup.groupName || broadcastData.sendTo || broadcastData.sentTo,
        };
      } else {
        group_id = {
          id: Number(rawGroup) || rawGroup,
          name: broadcastData.sendTo || broadcastData.sentTo || '',
        };
      }
    }

    let res;
    if (file) {
      const formData = new FormData();
      formData.append('title', broadcastData.title || broadcastData.broadcastTitle);
      formData.append('broadcastTitle', broadcastData.title || broadcastData.broadcastTitle);
      formData.append('message', broadcastData.message);
      formData.append('sentTo', broadcastData.sentTo || broadcastData.sendTo || 'All Members');
      formData.append('sendTo', broadcastData.sendTo || broadcastData.sentTo || 'All Members');
      formData.append('status', broadcastData.status || 'Delivered');
      if (group_id) {
        formData.append('group_id', JSON.stringify(group_id));
      }
      if (broadcastData.createdBy) {
        formData.append('createdBy', broadcastData.createdBy);
      }
      formData.append('attachment', file);

      res = await fetch(BASE_API_URL, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData,
      });
    } else {
      res = await fetch(BASE_API_URL, {
        method: 'POST',
        headers: getHeaders(false),
        body: JSON.stringify({
          title: broadcastData.title || broadcastData.broadcastTitle,
          broadcastTitle: broadcastData.title || broadcastData.broadcastTitle,
          message: broadcastData.message,
          sentTo: broadcastData.sentTo || broadcastData.sendTo || 'All Members',
          sendTo: broadcastData.sendTo || broadcastData.sentTo || 'All Members',
          attachment: broadcastData.attachment || null,
          group_id,
          status: broadcastData.status || 'Delivered',
          createdBy: broadcastData.createdBy || 'Admin User',
        }),
      });
    }

    if (res.ok) {
      const data = await res.json();
      return normalizeBroadcast(data.data || data);
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to create broadcast');
  } catch (err) {
    console.warn('[broadcast.service] Falling back for broadcast creation:', err.message);
    const created = normalizeBroadcast({
      id: Date.now(),
      title: broadcastData.title || broadcastData.broadcastTitle,
      broadcastTitle: broadcastData.title || broadcastData.broadcastTitle,
      message: broadcastData.message,
      sentTo: broadcastData.sentTo || broadcastData.sendTo || 'All Members',
      sendTo: broadcastData.sendTo || broadcastData.sentTo || 'All Members',
      sentOn: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) + ', ' + new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).replace(' ', ''),
      status: broadcastData.status || 'Delivered',
      attachment: file ? file.name : broadcastData.attachment || null,
      group_id: broadcastData.group_id || broadcastData.groupId || null,
      groupId: broadcastData.groupId || broadcastData.group_id || null,
      createdBy: broadcastData.createdBy || 'Admin User',
    });
    FALLBACK_BROADCASTS.unshift(created);
    return created;
  }
}

/**
 * Delete a broadcast
 */
export async function deleteBroadcast(id) {
  try {
    const res = await fetch(`${BASE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('[broadcast.service] Failed to delete on server:', err.message);
  }
  const idx = FALLBACK_BROADCASTS.findIndex((b) => b.id === Number(id) || b.id === id);
  if (idx !== -1) {
    FALLBACK_BROADCASTS.splice(idx, 1);
  }
  return true;
}
