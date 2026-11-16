'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Send,
  Paperclip,
  Trash2,
  Pencil,
  RefreshCw,
  CheckCheck,
  Check,
  User,
  ArrowLeft,
  X,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  Mail,
  Shield,
  AlertTriangle,
  ChevronLeft,
  Plus,
  MoreVertical,
  Building,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Modal from '@/components/common/Modal';
import {
  getChatConversations,
  getChatById,
  sendChatMessage,
  markChatAsRead,
  deleteChat,
  startNewChat,
  editChatMessage,
  deleteChatMessage,
  getChatAvatarUrl,
  sortMessagesChronologically,
  markChatIdDeleted,
  formatMessageTime,
  formatMessageDateLabel,
  getMessageDateKey,
} from '@/services/chat.service';
import { getMembers } from '@/services/admin.service';

export default function AdminChatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState(null);

  // Helper to persist active chat ID across page refreshes
  const updateActiveId = useCallback((id) => {
    setActiveId(id);
    if (typeof window !== 'undefined') {
      try {
        if (id !== null && id !== undefined) {
          window.sessionStorage.setItem('jaa_admin_active_chat_id', String(id));
          window.sessionStorage.setItem('jaa_admin_chat_visited', 'true');
        } else {
          window.sessionStorage.removeItem('jaa_admin_active_chat_id');
        }
      } catch {}
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Message edit and delete state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [isDeleteMsgModalOpen, setIsDeleteMsgModalOpen] = useState(false);

  // 3-dots Menu state
  const [menuOpenId, setMenuOpenId] = useState(null);

  // "Start New Chat" Modal State
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close 3-dots dropdown menu on outside click
  useEffect(() => {
    if (menuOpenId === null) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-chat-menu]')) {
        setMenuOpenId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [menuOpenId]);

  // Scroll to bottom of message feed
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
      });
    }
  }, []);

  // =========================================================================
  // 1. TANSTACK QUERY: CONVERSATIONS LIST
  // =========================================================================
  const {
    data: rawConversations = [],
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['admin-chats', debouncedSearch],
    queryFn: () => getChatConversations({ search: debouncedSearch }),
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 5000, // Quiet background sync every 5s
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });

  const hasInitialSelectedRef = useRef(false);

  // Restore currently open chat from sessionStorage across page refreshes or default to latest
  useEffect(() => {
    if (Array.isArray(rawConversations) && rawConversations.length > 0) {
      if (!hasInitialSelectedRef.current) {
        hasInitialSelectedRef.current = true;

        let savedId = null;
        try {
          savedId = window.sessionStorage.getItem('jaa_admin_active_chat_id');
        } catch {}

        // If user had a chat open prior to refresh, restore that exact chat
        if (savedId) {
          const found = rawConversations.find((c) => String(c.id) === String(savedId));
          if (found) {
            updateActiveId(found.id);
            markChatAsRead(found.id).catch(() => {});
            return;
          }
        }

        // Default to the first (most recent) conversation
        const firstId = rawConversations[0].id;
        updateActiveId(firstId);
        markChatAsRead(firstId).catch(() => {});
      }
    }
  }, [rawConversations, updateActiveId]);

  // =========================================================================
  // 2. TANSTACK QUERY: ACTIVE CHAT DETAILS & MESSAGES
  // =========================================================================
  const {
    data: rawActiveChat,
    isLoading: isActiveChatLoading,
    refetch: refetchActiveChat,
  } = useQuery({
    queryKey: ['admin-chat', activeId],
    queryFn: async () => {
      if (!activeId && activeId !== 0) return null;
      const details = await getChatById(activeId);
      // Mark as read in backend
      markChatAsRead(activeId).catch(() => {});

      // Optimistically clear unread count for this conversation in conversations cache
      queryClient.setQueriesData({ queryKey: ['admin-chats'] }, (old) => {
        if (!Array.isArray(old)) return [];
        return old.map((c) => {
          if (String(c.id) === String(activeId)) {
            return {
              ...c,
              unreadCounts: {
                ...(c.unreadCounts || {}),
                '12': 0,
                admin: 0,
              },
            };
          }
          return c;
        });
      });

      return details;
    },
    enabled: activeId !== null && activeId !== undefined,
    staleTime: 1000 * 20, // 20s fresh cache
    refetchInterval: 6000, // Quiet background poll every 6s
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });

  // Synchronize and sort active chat messages chronologically
  const activeMessages = useMemo(() => {
    if (!rawActiveChat?.messages) return [];
    const sorted = sortMessagesChronologically(rawActiveChat.messages);
    return sorted.filter((m) => !(m.text === '[Attachment]' && !m.mediaUrl));
  }, [rawActiveChat?.messages]);

  // Guaranteed activeChat object with matching lastMessage
  const activeChat = useMemo(() => {
    if (!activeId || !rawActiveChat) return null;
    const lastMsg =
      activeMessages.length > 0
        ? activeMessages[activeMessages.length - 1]
        : rawActiveChat.lastMessage;

    return {
      ...rawActiveChat,
      messages: activeMessages,
      lastMessage: lastMsg || rawActiveChat.lastMessage,
    };
  }, [activeId, rawActiveChat, activeMessages]);

  // Synchronized conversations list (left panel always matches right panel last message)
  const conversations = useMemo(() => {
    const list = Array.isArray(rawConversations) ? rawConversations : [];
    return list.map((c) => {
      const isSelected = activeId !== null && String(c.id) === String(activeId);
      const unreadCounts = isSelected
        ? { ...(c.unreadCounts || {}), '12': 0, admin: 0 }
        : c.unreadCounts;

      if (activeChat && String(c.id) === String(activeChat.id) && activeMessages.length > 0) {
        const latestMsg = activeMessages[activeMessages.length - 1];
        return {
          ...c,
          unreadCounts,
          lastMessage: latestMsg,
          updatedAt: latestMsg.createdAt || c.updatedAt,
        };
      }
      return {
        ...c,
        unreadCounts,
      };
    });
  }, [rawConversations, activeChat, activeMessages, activeId]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (activeMessages.length > 0) {
      scrollToBottom(true);
    }
  }, [activeMessages.length, scrollToBottom]);

  // =========================================================================
  // 3. TANSTACK QUERY: MEMBERS FOR "START NEW CHAT" MODAL
  // =========================================================================
  const {
    data: rawMembersData,
    isLoading: isMembersLoading,
  } = useQuery({
    queryKey: ['admin-members-directory'],
    queryFn: () => getMembers({ page: 1, limit: 100 }),
    enabled: isNewChatModalOpen,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const membersList = useMemo(() => {
    if (Array.isArray(rawMembersData?.members)) return rawMembersData.members;
    if (Array.isArray(rawMembersData?.data?.members)) return rawMembersData.data.members;
    if (Array.isArray(rawMembersData)) return rawMembersData;
    return [];
  }, [rawMembersData]);

  // =========================================================================
  // 4. MUTATIONS (SEND MESSAGE, DELETE CHAT, START NEW CHAT)
  // =========================================================================

  // SEND MESSAGE MUTATION
  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newMsgPayload) => {
      await queryClient.cancelQueries({ queryKey: ['admin-chat', activeId] });
      await queryClient.cancelQueries({ queryKey: ['admin-chats'] });

      const prevActiveChat = queryClient.getQueryData(['admin-chat', activeId]);
      const prevConversations = queryClient.getQueryData(['admin-chats', debouncedSearch]);

      const nowStr = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).replace(',', '');

      const optimisticMsg = {
        id: `msg_optimistic_${Date.now()}`,
        conversationId: activeId,
        senderId: '12',
        senderName: 'Yash Soni',
        senderAvatar: '/uploads/yash-image-1793436873733.jpeg',
        receiverId: String(newMsgPayload.receiverId),
        text: newMsgPayload.text || '',
        mediaUrl: newMsgPayload.media ? URL.createObjectURL(newMsgPayload.media) : null,
        messageType: newMsgPayload.media ? 'image' : 'text',
        isRead: false,
        createdAt: nowStr,
        senderRole: 'admin',
      };

      // Optimistically update active chat
      if (prevActiveChat) {
        queryClient.setQueryData(['admin-chat', activeId], {
          ...prevActiveChat,
          lastMessage: optimisticMsg,
          messages: [...(prevActiveChat.messages || []), optimisticMsg],
        });
      }

      // Optimistically update conversations list and move conversation to top
      if (Array.isArray(prevConversations)) {
        const target = prevConversations.find((c) => String(c.id) === String(activeId));
        const others = prevConversations.filter((c) => String(c.id) !== String(activeId));
        if (target) {
          queryClient.setQueryData(['admin-chats', debouncedSearch], [
            { ...target, lastMessage: optimisticMsg, updatedAt: nowStr },
            ...others,
          ]);
        }
      }

      setTimeout(() => scrollToBottom(true), 30);
      return { prevActiveChat, prevConversations };
    },
    onError: (err, newMsg, context) => {
      console.error('[Chat Page] Send error:', err);
      if (context?.prevActiveChat) {
        queryClient.setQueryData(['admin-chat', activeId], context.prevActiveChat);
      }
      if (context?.prevConversations) {
        queryClient.setQueryData(['admin-chats', debouncedSearch], context.prevConversations);
      }
      showToast('Failed to send message. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat', activeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-chats'] });
    },
  });

  // DELETE CHAT MUTATION (Instant Optimistic & Glitch-Free)
  const deleteChatMutation = useMutation({
    mutationFn: (convId) => deleteChat(convId),
    onMutate: async (deletedId) => {
      const idStr = String(deletedId);

      // 1. Immediately close modal and dropdown so UI responds with zero delay
      setIsDeleteModalOpen(false);
      setChatToDelete(null);
      setMenuOpenId(null);

      // 2. Mark as deleted in localStorage right now
      markChatIdDeleted(idStr);

      // 3. Cancel any in-flight queries
      await queryClient.cancelQueries({ queryKey: ['admin-chats'] });
      await queryClient.cancelQueries({ queryKey: ['admin-chat', deletedId] });

      // 4. Capture snapshot
      const prevConversations = queryClient.getQueryData(['admin-chats', debouncedSearch]);

      // 5. Instantly update all query keys for admin-chats
      queryClient.setQueriesData({ queryKey: ['admin-chats'] }, (old) => {
        if (!Array.isArray(old)) return [];
        return old.filter((c) => String(c.id) !== idStr);
      });

      // 6. Remove cached chat details for this conversation
      queryClient.removeQueries({ queryKey: ['admin-chat', deletedId] });

      // 7. If currently selected chat is deleted, switch activeId to the next available chat
      if (String(activeId) === idStr) {
        const remaining = (Array.isArray(prevConversations) ? prevConversations : conversations)
          .filter((c) => String(c.id) !== idStr);
        if (remaining.length > 0) {
          updateActiveId(remaining[0].id);
        } else {
          updateActiveId(null);
        }
      }

      showToast('Conversation deleted successfully');
      return { prevConversations };
    },
    onSuccess: () => {
      // Background silent sync
      queryClient.invalidateQueries({
        queryKey: ['admin-chats'],
        refetchType: 'none',
      });
    },
    onError: (err) => {
      console.warn('[Chat Page] Server delete warning:', err);
    },
  });

  // START NEW CHAT MUTATION
  const startChatMutation = useMutation({
    mutationFn: startNewChat,
    onSuccess: (newConv, variables) => {
      if (!newConv) return;
      const memberInfo = newConv.participantDetails?.member || {
        memberId: String(variables.receiverId),
        name: variables.receiverName || 'Member',
        email: variables.receiverEmail || '',
        role: 'member',
        avatar: variables.receiverAvatar || null,
      };

      const normalizedConv = {
        ...newConv,
        participantDetails: {
          ...(newConv.participantDetails || {}),
          member: memberInfo,
        },
      };

      // 1. Update all conversation list queries so the new chat shows at top immediately
      queryClient.setQueriesData({ queryKey: ['admin-chats'] }, (old = []) => {
        const arr = Array.isArray(old) ? old : [];
        return [normalizedConv, ...arr.filter((c) => String(c.id) !== String(normalizedConv.id))];
      });

      // 2. Pre-populate active chat cache
      queryClient.setQueryData(['admin-chat', normalizedConv.id], normalizedConv);

      // 3. Select active chat and switch view
      updateActiveId(normalizedConv.id);
      setShowMobileChat(true);
      setIsNewChatModalOpen(false);
      showToast(`Chat started with ${memberInfo.name || 'member'}`);

      // 4. Quiet invalidation without clobbering UI state
      queryClient.invalidateQueries({
        queryKey: ['admin-chats'],
        refetchType: 'none',
      });
    },
    onError: (err) => {
      console.error('[Chat Page] Start new chat error:', err);
      showToast('Failed to start chat. Please try again.');
    },
  });

  // EDIT MESSAGE MUTATION (Optimistic)
  const editMessageMutation = useMutation({
    mutationFn: editChatMessage,
    onMutate: async ({ conversationId, messageId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-chat', conversationId] });
      const prevChat = queryClient.getQueryData(['admin-chat', conversationId]);

      if (prevChat && Array.isArray(prevChat.messages)) {
        const updatedMessages = prevChat.messages.map((m) => {
          if (String(m.id) === String(messageId)) {
            return {
              ...m,
              text,
              isEdited: true,
            };
          }
          return m;
        });

        const isLast = prevChat.lastMessage?.id && String(prevChat.lastMessage.id) === String(messageId);
        const updatedLastMessage = isLast
          ? { ...prevChat.lastMessage, text, isEdited: true }
          : prevChat.lastMessage;

        queryClient.setQueryData(['admin-chat', conversationId], {
          ...prevChat,
          messages: updatedMessages,
          lastMessage: updatedLastMessage,
        });

        if (isLast) {
          queryClient.setQueriesData({ queryKey: ['admin-chats'] }, (old) => {
            if (!Array.isArray(old)) return [];
            return old.map((c) => {
              if (String(c.id) === String(conversationId)) {
                return {
                  ...c,
                  lastMessage: updatedLastMessage,
                };
              }
              return c;
            });
          });
        }
      }

      setEditingMessageId(null);
      setEditingText('');
      showToast('Message edited successfully');
      return { prevChat };
    },
    onError: (err, variables, context) => {
      console.warn('[Chat Page] Edit message error:', err);
      if (context?.prevChat) {
        queryClient.setQueryData(['admin-chat', variables.conversationId], context.prevChat);
      }
      showToast('Failed to edit message.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat', activeId], refetchType: 'none' });
    },
  });

  // DELETE MESSAGE MUTATION (Optimistic)
  const deleteMessageMutation = useMutation({
    mutationFn: deleteChatMessage,
    onMutate: async ({ conversationId, messageId }) => {
      setIsDeleteMsgModalOpen(false);
      setDeletingMessage(null);

      await queryClient.cancelQueries({ queryKey: ['admin-chat', conversationId] });
      const prevChat = queryClient.getQueryData(['admin-chat', conversationId]);

      if (prevChat && Array.isArray(prevChat.messages)) {
        const remainingMessages = prevChat.messages.filter((m) => String(m.id) !== String(messageId));
        const newLastMsg = remainingMessages.length > 0 ? remainingMessages[remainingMessages.length - 1] : null;

        queryClient.setQueryData(['admin-chat', conversationId], {
          ...prevChat,
          messages: remainingMessages,
          lastMessage: newLastMsg,
        });

        queryClient.setQueriesData({ queryKey: ['admin-chats'] }, (old) => {
          if (!Array.isArray(old)) return [];
          return old.map((c) => {
            if (String(c.id) === String(conversationId)) {
              return {
                ...c,
                lastMessage: newLastMsg,
              };
            }
            return c;
          });
        });
      }

      showToast('Message deleted successfully');
      return { prevChat };
    },
    onError: (err, variables, context) => {
      console.warn('[Chat Page] Delete message error:', err);
      if (context?.prevChat) {
        queryClient.setQueryData(['admin-chat', variables.conversationId], context.prevChat);
      }
      showToast('Failed to delete message.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat', activeId], refetchType: 'none' });
    },
  });

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text || '');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = (msg) => {
    if (!editingText.trim()) return;
    editMessageMutation.mutate({
      conversationId: activeId,
      messageId: msg.id,
      text: editingText.trim(),
    });
  };

  const handlePromptDeleteMessage = (msg) => {
    setDeletingMessage(msg);
    setIsDeleteMsgModalOpen(true);
  };

  const handleConfirmDeleteMessage = () => {
    if (!deletingMessage?.id) return;
    deleteMessageMutation.mutate({
      conversationId: activeId,
      messageId: deletingMessage.id,
    });
  };

  const handleSelectConversation = (conv) => {
    updateActiveId(conv.id);
    setShowMobileChat(true);

    // Immediately clear unread counts in React Query cache so UI updates instantly
    queryClient.setQueriesData({ queryKey: ['admin-chats'] }, (old) => {
      if (!Array.isArray(old)) return [];
      return old.map((c) => {
        if (String(c.id) === String(conv.id)) {
          return {
            ...c,
            unreadCounts: {
              ...(c.unreadCounts || {}),
              '12': 0,
              admin: 0,
            },
          };
        }
        return c;
      });
    });

    markChatAsRead(conv.id).catch(() => {});
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend && !selectedFile) return;
    if (!activeId || sendMessageMutation.isPending) return;

    const memberDetails =
      activeChat?.participantDetails?.member ||
      conversations.find((c) => String(c.id) === String(activeId))?.participantDetails?.member;
    const receiverId = memberDetails?.memberId || memberDetails?.id || '43';

    // Clear form immediately for snappy feel
    setInputText('');
    handleClearFile();

    sendMessageMutation.mutate({
      conversationId: activeId,
      receiverId,
      text: textToSend,
      media: selectedFile,
    });

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = () => {
    const targetChat =
      chatToDelete ||
      activeChat ||
      conversations.find((c) => String(c.id) === String(activeId));
    if (!targetChat?.id) return;
    deleteChatMutation.mutate(targetChat.id);
  };

  const handleSelectMemberForChat = (member) => {
    if (!member) return;
    const memberId = String(member.id || member.memberId);

    // 1. Check if conversation already exists with this member
    const existing = conversations.find((c) => {
      const m = c.participantDetails?.member;
      const cMemberId = String(m?.memberId || m?.id || '');
      const cEmail = String(m?.email || '').toLowerCase();
      const mEmail = String(member.email || '').toLowerCase();
      return (
        (cMemberId && cMemberId === memberId) ||
        (cEmail && mEmail && cEmail === mEmail) ||
        (m?.name && member.name && m.name.toLowerCase() === member.name.toLowerCase())
      );
    });

    if (existing) {
      updateActiveId(existing.id);
      setShowMobileChat(true);
      setIsNewChatModalOpen(false);
      showToast(`Opened chat with ${member.name}`);
      return;
    }

    // 2. Start new conversation
    startChatMutation.mutate({
      receiverId: memberId,
      receiverName: member.name || member.fullName || 'Member',
      receiverEmail: member.email || '',
      receiverAvatar: member.avatar || member.image || null,
    });
  };

  // Filtered members in "Start New Chat" modal
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return membersList;
    const q = memberSearchQuery.toLowerCase();
    return membersList.filter((m) => {
      const name = (m.name || m.fullName || '').toLowerCase();
      const company = (m.companyName || m.firmName || m.businessName || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const membershipId = (m.membershipId || String(m.id || '')).toLowerCase();
      const phone = (m.phone || m.mobile || '').toLowerCase();
      return (
        name.includes(q) ||
        company.includes(q) ||
        email.includes(q) ||
        membershipId.includes(q) ||
        phone.includes(q)
      );
    });
  }, [membersList, memberSearchQuery]);

  // Helper to extract member info from any conversation structure
  const extractMemberFromConv = (conv) => {
    if (!conv) return null;
    if (conv.participantDetails?.member) return conv.participantDetails.member;
    const pd = conv.participantDetails;
    if (pd && typeof pd === 'object') {
      for (const [key, val] of Object.entries(pd)) {
        if (!val || typeof val !== 'object') continue;
        if (
          key !== '12' &&
          key !== '1' &&
          key !== '22' &&
          val.role !== 'admin' &&
          String(val.id) !== '12' &&
          String(val.id) !== '22'
        ) {
          return {
            memberId: String(val.memberId || val.id || key),
            name: val.name || val.fullName || 'Member',
            email: val.email || '',
            role: 'member',
            avatar: val.avatar || null,
          };
        }
      }
    }
    return null;
  };

  // Current active member details
  const activeMember = useMemo(() => {
    if (!activeId && activeId !== 0) return null;
    const fromActive = extractMemberFromConv(activeChat);
    if (fromActive) return fromActive;
    const targetConv = conversations.find((c) => String(c.id) === String(activeId));
    const fromConv = extractMemberFromConv(targetConv);
    if (fromConv) return fromConv;
    return null;
  }, [activeId, activeChat, conversations]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900/90 text-white px-4 py-2.5 text-sm shadow-xl backdrop-blur transition-all animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Top Header Bar with Back to Dashboard Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs group"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Chat & Member Messaging</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF1FF] text-[#2832A4]">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-215px)] min-h-[560px]">
        {/* ================================================================= */}
        {/* LEFT PANEL: Conversation List                                    */}
        {/* ================================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-slate-200/90 bg-white transition-all ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/admin/dashboard')}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="p-2 rounded-xl bg-[#EEF1FF] text-[#2832A4]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ink">Member Chats</h2>
                  <p className="text-[11px] text-slate-500">Direct messaging</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EEF1FF] text-[#2832A4]">
                {conversations.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 focus:border-[#2832A4] transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* Show skeleton ONLY on very initial load when zero data is in cache */}
            {isConversationsLoading && conversations.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No conversations found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Try clearing your search query.' : 'Click "Start New Chat" below to message a member.'}
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const member = conv.participantDetails?.member || {};
                const isSelected = String(conv.id) === String(activeId);
                const lastMsg =
                  (isSelected && activeMessages.length > 0
                    ? activeMessages[activeMessages.length - 1]
                    : null) || conv.lastMessage;
                const rawUnread =
                  conv.unreadCounts?.['12'] ??
                  conv.unreadCounts?.['22'] ??
                  conv.unreadCounts?.admin ??
                  0;
                const unread = isSelected ? 0 : Number(rawUnread || 0);
                const isAdminLastSender =
                  lastMsg?.senderRole === 'admin' ||
                  String(lastMsg?.senderId) === '12' ||
                  String(lastMsg?.senderId) === '22' ||
                  !!lastMsg?.admin;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3.5 sm:p-4 flex items-start gap-3 transition-colors relative group cursor-pointer ${
                      isSelected
                        ? 'bg-white shadow-2xs font-medium'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    {/* Active Left Border Line Indicator */}
                    {isSelected && (
                      <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2832A4] rounded-r z-10" />
                    )}

                    {/* Member Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar
                        name={member.name || 'Member'}
                        src={getChatAvatarUrl(member.avatar)}
                        size="md"
                        className="ring-2 ring-white shadow-sm"
                      />
                      {/* Online dot indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    {/* Member Info & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-[#2832A4]' : 'text-slate-800'
                            }`}
                          >
                            {member.name || 'Member'}
                          </span>
                          {member.memberId && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 flex-shrink-0">
                              #{member.memberId}
                            </span>
                          )}
                        </div>
                        {lastMsg?.createdAt && (
                          <span className="text-[11px] text-slate-400 flex-shrink-0 ml-1">
                            {lastMsg.createdAt.split(' ')[1] || lastMsg.createdAt}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs text-slate-500 truncate leading-relaxed flex-1">
                          {isAdminLastSender && (
                            <span className="font-medium text-slate-700">You: </span>
                          )}
                          {lastMsg?.text && lastMsg.text !== '[Attachment]'
                            ? lastMsg.text
                            : (lastMsg?.mediaUrl || lastMsg?.messageType === 'image' ? '📷 Photo' : 'Started chat')}
                        </p>

                        {/* Unread badge */}
                        {!isSelected && unread > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2832A4] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-dots Menu Button on Hover */}
                    <div
                      className="relative flex-shrink-0 self-center"
                      data-chat-menu
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((prev) => (prev === conv.id ? null : conv.id));
                        }}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all ${
                          menuOpenId === conv.id
                            ? 'opacity-100 bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                        title="Chat options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpenId === conv.id && (
                        <div
                          className="absolute right-0 top-8 z-30 w-36 rounded-xl bg-white p-1 shadow-xl ring-1 ring-slate-900/10 border border-slate-100 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(null);
                              setChatToDelete(conv);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Chat</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom: Start New Chat Button */}
          <div className="p-3.5 border-t border-slate-200/90 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2832A4] hover:bg-[#1E2580] text-white text-xs sm:text-sm font-semibold transition shadow-sm active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Start New Chat</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANEL: Chat View Area                                      */}
        {/* ================================================================= */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/30 min-w-0 transition-all ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeId && activeMember ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200/90 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button to return to member list / close conversation view */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileChat(false);
                      updateActiveId(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs group"
                    title="Back to member list"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back</span>
                  </button>

                  <div className="relative flex-shrink-0">
                    <Avatar
                      name={activeMember.name || 'Member'}
                      src={getChatAvatarUrl(activeMember.avatar)}
                      size="md"
                      className="ring-2 ring-slate-100"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {activeMember.name || 'Member'}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Now
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                      {activeMember.email && (
                        <span className="truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {activeMember.email}
                        </span>
                      )}
                      {activeMember.memberId && (
                        <span className="font-medium text-slate-600">
                          (ID: {activeMember.memberId})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      refetchActiveChat();
                      refetchConversations();
                    }}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                    title="Refresh chat"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChatToDelete(activeChat);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Show spinner ONLY on initial empty load, never during background updates */}
                {isActiveChatLoading && activeMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-[#2832A4] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">Loading messages...</p>
                    </div>
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                    <MessageCircle className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No messages yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Send a message to {activeMember.name} to start the conversation.
                    </p>
                  </div>
                ) : (
                  <>
                    {activeMessages.map((msg, index) => {
                      const currentDateKey = getMessageDateKey(msg.createdAt);
                      const prevDateKey =
                        index > 0 ? getMessageDateKey(activeMessages[index - 1].createdAt) : null;
                      const showDateSeparator = index === 0 || currentDateKey !== prevDateKey;
                      const dateLabel = formatMessageDateLabel(msg.createdAt);

                      const isAdmin =
                        msg.senderRole === 'admin' ||
                        String(msg.senderId) === '12' ||
                        String(msg.senderId) === '22' ||
                        !!msg.admin ||
                        msg.senderName?.toLowerCase().includes('admin');

                      return (
                        <div key={msg.id || index} className="space-y-3">
                          {/* Centered Date Separator (e.g. "Today" in center) */}
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-3">
                              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/90 text-slate-600 shadow-2xs tracking-wide">
                                {dateLabel}
                              </span>
                            </div>
                          )}

                          {/* Message Row */}
                          <div
                            className={`flex items-end gap-2 relative group ${
                              isAdmin ? 'justify-end' : 'justify-start'
                            }`}
                          >
                          {/* Member Avatar beside member messages */}
                          {!isAdmin && (
                            <div className="flex-shrink-0 mb-1">
                              <Avatar
                                name={msg.senderName || activeMember.name}
                                src={getChatAvatarUrl(msg.senderAvatar || activeMember.avatar)}
                                size="sm"
                                className="ring-1 ring-slate-200"
                              />
                            </div>
                          )}

                          {/* Hover Action Bar: Edit & Delete Icons */}
                          {editingMessageId !== msg.id && (
                            <div
                              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl px-1.5 py-1 shadow-md z-10 self-center ${
                                isAdmin ? 'order-first mr-1' : 'order-last ml-1'
                              }`}
                            >
                              {/* Edit button: Only for own sent messages (never on receiver messages) */}
                              {isAdmin && msg.text && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(msg)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                                  title="Edit message"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handlePromptDeleteMessage(msg)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Delete message"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-xs transition ${
                              isAdmin
                                ? 'bg-[#2832A4] text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                            }`}
                          >
                            {/* Sender Name in Member message */}
                            {!isAdmin && (
                              <p className="text-[11px] font-semibold text-slate-600 mb-1">
                                {msg.senderName || activeMember.name}
                              </p>
                            )}

                            {/* Media Attachment if present */}
                            {msg.mediaUrl && (
                              <div className="mb-2 overflow-hidden rounded-xl bg-black/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={getChatAvatarUrl(msg.mediaUrl)}
                                  alt="Attachment"
                                  className="max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition"
                                  onClick={() => window.open(getChatAvatarUrl(msg.mediaUrl), '_blank')}
                                />
                              </div>
                            )}

                            {/* Text message or Inline Edit Mode */}
                            {editingMessageId === msg.id ? (
                              <div className="space-y-2 min-w-[220px] sm:min-w-[280px]">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEdit(msg);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  className="w-full text-xs sm:text-sm bg-white text-slate-900 rounded-xl p-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/30 shadow-xs resize-none"
                                  rows={2}
                                  autoFocus
                                />
                                <div className="flex items-center justify-end gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                                      isAdmin ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    }`}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!editingText.trim() || editMessageMutation.isPending}
                                    onClick={() => handleSaveEdit(msg)}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1 shadow-2xs disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              msg.text && msg.text !== '[Attachment]' && (
                                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                                  {msg.text}
                                </p>
                              )
                            )}

                            {/* Bubble Footer: Timestamp & Read Status */}
                            <div
                              className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${
                                isAdmin ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              {msg.isEdited && (
                                <span className="italic text-[9px] opacity-75">(edited)</span>
                              )}
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isAdmin && (
                                <span title={msg.isRead ? 'Seen' : 'Delivered'}>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-sky-200 inline" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-white/70 inline" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Attachment Preview (if selected) */}
              {selectedFile && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {filePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end gap-2"
              >
                {/* Hidden File Picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />

                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex-shrink-0"
                  title="Attach image or file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Message Textarea */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${activeMember.name || 'member'}... (Enter to send)`}
                    className="w-full resize-none max-h-32 min-h-[42px] px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 focus:border-[#2832A4] transition placeholder:text-slate-400"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !selectedFile) || sendMessageMutation.isPending}
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#2832A4] hover:bg-[#1E2580] disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="p-4 rounded-3xl bg-[#EEF1FF] text-[#2832A4] mb-4">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No conversation selected</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                Choose a member from the left list or click "Start New Chat" to begin a conversation.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2832A4] text-white hover:bg-[#1E2580] text-xs sm:text-sm font-semibold transition shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Start New Chat</span>
                </button>
                {/* <button
                  type="button"
                  onClick={() => router.push('/admin/dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* START NEW CHAT MODAL (MEMBER DIRECTORY & SELECTION)               */}
      {/* ================================================================= */}
      <Modal
        open={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start New Chat"
        maxWidth="max-w-xl"
      >
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <p className="text-xs sm:text-sm text-slate-500">
              Select an association member from the directory to start a direct chat conversation.
            </p>
          </div>

          {/* Member Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, company, email, or member ID..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 focus:border-[#2832A4] transition placeholder:text-slate-400"
            />
            {memberSearchQuery && (
              <button
                type="button"
                onClick={() => setMemberSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Members List Container */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white">
            {isMembersLoading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2">
                <div className="w-7 h-7 border-2 border-[#2832A4] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading association members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No members found</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {memberSearchQuery ? 'Try matching a different keyword.' : 'No members available in directory.'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const memberId = String(member.id || member.memberId);
                const hasExistingChat = conversations.some((c) => {
                  const m = c.participantDetails?.member;
                  return (
                    String(m?.memberId || m?.id) === memberId ||
                    (m?.email && member.email && m.email.toLowerCase() === member.email.toLowerCase())
                  );
                });
                const isCreating = startChatMutation.isPending;

                return (
                  <div
                    key={member.id || member.membershipId}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={member.name || member.fullName || 'Member'}
                        src={getChatAvatarUrl(member.avatar || member.image)}
                        size="md"
                        className="ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {member.name || member.fullName || 'Member'}
                          </h4>
                          {member.membershipId && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EEF1FF] text-[#2832A4] border border-[#2832A4]/20 flex-shrink-0">
                              {member.membershipId}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5 truncate">
                          {(member.companyName || member.firmName || member.businessName) && (
                            <span className="flex items-center gap-1 truncate text-slate-600 font-medium">
                              <Building className="w-3 h-3 text-slate-400" />
                              {member.companyName || member.firmName || member.businessName}
                            </span>
                          )}
                          {member.email && (
                            <span className="truncate flex items-center gap-1 text-slate-400">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={() => handleSelectMemberForChat(member)}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-[0.98] ${
                        hasExistingChat
                          ? 'bg-[#EEF1FF] text-[#2832A4] hover:bg-[#2832A4] hover:text-white border border-[#2832A4]/20'
                          : 'bg-[#2832A4] text-white hover:bg-[#1E2580] shadow-2xs'
                      }`}
                    >
                      {isCreating ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : hasExistingChat ? (
                        <>
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Open Chat</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Start Chat</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ================================================================= */}
      {/* DELETE CONVERSATION CONFIRMATION MODAL                            */}
      {/* ================================================================= */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setChatToDelete(null);
        }}
        title="Delete Conversation"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Are you sure?</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                This will delete the entire conversation with{' '}
                <span className="font-semibold text-slate-700">
                  {chatToDelete?.participantDetails?.member?.name || activeMember?.name || 'this member'}
                </span>
                . This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setChatToDelete(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteChatMutation.isPending}
              onClick={handleDeleteConversation}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {deleteChatMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Chat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ================================================================= */}
      {/* DELETE MESSAGE CONFIRMATION MODAL                                 */}
      {/* ================================================================= */}
      <Modal
        open={isDeleteMsgModalOpen}
        onClose={() => {
          setIsDeleteMsgModalOpen(false);
          setDeletingMessage(null);
        }}
        title="Delete Message"
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Delete this message?</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                This message will be permanently removed from this conversation.
              </p>
            </div>
          </div>

          {deletingMessage?.text && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic truncate max-h-16">
              &ldquo;{deletingMessage.text}&rdquo;
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsDeleteMsgModalOpen(false);
                setDeletingMessage(null);
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteMessageMutation.isPending}
              onClick={handleConfirmDeleteMessage}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-sm disabled:opacity-50"
            >
              {deleteMessageMutation.isPending ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
