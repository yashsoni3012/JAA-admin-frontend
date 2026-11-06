'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Users,
  CheckCircle2,
  X,
  Phone,
  Building,
  Mail,
  Eye,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { CommitteeSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import AddPositionModal from '@/components/committee/AddPositionModal';
import AssignMemberModal from '@/components/committee/AssignMemberModal';
import DeletePositionModal from '@/components/committee/DeletePositionModal';
import {
  getCommittees,
  getAllMembers,
  createPosition,
  deletePosition,
  addMemberToPosition,
  removeMemberFromPosition,
  getMediaUrl,
} from '@/services/committee.service';
import { cn } from '@/lib/utils';

export default function CommitteePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Single active expanded position for focused view & blur effect
  const [expandedId, setExpandedId] = useState(null);

  // Modal States
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [assigningPosition, setAssigningPosition] = useState(null);
  const [deletingPosition, setDeletingPosition] = useState(null);
  const [removingMemberData, setRemovingMemberData] = useState(null);

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // TanStack Query for Committee Positions
  const {
    data: committeeData,
    isLoading,
  } = useQuery({
    queryKey: ['committee', { debouncedSearch }],
    queryFn: () => getCommittees({ search: debouncedSearch }),
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
  });

  const committees = committeeData?.committees || [];

  // Active focused position for the centered members popup
  const activePosition = useMemo(() => {
    if (!expandedId) return null;
    return committees.find((c) => c.id === expandedId) || null;
  }, [committees, expandedId]);

  const activeMembers = activePosition?.members || [];

  // TanStack Query for Members Directory (cached longer: 5 mins)
  const {
    data: membersList = [],
    isLoading: isFetchingMembers,
  } = useQuery({
    queryKey: ['committee-members-directory'],
    queryFn: getAllMembers,
    staleTime: 1000 * 60 * 5,
  });

  const invalidateCommittees = () => {
    queryClient.invalidateQueries({ queryKey: ['committee'] });
  };

  // Build a lookup map of members for instant details enrichment
  const membersMap = useMemo(() => {
    const map = new Map();
    membersList.forEach((m) => {
      if (m.id !== undefined) map.set(Number(m.id), m);
      if (m.memberId !== undefined) map.set(Number(m.memberId), m);
    });
    return map;
  }, [membersList]);

  // Toggle accordion expand / collapse (one position focused at a time with blur on others)
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Handle Create Position
  const handleCreatePosition = async (positionName) => {
    const created = await createPosition(positionName);
    showToast(`Position "${positionName}" created successfully!`);
    invalidateCommittees();
    if (created?.id) {
      setExpandedId(created.id);
    }
  };

  // Handle Delete Position
  const handleDeletePositionConfirm = async () => {
    if (!deletingPosition) return;
    await deletePosition(deletingPosition.id);
    showToast(`Position "${deletingPosition.position}" deleted successfully.`);
    if (expandedId === deletingPosition.id) {
      setExpandedId(null);
    }
    setDeletingPosition(null);
    invalidateCommittees();
  };

  // Handle Assign Member to Position
  const handleAssignMember = async (positionId, memberId) => {
    const targetPos = committees.find((c) => c.id === positionId);
    const existing = targetPos?.members || [];
    await addMemberToPosition(positionId, existing, memberId);
    showToast('Member assigned to position successfully!');
    invalidateCommittees();
    setExpandedId(positionId);
  };

  // Handle Remove Member from Position
  const handleRemoveMemberConfirm = async () => {
    if (!removingMemberData) return;
    const { positionId, memberId } = removingMemberData;
    const targetPos = committees.find((c) => c.id === positionId);
    const existing = targetPos?.members || [];
    await removeMemberFromPosition(positionId, existing, memberId);
    showToast('Member removed from position successfully.');
    setRemovingMemberData(null);
    invalidateCommittees();
  };

  // Client-side search fallback
  const filteredCommittees = useMemo(() => {
    if (!debouncedSearch.trim()) return committees;
    const q = debouncedSearch.toLowerCase().trim();
    return committees.filter((item) => {
      const posTitle = (item.position || item.name || '').toLowerCase();
      const posMatches = posTitle.includes(q);
      const memberMatches = item.members?.some((m) => {
        const rawId = m.memberId || m.id;
        const enriched = membersMap.get(Number(rawId)) || {};
        const memberName = (m.name || enriched.name || '').toLowerCase();
        const business = (m.business || enriched.business || enriched.businessName || '').toLowerCase();
        const mobile = (m.mobile || enriched.mobile || enriched.phone || '').toLowerCase();
        return (
          memberName.includes(q) ||
          business.includes(q) ||
          mobile.includes(q)
        );
      });
      return posMatches || memberMatches;
    });
  }, [committees, debouncedSearch, membersMap]);

  // Prevent background scrolling and close on Escape when popup is open
  useEffect(() => {
    if (!expandedId) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpandedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = orig;
    };
  }, [expandedId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1B1F3B] text-white px-5 py-3.5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Committee Card */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6 relative">
        {/* Search Bar & Add Position Button in ONE Equal Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by position or member name..."
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-11 pr-10 text-xs sm:text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full transition"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Add Position Button with equal h-10 height */}
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddPositionOpen(true)}
            className="h-10 inline-flex items-center gap-2 rounded-full px-6 text-xs sm:text-sm font-bold shadow-md shadow-[#2832A4]/25 shrink-0 self-end sm:self-auto"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Position</span>
          </Button>
        </div>

        {/* Positions Accordion List */}
        {isLoading && committees.length === 0 ? (
          <CommitteeSkeleton rows={3} />
        ) : filteredCommittees.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No committee positions found"
              description="Click 'Add Position' above to create your first committee role."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommittees.map((pos) => {
              const members = pos.members || [];
              const isSelected = expandedId === pos.id;

              return (
                <div
                  key={pos.id}
                  onClick={() => setExpandedId(pos.id)}
                  className={cn(
                    'rounded-2xl border bg-white shadow-xs hover:border-[#2832A4]/40 hover:shadow-sm transition-all overflow-hidden cursor-pointer',
                    isSelected ? 'border-[#2832A4] ring-2 ring-[#2832A4]/10' : 'border-slate-200/80'
                  )}
                >
                  {/* Position Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 bg-[#F8FAFC] hover:bg-slate-100/70 select-none transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2832A4]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-ink">
                          {pos.position}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          {members.length} {members.length === 1 ? 'Member' : 'Members'} Assigned
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* View Details Eye Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(pos.id);
                        }}
                        title="View Position Details"
                        aria-label="View Position Details"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 stroke-[2]" />
                      </button>

                      {/* + Add Member Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningPosition(pos);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#2832A4] bg-white px-3 sm:px-4 py-1.5 text-xs font-semibold text-[#2832A4] hover:bg-blue-50 transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Member</span>
                      </Button>

                      {/* Delete Position Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPosition(pos);
                        }}
                        title="Delete Position"
                        aria-label="Delete Position"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 stroke-[2]" />
                      </button>

                      {/* Chevron Open Members Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(pos.id);
                        }}
                        title="View position members in popup"
                        aria-label="View position members in popup"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-[#2832A4] transition cursor-pointer"
                      >
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Centered Position Members Popup Modal with Transparent Blur */}
      {activePosition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-[4px] cursor-pointer"
          onClick={() => setExpandedId(null)}
          title="Click backdrop to close"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[88vh] bg-white rounded-3xl shadow-2xl border-2 border-[#2832A4]/35 ring-4 ring-[#2832A4]/10 overflow-hidden flex flex-col cursor-default animate-in fade-in zoom-in-[0.98] duration-150"
          >
            {/* Modal Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 sm:py-4 bg-[#F8FAFC] border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2832A4] text-white shadow-xs">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-ink">
                      {activePosition.position}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2832A4] text-white">
                      Active View
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {activeMembers.length} {activeMembers.length === 1 ? 'Member' : 'Members'} Assigned
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* + Add Member Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssigningPosition(activePosition)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2832A4] bg-white px-3 sm:px-4 py-1.5 text-xs font-semibold text-[#2832A4] hover:bg-blue-50 transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Member</span>
                </Button>

                {/* Delete Position Icon Button */}
                <button
                  type="button"
                  onClick={() => setDeletingPosition(activePosition)}
                  title="Delete Position"
                  aria-label="Delete Position"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 stroke-[2]" />
                </button>

                {/* Close Popup Button */}
                <button
                  type="button"
                  onClick={() => setExpandedId(null)}
                  title="Close popup"
                  aria-label="Close popup"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition active:scale-95 cursor-pointer ml-1"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modal Body: Instant Table View List */}
            <div className="p-4 sm:p-6 bg-white overflow-y-auto max-h-[calc(88vh-85px)] space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Position Members
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#2832A4]">
                    {activeMembers.length} {activeMembers.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </div>

              {activeMembers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2832A4] mb-3">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-ink">
                    No members assigned to this position yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Assign registered association members to represent this position.
                  </p>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setAssigningPosition(activePosition)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Assign Member</span>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-[#F4F7FF] text-slate-500 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10">
                        <th className="py-3.5 pl-5 pr-3 text-center w-12">#</th>
                        <th className="py-3.5 px-4">MEMBER</th>
                        <th className="py-3.5 px-4">BUSINESS</th>
                        <th className="py-3.5 px-4">CONTACT</th>
                        <th className="py-3.5 px-4">MEMBERSHIP ID</th>
                        <th className="py-3.5 px-4">STATUS</th>
                        <th className="py-3.5 pr-5 pl-4 text-center w-24">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {activeMembers.map((memberItem, idx) => {
                        const rawId = memberItem.memberId || memberItem.id;
                        const enriched = membersMap.get(Number(rawId)) || {};
                        const memberName = memberItem.name || enriched.name || 'Association Member';
                        const businessName = enriched.business || enriched.businessName || 'Jewellery Business';
                        const mobile = enriched.mobile || enriched.phone || '';
                        const email = enriched.email || '';
                        const membershipId = enriched.membershipId || memberItem.membershipId || '';
                        const avatarUrl = getMediaUrl(enriched.avatar || enriched.image);

                        return (
                          <tr key={rawId} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="py-3.5 pl-5 pr-3 text-xs font-bold text-slate-400 text-center">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={memberName}
                                  src={avatarUrl}
                                  size="sm"
                                  className="h-10 w-10 shrink-0 shadow-2xs"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-sm text-ink truncate">
                                    {memberName}
                                  </div>
                                  <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                    {activePosition.position}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                                <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[200px]">{businessName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1 text-xs">
                                {mobile ? (
                                  <a
                                    href={`tel:${mobile}`}
                                    className="flex items-center gap-1.5 text-slate-700 hover:text-[#2832A4] font-medium transition truncate"
                                  >
                                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span>{mobile}</span>
                                  </a>
                                ) : null}
                                {email ? (
                                  <a
                                    href={`mailto:${email}`}
                                    className="flex items-center gap-1.5 text-slate-500 hover:text-[#2832A4] transition truncate text-[11px]"
                                  >
                                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[180px]">{email}</span>
                                  </a>
                                ) : null}
                                {!mobile && !email && (
                                  <span className="text-slate-400 text-xs">-</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {membershipId ? (
                                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
                                  {membershipId}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            </td>
                            <td className="py-3.5 pr-5 pl-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRemovingMemberData({
                                    positionId: activePosition.id,
                                    positionName: activePosition.position,
                                    memberId: rawId,
                                    memberName,
                                  });
                                }}
                                title="Remove member from position"
                                aria-label="Remove member from position"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 stroke-[2]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Position Modal matching Image 2 */}
      <AddPositionModal
        open={isAddPositionOpen}
        onClose={() => setIsAddPositionOpen(false)}
        onCreated={handleCreatePosition}
      />

      {/* Assign Member to Position Modal matching Image 3 */}
      <AssignMemberModal
        open={Boolean(assigningPosition)}
        position={assigningPosition}
        membersList={membersList}
        isLoadingMembers={isFetchingMembers}
        onClose={() => setAssigningPosition(null)}
        onAssign={handleAssignMember}
      />

      {/* Delete Position Confirmation Modal */}
      <DeletePositionModal
        open={Boolean(deletingPosition)}
        title="Delete Position"
        description={
          deletingPosition
            ? `Are you sure you want to delete the "${deletingPosition.position}" position? All member assignments under this position will be cleared.`
            : ''
        }
        confirmLabel="Delete"
        onClose={() => setDeletingPosition(null)}
        onConfirm={handleDeletePositionConfirm}
      />

      {/* Remove Member Confirmation Modal matching Image 4 */}
      <DeletePositionModal
        open={Boolean(removingMemberData)}
        title="Remove Member"
        description={
          removingMemberData
            ? `Are you sure you want to remove "${removingMemberData.memberName}" from the ${removingMemberData.positionName} position?`
            : ''
        }
        confirmLabel="Delete"
        onClose={() => setRemovingMemberData(null)}
        onConfirm={handleRemoveMemberConfirm}
      />
    </div>
  );
}
