import apiClient from '@/lib/axios';

const SERVER_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL?.replace(/\/api\/admin\/?$/, '') ||
  'http://localhost:5000';

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:5000/api/admin/chat';

/**
 * Fallback Seeded Conversations (matches exact backend seed data)
 */
export const FALLBACK_CONVERSATIONS = [
  {
    id: 1,
    type: 'direct',
    participantDetails: {
      '12': {
        id: '12',
        name: 'Yash Soni',
        email: 'yashranpura3@gmail.com',
        role: 'admin',
        avatar: '/uploads/yash-image-1793436873733.jpeg',
      },
      member: {
        memberId: '43',
        name: 'Yash Ranpura',
        email: 'yashranpura3@gmail.com',
        role: 'member',
        avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
      },
    },
    lastMessage: {
      id: 'msg_1794820456187_tmwyw',
      text: 'You are welcome Yash!',
      senderId: '12',
      senderName: 'Yash Soni',
      messageType: 'text',
      createdAt: '16-11-2026 02:44 pm',
      senderRole: 'admin',
      member: {
        memberId: '43',
        name: 'Yash Ranpura',
        email: 'yashranpura3@gmail.com',
        role: 'member',
        avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
      },
    },
    unreadCounts: {
      '12': 0,
      '43': 0,
    },
    createdAt: '16-11-2026 11:20 am',
    updatedAt: '16-11-2026 02:44 pm',
    messages: [
      {
        id: 'msg_direct_12_43_1',
        conversationId: 1,
        senderId: '43',
        senderName: 'Yash Ranpura',
        senderAvatar: null,
        receiverId: '12',
        text: 'Hello Admin, I have submitted my membership renewal documents. Please verify.',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 11:20 am',
        senderRole: 'member',
        member: {
          memberId: '43',
          name: 'Yash Ranpura',
          email: 'yashranpura3@gmail.com',
          role: 'member',
          avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
        },
      },
      {
        id: 'msg_direct_12_43_2',
        conversationId: 1,
        senderId: '12',
        senderName: 'Yash Soni',
        senderAvatar: null,
        receiverId: '43',
        text: 'Hello Yash Ranpura, we received your documents. Your membership JBAD193 has been verified and approved.',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 11:20 am',
        senderRole: 'admin',
        member: {
          memberId: '43',
          name: 'Yash Ranpura',
          email: 'yashranpura3@gmail.com',
          role: 'member',
          avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
        },
      },
      {
        id: 'msg_direct_12_43_3',
        conversationId: 1,
        senderId: '43',
        senderName: 'Yash Ranpura',
        senderAvatar: null,
        receiverId: '12',
        text: 'Thank you so much! When will the new ID card be issued?',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 11:20 am',
        senderRole: 'member',
        member: {
          memberId: '43',
          name: 'Yash Ranpura',
          email: 'yashranpura3@gmail.com',
          role: 'member',
          avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
        },
      },
      {
        id: 'msg_direct_12_43_4',
        conversationId: 1,
        senderId: '12',
        senderName: 'Yash Soni',
        senderAvatar: null,
        receiverId: '43',
        text: 'Your digital ID card is already active in your portal. The physical card will be dispatched this week.',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 11:20 am',
        senderRole: 'admin',
        member: {
          memberId: '43',
          name: 'Yash Ranpura',
          email: 'yashranpura3@gmail.com',
          role: 'member',
          avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
        },
      },
      {
        id: 'msg_1794820456187_tmwyw',
        conversationId: 1,
        senderId: '12',
        senderName: 'Yash Soni',
        senderAvatar: null,
        receiverId: '43',
        text: 'You are welcome Yash!',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 02:44 pm',
        senderRole: 'admin',
        member: {
          memberId: '43',
          name: 'Yash Ranpura',
          email: 'yashranpura3@gmail.com',
          role: 'member',
          avatar: '/uploads/yash-passportsize-1793775598420.jpeg',
        },
      },
    ],
  },
  {
    id: 3,
    type: 'direct',
    participantDetails: {
      '12': {
        id: '12',
        name: 'Yash Soni',
        email: 'yashranpura3@gmail.com',
        role: 'admin',
        avatar: '/uploads/yash-image-1793436873733.jpeg',
      },
      member: {
        memberId: '49',
        name: 'Darshan Patel',
        email: 'darshan@jewels.com',
        role: 'member',
        avatar: '/uploads/darshan-avatar.jpeg',
      },
    },
    lastMessage: {
      id: 'msg_direct_12_49_2',
      text: 'Certainly, the next committee election is scheduled for December 15th.',
      senderId: '12',
      senderName: 'Yash Soni',
      messageType: 'text',
      createdAt: '16-11-2026 11:30 am',
      senderRole: 'admin',
      member: {
        memberId: '49',
        name: 'Darshan Patel',
        email: 'darshan@jewels.com',
        role: 'member',
        avatar: '/uploads/darshan-avatar.jpeg',
      },
    },
    unreadCounts: {
      '12': 0,
      '49': 0,
    },
    createdAt: '16-11-2026 11:28 am',
    updatedAt: '16-11-2026 11:30 am',
    messages: [
      {
        id: 'msg_direct_12_49_1',
        conversationId: 3,
        senderId: '49',
        senderName: 'Darshan Patel',
        senderAvatar: null,
        receiverId: '12',
        text: 'Good morning, can you confirm the date for the executive committee elections?',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 11:28 am',
        senderRole: 'member',
        member: {
          memberId: '49',
          name: 'Darshan Patel',
          email: 'darshan@jewels.com',
          role: 'member',
          avatar: '/uploads/darshan-avatar.jpeg',
        },
      },
      {
        id: 'msg_direct_12_49_2',
        conversationId: 3,
        senderId: '12',
        senderName: 'Yash Soni',
        senderAvatar: null,
        receiverId: '49',
        text: 'Certainly, the next committee election is scheduled for December 15th.',
        mediaUrl: null,
        messageType: 'text',
        isRead: true,
        createdAt: '16-11-2026 11:30 am',
        senderRole: 'admin',
        member: {
          memberId: '49',
          name: 'Darshan Patel',
          email: 'darshan@jewels.com',
          role: 'member',
          avatar: '/uploads/darshan-avatar.jpeg',
        },
      },
    ],
  },
];

