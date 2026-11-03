'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, X } from 'lucide-react';
import BroadcastListView from '@/components/broadcast/BroadcastListView';
import CreateBroadcastView from '@/components/broadcast/CreateBroadcastView';
import ViewBroadcastModal from '@/components/broadcast/ViewBroadcastModal';
import DeleteBroadcastModal from '@/components/broadcast/DeleteBroadcastModal';
import GroupsListView from '@/components/groups/GroupsListView';
import CreateGroupView from '@/components/groups/CreateGroupView';
import GroupDetailsView from '@/components/groups/GroupDetailsView';
import DeleteGroupModal from '@/components/groups/DeleteGroupModal';
import EditGroupModal from '@/components/groups/EditGroupModal';
import SendGroupBroadcastModal from '@/components/groups/SendGroupBroadcastModal';
import AddGroupMembersModal from '@/components/groups/AddGroupMembersModal';
import {
  getBroadcasts,
  createBroadcast,
  deleteBroadcast,
} from '@/services/broadcast.service';
import {
  getGroups,
  createGroup,
  updateGroup,
  toggleGroupStatus,
  deleteGroup,
} from '@/services/group.service';

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read tab directly and reactively from URL:
  // /admin/messages?tab=group -> GROUP_MESSAGE (Image 1: Groups List)
  // /admin/messages or /admin/messages?tab=broadcast -> BROADCAST (Broadcast List)
  const tab = searchParams.get('tab');
  const isGroupTab = tab === 'group' || tab === 'groups' || tab === 'group_message';
  const activeModule = isGroupTab ? 'GROUP_MESSAGE' : 'BROADCAST';

  // ==========================================
  // 1. BROADCAST MODULE STATE
  // ==========================================
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastPagination, setBroadcastPagination] = useState({
    total: 0,
    total_items: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isBroadcastLoading, setIsBroadcastLoading] = useState(true);
  const [isBroadcastFetching, setIsBroadcastFetching] = useState(false);
  const [broadcastSearch, setBroadcastSearch] = useState('');
  const [debouncedBroadcastSearch, setDebouncedBroadcastSearch] = useState('');
  const [broadcastPage, setBroadcastPage] = useState(1);
  const [broadcastPageSize, setBroadcastPageSize] = useState(10);

  // Broadcast Sub-View: 'LIST' | 'CREATE' (Matches user request for full page create view instead of modal)
  const actionParam = searchParams.get('action');
  const [broadcastView, setBroadcastView] = useState(
    actionParam === 'create' ? 'CREATE' : 'LIST'
  );

  // Sync action query param to broadcast view if present
  useEffect(() => {
    if (actionParam === 'create') {
      setBroadcastView('CREATE');
    }
  }, [actionParam]);

  // Broadcast Modals
  const [viewingBroadcast, setViewingBroadcast] = useState(null);
  const [deletingBroadcast, setDeletingBroadcast] = useState(null);

  // ==========================================
  // 2. GROUP MODULE STATE
  // ==========================================
  const [groupView, setGroupView] = useState('LIST'); // 'LIST' | 'CREATE' | 'DETAILS'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupPagination, setGroupPagination] = useState({
    total: 0,
    total_items: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [isGroupFetching, setIsGroupFetching] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [debouncedGroupSearch, setDebouncedGroupSearch] = useState('');
  const [groupPage, setGroupPage] = useState(1);
  const [groupPageSize, setGroupPageSize] = useState(10);

  // Group Modals
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [broadcastToGroup, setBroadcastToGroup] = useState(null);
  const [addMembersGroup, setAddMembersGroup] = useState(null);

  // Global Toast
  const [toast, setToast] = useState(null);

  // Broadcast Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBroadcastSearch(broadcastSearch);
      setBroadcastPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [broadcastSearch]);

  // Group Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGroupSearch(groupSearch);
      setGroupPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [groupSearch]);

  // Load Broadcasts from API / Service
  const loadBroadcasts = useCallback(
    async (targetPage = 1, targetSize = 10, targetSearch = '') => {
      setIsBroadcastFetching(true);
      try {
        const res = await getBroadcasts({
          page: targetPage,
          limit: targetSize,
          search: targetSearch,
        });
        setBroadcasts(res.broadcasts || []);
        setBroadcastPagination(res.pagination || {});
      } catch (err) {
        console.warn('Failed to load broadcasts:', err.message);
      } finally {
        setIsBroadcastLoading(false);
        setIsBroadcastFetching(false);
      }
    },
    []
  );

  // Load Groups from API / Service
  const loadGroups = useCallback(
    async (targetPage = 1, targetSize = 10, targetSearch = '') => {
      setIsGroupFetching(true);
      try {
        const res = await getGroups({
          page: targetPage,
          limit: targetSize,
          search: targetSearch,
        });
        setGroups(res.groups || []);
        setGroupPagination(res.pagination || {});
      } catch (err) {
        console.warn('Failed to load groups:', err.message);
      } finally {
        setIsGroupLoading(false);
        setIsGroupFetching(false);
      }
    },
    []
  );

  // Load data based on active module
  useEffect(() => {
    if (activeModule === 'BROADCAST') {
      loadBroadcasts(broadcastPage, broadcastPageSize, debouncedBroadcastSearch);
    } else {
      loadGroups(groupPage, groupPageSize, debouncedGroupSearch);
    }
  }, [
    activeModule,
    loadBroadcasts,
    broadcastPage,
    broadcastPageSize,
    debouncedBroadcastSearch,
    loadGroups,
    groupPage,
    groupPageSize,
    debouncedGroupSearch,
  ]);

  // Synchronize Top Header Title (Messages, Groups, Group Details)
  useEffect(() => {
    let title = 'Messages';
    if (activeModule === 'GROUP_MESSAGE') {
      if (groupView === 'LIST') {
        title = 'Groups';
      } else if (groupView === 'CREATE' || groupView === 'DETAILS') {
        title = 'Group Details';
      }
    } else {
      title = 'Messages';
    }

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('jaa:set-page-title', { detail: title })
        );
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('jaa:set-page-title', { detail: null })
        );
      }
    };
  }, [activeModule, groupView]);

  // Handle Broadcast Created
  const handleBroadcastCreated = (created, message) => {
    setBroadcasts((prev) => [created, ...prev]);
    setToast(message || 'Broadcast created successfully!');
    setTimeout(() => setToast(null), 4500);
  };

  // Handle Broadcast Deleted
  const handleDeleteBroadcast = async (broadcastId) => {
    try {
      await deleteBroadcast(broadcastId);
      setBroadcasts((prev) => prev.filter((b) => b.id !== broadcastId));
      setToast('Broadcast deleted successfully.');
      setTimeout(() => setToast(null), 4000);
      setDeletingBroadcast(null);
    } catch (err) {
      setToast(err.message || 'Failed to delete broadcast');
      setTimeout(() => setToast(null), 4000);
      throw err;
    }
  };

  // Handle Group Created
  const handleGroupCreated = async (groupData) => {
    try {
      const created = await createGroup(groupData);
      setToast(`Group "${created.name}" created successfully!`);
      setTimeout(() => setToast(null), 4500);
      setGroupView('LIST');
      loadGroups(1, groupPageSize, debouncedGroupSearch);
    } catch (err) {
      throw err;
    }
  };

  // Handle Group Updated
  const handleGroupUpdated = async (updates) => {
    if (!editingGroup) return;
    try {
      const updated = await updateGroup(editingGroup.id, updates);
      setGroups((prev) =>
        prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g))
      );
      if (selectedGroup && selectedGroup.id === updated.id) {
        setSelectedGroup(updated);
      }
      setToast(`Group "${updated.name}" updated successfully.`);
      setTimeout(() => setToast(null), 4500);
      setEditingGroup(null);
    } catch (err) {
      throw err;
    }
  };

  // Handle Group Status Toggle
  const handleToggleStatus = async (groupId) => {
    try {
      const updated = await toggleGroupStatus(groupId);
      setGroups((prev) =>
        prev.map((g) => (g.id === updated.id ? { ...g, status: updated.status } : g))
      );
      if (selectedGroup && selectedGroup.id === updated.id) {
        setSelectedGroup((prev) => ({ ...prev, status: updated.status }));
      }
      setToast(`Group status updated to ${updated.status ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast(err.message || 'Failed to update status');
      setTimeout(() => setToast(null), 4000);
      throw err;
    }
  };

  // Handle Delete Group
  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (selectedGroup && selectedGroup.id === groupId) {
        setSelectedGroup(null);
        setGroupView('LIST');
      }
      setToast('Group deleted successfully.');
      setTimeout(() => setToast(null), 4500);
      setDeletingGroup(null);
      loadGroups(groupPage, groupPageSize, debouncedGroupSearch);
    } catch (err) {
      setToast(err.message || 'Failed to delete group');
      setTimeout(() => setToast(null), 4500);
      throw err;
    }
  };

  // Handle Broadcast Sent to Group
  const handleBroadcastSentToGroup = async (broadcast) => {
    if (!broadcastToGroup) return;
    try {
      let createdBroadcast = broadcast;
      if (!createdBroadcast || !createdBroadcast.id) {
        createdBroadcast = await createBroadcast({
          title: broadcast.title,
          broadcastTitle: broadcast.title,
          message: broadcast.message,
          sendTo: broadcastToGroup.name,
          sentTo: broadcastToGroup.name,
          status: 'Delivered',
          group_id: {
            id: broadcastToGroup.id,
            name: broadcastToGroup.name,
          },
          createdBy: 'Admin User',
        });
      }

      const updatedRecent = [createdBroadcast, ...(broadcastToGroup.recentBroadcasts || []).filter(b => b.id !== createdBroadcast.id)];
      setGroups((prev) =>
        prev.map((g) =>
          g.id === broadcastToGroup.id ? { ...g, recentBroadcasts: updatedRecent } : g
        )
      );
      if (selectedGroup && selectedGroup.id === broadcastToGroup.id) {
        setSelectedGroup((prev) => ({ ...prev, recentBroadcasts: updatedRecent }));
      }
      setBroadcasts((prev) => [createdBroadcast, ...prev.filter((b) => b.id !== createdBroadcast.id)]);
      setToast(`Broadcast "${createdBroadcast.title}" sent successfully!`);
      setTimeout(() => setToast(null), 4500);
      setBroadcastToGroup(null);
    } catch (err) {
      throw err;
    }
  };

  // Handle Members Added to Group
  const handleMembersAdded = async (addedMembers) => {
    if (!addMembersGroup) return;
    try {
      const existing = addMembersGroup.members || [];
      const newTotal = existing.length + addedMembers.length;
      await updateGroup(addMembersGroup.id, {
        members: [...existing, ...addedMembers],
        memberCount: newTotal,
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === addMembersGroup.id ? { ...g, memberCount: newTotal } : g
        )
      );
      if (selectedGroup && selectedGroup.id === addMembersGroup.id) {
        setSelectedGroup((prev) => ({ ...prev, memberCount: newTotal }));
      }
      setToast(`Added ${addedMembers.length} members to ${addMembersGroup.name}!`);
      setTimeout(() => setToast(null), 4500);
      setAddMembersGroup(null);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* 1. BROADCAST MODULE                                          */}
      {/* Default view on /admin/messages (or ?tab=broadcast)          */}
      {/* broadcastView === 'LIST': Broadcast List page                */}
      {/* broadcastView === 'CREATE': Full Page (media_1793701439985) */}
      {/* ============================================================ */}
      {activeModule === 'BROADCAST' && (
        <>
          {broadcastView === 'LIST' && (
            <BroadcastListView
              broadcasts={broadcasts}
              pagination={broadcastPagination}
              isLoading={isBroadcastLoading}
              isFetching={isBroadcastFetching}
              search={broadcastSearch}
              onSearchChange={setBroadcastSearch}
              page={broadcastPage}
              pageSize={broadcastPageSize}
              onPageChange={setBroadcastPage}
              onPageSizeChange={(newSize) => {
                setBroadcastPageSize(newSize);
                setBroadcastPage(1);
              }}
              onCreateBroadcast={() => setBroadcastView('CREATE')}
              onAddGroup={() => {
                setGroupView('CREATE');
                router.push('/admin/messages?tab=group');
              }}
              onViewBroadcast={(b) => setViewingBroadcast(b)}
              onDeleteBroadcast={(b) => setDeletingBroadcast(b)}
            />
          )}

          {broadcastView === 'CREATE' && (
            <CreateBroadcastView
              onBack={() => setBroadcastView('LIST')}
              onSuccess={(created, message) => {
                handleBroadcastCreated(created, message);
                setBroadcastView('LIST');
              }}
            />
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* 2. GROUP MODULE STATE                                        */}
      {/* Shown on /admin/messages?tab=group                           */}
      {/* Matches user uploaded images: Groups List, Create, Details   */}
      {/* ============================================================ */}
      {activeModule === 'GROUP_MESSAGE' && (
        <>
          {/* Subview 1: Groups List (Image 1) */}
          {groupView === 'LIST' && (
            <GroupsListView
              groups={groups}
              pagination={groupPagination}
              isLoading={isGroupLoading}
              isFetching={isGroupFetching}
              search={groupSearch}
              onSearchChange={setGroupSearch}
              page={groupPage}
              pageSize={groupPageSize}
              onPageChange={setGroupPage}
              onPageSizeChange={(newSize) => {
                setGroupPageSize(newSize);
                setGroupPage(1);
              }}
              onAddGroup={() => setGroupView('CREATE')}
              onAddMessage={() => {
                setBroadcastView('CREATE');
                router.push('/admin/messages?tab=broadcast');
              }}
              onViewGroup={(group) => {
                setSelectedGroup(group);
                setGroupView('DETAILS');
              }}
              onEditGroup={(group) => setEditingGroup(group)}
              onDeleteGroup={(group) => setDeletingGroup(group)}
            />
          )}

          {/* Subview 2: Create Group (Image 2) */}
          {groupView === 'CREATE' && (
            <CreateGroupView
              onBack={() => setGroupView('LIST')}
              onGroupCreated={handleGroupCreated}
            />
          )}

          {/* Subview 3: Group Details (Image 3) */}
          {groupView === 'DETAILS' && selectedGroup && (
            <GroupDetailsView
              group={selectedGroup}
              onBack={() => setGroupView('LIST')}
              onEdit={(g) => setEditingGroup(g)}
              onDelete={(g) => setDeletingGroup(g)}
              onToggleStatus={handleToggleStatus}
              onSendBroadcast={() => setBroadcastToGroup(selectedGroup)}
              onAddMembers={() => setAddMembersGroup(selectedGroup)}
            />
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* BROADCAST MODALS                                             */}
      {/* ============================================================ */}

      {/* View Broadcast Details Modal */}
      <ViewBroadcastModal
        open={Boolean(viewingBroadcast)}
        broadcast={viewingBroadcast}
        onClose={() => setViewingBroadcast(null)}
      />

      {/* Delete Broadcast Confirmation Modal */}
      <DeleteBroadcastModal
        open={Boolean(deletingBroadcast)}
        broadcast={deletingBroadcast}
        onClose={() => setDeletingBroadcast(null)}
        onConfirm={handleDeleteBroadcast}
      />

      {/* ============================================================ */}
      {/* GROUP MODALS                                                 */}
      {/* ============================================================ */}
      {/* Delete Group Modal */}
      <DeleteGroupModal
        open={Boolean(deletingGroup)}
        group={deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroup}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        open={Boolean(editingGroup)}
        group={editingGroup}
        onClose={() => setEditingGroup(null)}
        onUpdated={handleGroupUpdated}
      />

      {/* Send Broadcast to Group Modal */}
      <SendGroupBroadcastModal
        open={Boolean(broadcastToGroup)}
        group={broadcastToGroup}
        onClose={() => setBroadcastToGroup(null)}
        onSent={handleBroadcastSentToGroup}
      />

      {/* Add Members to Group Modal */}
      <AddGroupMembersModal
        open={Boolean(addMembersGroup)}
        group={addMembersGroup}
        onClose={() => setAddMembersGroup(null)}
        onMembersAdded={handleMembersAdded}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-[#1B1F3B] px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="min-w-0 flex-1 text-xs sm:text-sm font-medium">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
