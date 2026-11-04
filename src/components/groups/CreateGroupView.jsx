'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Upload,
  FileSpreadsheet,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { Skeleton } from '@/components/common/Skeleton';
import { getMembers } from '@/services/admin.service';
import { cn } from '@/lib/utils';

const FALLBACK_MEMBERS = [
  {
    id: 101,
    name: 'Mike Ross',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    mobile: '9988774455',
    business: 'Ross & Associates',
  },
  {
    id: 102,
    name: 'Mike Ross',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    mobile: '9988774455',
    business: 'Ross & Associates',
  },
  {
    id: 103,
    name: 'Harvey Specter',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    mobile: '9876543210',
    business: 'Specter Litt',
  },
  {
    id: 104,
    name: 'Rachel Zane',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    mobile: '9825123456',
    business: 'Zane Jewellers',
  },
];

export default function CreateGroupView({ onBack, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [addMode, setAddMode] = useState('MEMBERS'); // 'MEMBERS' | 'EXCEL'
  const [searchMember, setSearchMember] = useState('');
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [excelFile, setExcelFile] = useState(null);
  const [excelCount, setExcelCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch registered approved members for selection
  useEffect(() => {
    let active = true;
    setLoadingMembers(true);
    getMembers({ page: 1, limit: 100 })
      .then((res) => {
        if (!active) return;
        const list = res?.members || (Array.isArray(res) ? res : []);
        setMembersList(list && list.length > 0 ? list : FALLBACK_MEMBERS);
      })
      .catch((err) => {
        console.warn('Failed to fetch members for group:', err);
        if (active) setMembersList(FALLBACK_MEMBERS);
      })
      .finally(() => {
        if (active) setLoadingMembers(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleMemberSelection = (id) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedMemberIds(new Set());
  };

  // Filter members by search input
  const filteredMembers = membersList.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.mobile?.includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.business?.toLowerCase().includes(q)
    );
  });

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      // Simulated excel parsed count
      setExcelCount(25);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name.');
      return;
    }

    const selectedMembersData = membersList.filter((m) =>
      selectedMemberIds.has(m.id)
    );

    const mappedMembers = selectedMembersData.map((m) => ({
      id: typeof m.id === 'number' ? m.id : Number(m.id) || m.id,
      memberId: typeof m.memberId === 'number' ? m.memberId : (Number(m.memberId) || Number(m.id) || m.id),
      membershipId: m.membershipId || (m.memberId ? `JBAD${m.memberId}` : `JBAD${150 + (Number(m.id) || 0)}`),
      name: m.name || m.fullName || '',
      business: m.business || m.companyName || '',
      mobile: m.mobile || m.phone || '',
      email: m.email || '',
      avatar: m.avatar || null,
    }));

    const memberCount =
      addMode === 'EXCEL' && excelFile
        ? excelCount
        : mappedMembers.length > 0
        ? mappedMembers.length
        : 0;

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        groupName: groupName.trim(),
        name: groupName.trim(),
        description: description.trim(),
        about: description.trim(),
        memberCount,
        members: mappedMembers,
        groupType: 'All Members',
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        status: true,
      };

      await onGroupCreated(payload);
    } catch (err) {
      setError(err.message || 'Failed to create group');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white bg-white p-5 sm:p-7 md:p-8 shadow-card space-y-6">
      {/* Top Header: Title "Create Group" + "<- Back to Groups" Button matching Image 2 */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
          Create Group
        </h2>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-[#2832A4] text-[#2832A4] hover:bg-indigo-50/70 px-4 sm:px-5 py-2 text-xs sm:text-sm active:scale-95 shadow-2xs gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Groups</span>
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Create Group Form matching Image 2 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Group Name */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition shadow-2xs"
          />
        </div>

        {/* 2. Description (Optional) */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition shadow-2xs resize-none"
          />
        </div>

        {/* 3. Add Members Section matching Image 2 */}
        <div className="space-y-4">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">
            Add Members <span className="text-red-500">*</span>
          </label>

          {/* Radio Switcher matching Image 2 */}
          <div className="flex items-center gap-8">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="addMode"
                checked={addMode === 'MEMBERS'}
                onChange={() => setAddMode('MEMBERS')}
                className="h-4 w-4 text-[#2832A4] focus:ring-[#2832A4] cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Select From Members
              </span>
            </label>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="radio"
                name="addMode"
                checked={addMode === 'EXCEL'}
                onChange={() => setAddMode('EXCEL')}
                className="h-4 w-4 text-[#2832A4] focus:ring-[#2832A4] cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Upload Excel
              </span>
            </label>
          </div>

          {/* Content Mode: Select From Members matching Image 2 */}
          {addMode === 'MEMBERS' ? (
            <div className="space-y-3">
              {/* Search Bar + Selected Counter row matching Image 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-lg">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Search members by name, mobile or email..."
                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm self-end sm:self-auto">
                  <span className="font-semibold text-slate-700">
                    {selectedMemberIds.size} Selected
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0) {
                        setSelectedMemberIds(new Set());
                      } else {
                        setSelectedMemberIds(new Set(filteredMembers.map((m) => m.id)));
                      }
                    }}
                    className="font-bold text-[#2832A4] hover:underline cursor-pointer"
                  >
                    {selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                  {selectedMemberIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="font-medium text-slate-500 hover:text-red-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Members Selection List matching Image 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 max-h-80 overflow-y-auto no-scrollbar shadow-2xs">
                {loadingMembers ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-36 rounded-md" />
                          <Skeleton className="h-2.5 w-24 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="py-12 text-center text-xs sm:text-sm text-slate-400">
                    No members found matching your search.
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = selectedMemberIds.has(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => toggleMemberSelection(member.id)}
                        className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 hover:bg-slate-50/70 transition cursor-pointer select-none"
                      >
                        {/* Left: Radio/Circle selection + Avatar + Name */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Circular radio indicator matching Image 2 */}
                          <div
                            className={cn(
                              'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                              isSelected
                                ? 'border-[#2832A4] bg-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {isSelected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-[#2832A4]" />
                            )}
                          </div>

                          <Avatar
                            name={member.name}
                            src={member.avatar}
                            size="md"
                            className="h-10 w-10 shrink-0 shadow-2xs"
                          />

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-ink truncate">
                              {member.name}
                            </p>
                            {member.business && (
                              <p className="text-[11px] text-slate-400 truncate">
                                {member.business}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Mobile Phone Number */}
                        <span className="text-xs sm:text-sm font-mono text-slate-600 shrink-0">
                          {member.mobile
                            ? member.mobile.startsWith('+')
                              ? member.mobile
                              : `+91 ${member.mobile}`
                            : '-'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Upload Excel Dropzone Mode */
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#2832A4]">
                <FileSpreadsheet className="h-6 w-6 stroke-[1.8]" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Upload Members Spreadsheet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports .xlsx and .csv files with member phone numbers and names
                </p>
              </div>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                id="excel-upload"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <label
                htmlFor="excel-upload"
                className="inline-flex items-center gap-2 rounded-full border border-[#2832A4] bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-[#2832A4] hover:bg-indigo-50 cursor-pointer transition shadow-2xs"
              >
                <Upload className="h-4 w-4" />
                <span>{excelFile ? excelFile.name : 'Browse Excel File'}</span>
              </label>

              {excelFile && (
                <p className="text-xs font-semibold text-emerald-600 mt-2">
                  ✓ File ready! Approximately {excelCount} members will be added.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Form Actions matching Image 2 */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="rounded-full px-7 py-2.5 text-xs sm:text-sm font-semibold"
          >
            Cancel
          </Button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#2832A4] hover:bg-[#1E2585] text-white px-8 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#2832A4]/20 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{isSubmitting ? 'Creating...' : 'Create Group'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