/**
 * Normalizes Avatar URL with backend base path
 */
export function getChatAvatarUrl(url) {
  if (!url) return null;
  if (Array.isArray(url)) {
    url = url[0];
  }
  if (typeof url !== 'string' || !url.trim()) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const DELETED_CHATS_KEY = 'jaa_deleted_chat_ids_v1';

/**
 * Get the set of IDs that the user has explicitly deleted
 */
export function getDeletedChatIds() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(DELETED_CHATS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Persist an ID as explicitly deleted
 */
export function markChatIdDeleted(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getDeletedChatIds();
    set.add(String(id));
    window.localStorage.setItem(DELETED_CHATS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

/**
 * Safely returns fallback conversations excluding any deleted chat IDs.
 */
export function getSafeFallbackConversations() {
  const deletedSet = getDeletedChatIds();
  return FALLBACK_CONVERSATIONS.filter((c) => !deletedSet.has(String(c.id)));
}

/**
 * GET: Fetch all chat conversations
 * Endpoint: GET http://localhost:5000/api/admin/chat
 */
export async function getChatConversations({ search = '', page = 1, limit = 50 } = {}) {
  const deletedSet = getDeletedChatIds();

  let rawList = [];
  try {
    const params = {};
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const res = await apiClient.get('/chat', {
      params,
      timeout: 6000,
    });

    if (res.data?.success && Array.isArray(res.data.data)) {
      rawList = res.data.data;
    } else if (Array.isArray(res.data)) {
      rawList = res.data;
    }
  } catch (error) {
    try {
      const fetchUrl = new URL(`${SERVER_URL}/api/admin/chat`);
      if (search) fetchUrl.searchParams.set('search', search);
      const fRes = await fetch(fetchUrl.toString(), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (fRes.ok) {
        const json = await fRes.json();
        if (json.success && Array.isArray(json.data)) {
          rawList = json.data;
        } else if (Array.isArray(json)) {
          rawList = json;
        }
      }
    } catch (_) {}
    if (rawList.length === 0) {
      console.warn('[Chat Service] API fetch error, using safe filtered cache:', error.message);
    }
  }

  if (rawList.length > 0) {
    // If the server returns conversations, they exist and are authoritative!
    // Never hide active server conversations. Clear them from local deletedSet:
    try {
      const set = getDeletedChatIds();
      let changed = false;
      rawList.forEach((c) => {
        if (set.has(String(c.id))) {
          set.delete(String(c.id));
          changed = true;
        }
      });
      if (changed && typeof window !== 'undefined') {
        window.localStorage.setItem(DELETED_CHATS_KEY, JSON.stringify(Array.from(set)));
      }
    } catch (_) {}

    // Sync into in-memory fallback list
    rawList.forEach((apiConv) => {
      const idx = FALLBACK_CONVERSATIONS.findIndex((c) => String(c.id) === String(apiConv.id));
      if (idx >= 0) {
        FALLBACK_CONVERSATIONS[idx] = { ...FALLBACK_CONVERSATIONS[idx], ...apiConv };
      } else {
        FALLBACK_CONVERSATIONS.push(apiConv);
      }
    });

    return rawList;
  }

  // Fallback: Filter by deletedSet and search query
  let filtered = FALLBACK_CONVERSATIONS.filter((c) => !deletedSet.has(String(c.id)));

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((conv) => {
      const member = conv.participantDetails?.member;
      const name = member?.name?.toLowerCase() || '';
      const email = member?.email?.toLowerCase() || '';
      const lastText = conv.lastMessage?.text?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || lastText.includes(q);
    });
  }

  return filtered;
}

/**
 * Parse various timestamp formats into a valid numeric millisecond time.
 */
export function parseMessageTime(ts) {
  if (!ts) return 0;
  if (ts._seconds) return ts._seconds * 1000 + (ts._nanoseconds || 0) / 1000000;
  if (typeof ts.toDate === 'function') return ts.toDate().getTime();
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'string') {
    const m = ts.match(/(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (m) {
      const [, d, mo, y, h, min, ap] = m;
      let hr = parseInt(h, 10);
      if (ap) {
        if (ap.toLowerCase() === 'pm' && hr < 12) hr += 12;
        if (ap.toLowerCase() === 'am' && hr === 12) hr = 0;
      }
      return new Date(parseInt(y, 10), parseInt(mo, 10) - 1, parseInt(d, 10), hr, parseInt(min, 10)).getTime();
    }
    const parsed = new Date(ts).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

/**
 * Sorts any list of messages ascending by time (oldest to newest)
 */
export function sortMessagesChronologically(messages = []) {
  if (!Array.isArray(messages)) return [];
  return [...messages].sort((a, b) => parseMessageTime(a.createdAt) - parseMessageTime(b.createdAt));
}

/**
 * GET: Fetch single conversation with messages by ID
 * Endpoint: GET http://localhost:5000/api/admin/chat/:id
 */
export async function getChatById(conversationId) {
  if (!conversationId && conversationId !== 0) return null;

  let result = null;

  try {
    const res = await apiClient.get(`/chat/${conversationId}`, {
      timeout: 6000,
    });

    if (res.data?.success && res.data.data) {
      result = res.data.data;
    } else if (res.data && res.data.id) {
      result = res.data;
    }
  } catch (error) {
    try {
      const fRes = await fetch(`${SERVER_URL}/api/admin/chat/${conversationId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (fRes.ok) {
        const json = await fRes.json();
        if (json.success && json.data) {
          result = json.data;
        } else if (json.id) {
          result = json;
        }
      }
    } catch (_) {}
    if (!result) {
      console.warn(`[Chat Service] Failed to fetch chat #${conversationId} from API, using fallback:`, error.message);
    }
  }

  if (!result) {
    result = FALLBACK_CONVERSATIONS.find(
      (c) => String(c.id) === String(conversationId)
    );
  }

  if (result) {
    // 1. Sort messages chronologically (oldest -> newest)
    let sortedMessages = sortMessagesChronologically(result.messages || []);

    // 2. Filter out any ghost/dummy [Attachment] text messages that don't have mediaUrl
    sortedMessages = sortedMessages
      .filter((m) => !(m.text === '[Attachment]' && !m.mediaUrl))
      .map((m) => {
        if (m.text === '[Attachment]' && m.mediaUrl) {
          return { ...m, text: '' };
        }
        return m;
      });

    // 3. Clean lastMessage if it contains raw '[Attachment]'
    if (result.lastMessage?.text === '[Attachment]') {
      result.lastMessage = {
        ...result.lastMessage,
        text: '',
      };
    }

    // 4. Guarantee last message in thread is synchronized without creating duplicates
    if (result.lastMessage && sortedMessages.length > 0) {
      const lastMsgInList = sortedMessages[sortedMessages.length - 1];
      const isSameMsg =
        (result.lastMessage.id && lastMsgInList.id === result.lastMessage.id) ||
        (result.lastMessage.createdAt && lastMsgInList.createdAt === result.lastMessage.createdAt &&
         String(result.lastMessage.senderId) === String(lastMsgInList.senderId));

      if (!isSameMsg) {
        // Only append if it has actual text or mediaUrl
        if (result.lastMessage.mediaUrl || (result.lastMessage.text && result.lastMessage.text.trim() !== '')) {
          sortedMessages.push(result.lastMessage);
        }
      }
    } else if (result.lastMessage && sortedMessages.length === 0) {
      if (result.lastMessage.mediaUrl || (result.lastMessage.text && result.lastMessage.text.trim() !== '')) {
        sortedMessages.push(result.lastMessage);
      }
    }

    return {
      ...result,
      messages: sortedMessages,
    };
  }

  return null;
}

/**
 * POST: Send a message in a conversation
 * Endpoint: POST http://localhost:5000/api/admin/chat/messages
 */
export async function sendChatMessage({
  conversationId,
  receiverId,
  text = '',
  media = null,
  messageType = 'text',
}) {
  try {
    let payload;
    let headers = {};

    if (media instanceof File || media instanceof Blob) {
      payload = new FormData();
      payload.append('conversationId', String(conversationId));
      if (receiverId) payload.append('receiverId', String(receiverId));
      if (text) payload.append('text', text);
      payload.append('messageType', media.type?.startsWith('image/') ? 'image' : 'file');
      payload.append('media', media);
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      payload = {
        conversationId: Number(conversationId) || conversationId,
        receiverId: receiverId ? String(receiverId) : undefined,
        text: text.trim(),
        messageType: messageType || 'text',
      };
    }

    const res = await apiClient.post('/chat/messages', payload, {
      headers,
      timeout: 8000,
    });

    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    return res.data;
  } catch (error) {
    console.warn('[Chat Service] Failed to post message via API, creating local optimistic message:', error.message);

    // Create realistic optimistic response matching schema
    const nowStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(',', '');

    return {
      id: `msg_direct_12_${receiverId || 'member'}_${Date.now()}`,
      conversationId: Number(conversationId) || conversationId,
      senderId: '12',
      senderName: 'Yash Soni',
      senderAvatar: '/uploads/yash-image-1793436873733.jpeg',
      receiverId: String(receiverId || ''),
      text: text || '',
      mediaUrl: media ? URL.createObjectURL(media) : null,
      messageType: media ? (media.type?.startsWith('image/') ? 'image' : 'file') : messageType,
      isRead: false,
      createdAt: nowStr,
      senderRole: 'admin',
    };
  }
}

/**
 * PATCH: Mark a conversation as read
 * Endpoint: PATCH http://localhost:5000/api/admin/chat/:id/read
 */
export async function markChatAsRead(conversationId) {
  if (!conversationId && conversationId !== 0) return false;

  try {
    const res = await apiClient.patch(`/chat/${conversationId}/read`, { userId: '12' }, {
      timeout: 5000,
    });
    return res.data?.success ?? true;
  } catch (error) {
    try {
      const res2 = await apiClient.post(`/chat/${conversationId}/read`, { userId: '12' }, {
        timeout: 5000,
      });
      return res2.data?.success ?? true;
    } catch (e2) {
      console.warn(`[Chat Service] Failed to mark chat #${conversationId} as read:`, error.message);
      return false;
    }
  }
}

/**
 * POST: Start a new conversation with a member
 * Endpoint: POST http://localhost:5000/api/admin/chat/conversations
 */
export async function startNewChat({
  receiverId,
  receiverName,
  receiverEmail,
  receiverAvatar,
  initialMessage = '',
}) {
  const memberObj = {
    memberId: String(receiverId),
    name: receiverName || 'Member',
    email: receiverEmail || '',
    role: 'member',
    avatar: receiverAvatar || null,
  };

  try {
    const payload = {
      senderId: '12',
      receiverId: String(receiverId),
      receiverName: receiverName || 'Member',
      receiverEmail: receiverEmail || '',
      receiverAvatar: receiverAvatar || null,
      initialMessage: initialMessage || undefined,
    };

    const res = await apiClient.post('/chat/conversations', payload, {
      timeout: 6000,
    });

    let conv = null;
    if (res.data?.success && res.data.data) {
      conv = res.data.data;
    } else if (res.data && res.data.id) {
      conv = res.data;
    }

    if (conv) {
      // Ensure participantDetails.member is set
      conv.participantDetails = {
        ...(conv.participantDetails || {}),
        member: conv.participantDetails?.member || memberObj,
      };

      // Ensure cached in in-memory fallback
      const idx = FALLBACK_CONVERSATIONS.findIndex((c) => String(c.id) === String(conv.id));
      if (idx >= 0) {
        FALLBACK_CONVERSATIONS[idx] = conv;
      } else {
        FALLBACK_CONVERSATIONS.unshift(conv);
      }
      return conv;
    }
  } catch (error) {
    console.warn('[Chat Service] Failed to create conversation via API, using optimistic creation:', error.message);
  }

  // Construct realistic optimistic conversation
  const nowStr = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '');

  const newId = Number(receiverId) || Date.now();
  const initialMsgObj = initialMessage
    ? {
        id: `msg_direct_12_${receiverId}_1`,
        conversationId: newId,
        senderId: '12',
        senderName: 'Yash Soni',
        senderAvatar: '/uploads/yash-image-1793436873733.jpeg',
        receiverId: String(receiverId),
        text: initialMessage,
        mediaUrl: null,
        messageType: 'text',
        isRead: false,
        createdAt: nowStr,
        senderRole: 'admin',
        member: memberObj,
      }
    : null;

  const optimisticConv = {
    id: newId,
    type: 'direct',
    participantDetails: {
      '12': {
        id: '12',
        name: 'Yash Soni',
        email: 'yashranpura3@gmail.com',
        role: 'admin',
        avatar: '/uploads/yash-image-1793436873733.jpeg',
      },
      member: memberObj,
    },
    lastMessage: initialMsgObj,
    unreadCounts: {
      '12': 0,
      [String(receiverId)]: 0,
    },
    createdAt: nowStr,
    updatedAt: nowStr,
    messages: initialMsgObj ? [initialMsgObj] : [],
  };

  const existIdx = FALLBACK_CONVERSATIONS.findIndex((c) => String(c.id) === String(optimisticConv.id));
  if (existIdx >= 0) {
    FALLBACK_CONVERSATIONS[existIdx] = optimisticConv;
  } else {
    FALLBACK_CONVERSATIONS.unshift(optimisticConv);
  }

  return optimisticConv;
}

/**
 * DELETE: Delete a conversation
 * Endpoint: DELETE http://localhost:5000/api/admin/chat/:id
 */
export async function deleteChat(conversationId) {
  if (!conversationId && conversationId !== 0) return { success: false };

  const idStr = String(conversationId);

  // 1. Mark ID deleted in persistent storage
  markChatIdDeleted(idStr);

  // 2. Remove from in-memory fallback list immediately
  const idx = FALLBACK_CONVERSATIONS.findIndex((c) => String(c.id) === idStr);
  if (idx !== -1) {
    FALLBACK_CONVERSATIONS.splice(idx, 1);
  }

  // 3. Delete from backend API
  try {
    const res = await apiClient.delete(`/chat/${conversationId}`, {
      timeout: 8000,
    });
    return { success: true, data: res.data };
  } catch (error) {
    // If 404, it was already deleted on the server, which is treated as a success
    if (error.response?.status === 404) {
      return { success: true, message: 'Already deleted' };
    }
    console.warn(`[Chat Service] Server delete failed for chat #${conversationId}:`, error.message);
    // Return success: true so the optimistic deletion stays in place
    return { success: true, localOnly: true };
  }
}

/**
 * PATCH: Edit a message's text
 * Endpoint: PATCH http://localhost:5000/api/admin/chat/messages/:id
 */
export async function editChatMessage({ conversationId, messageId, text }) {
  if (!messageId) return { success: false };

  try {
    const res = await apiClient.patch(`/chat/messages/${messageId}`, {
      conversationId,
      text: text.trim(),
    }, {
      timeout: 6000,
    });
    return res.data?.success ? res.data : { success: true, data: { id: messageId, text } };
  } catch (error) {
    console.warn(`[Chat Service] Failed to edit message #${messageId}:`, error.message);
    return { success: true, localOnly: true, data: { id: messageId, text } };
  }
}

/**
 * DELETE: Delete a single message
 * Endpoint: DELETE http://localhost:5000/api/admin/chat/messages/:id
 */
export async function deleteChatMessage({ conversationId, messageId }) {
  if (!messageId) return { success: false };

  try {
    const res = await apiClient.delete(`/chat/messages/${messageId}`, {
      params: { conversationId },
      data: { conversationId },
      timeout: 6000,
    });
    return res.data?.success ? res.data : { success: true, messageId };
  } catch (error) {
    console.warn(`[Chat Service] Failed to delete message #${messageId}:`, error.message);
    return { success: true, localOnly: true, messageId };
  }
}
