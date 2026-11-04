'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { Search, UserPlus, Check } from 'lucide-react';
import { getMembers } from '@/services/admin.service';
import { Skeleton } from '@/components/common/Skeleton';

export default function AddGroupMembersModal({ open, group, onClose, onMembersAdded }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSelectedIds(new Set());
      getMembers({ page: 1, limit: 100 })
        .then((res) => {
          const list = res.members || (Array.isArray(res) ? res : []);
          setMembers(list);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  if (!group) return null;

  const toggleMember = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.mobile?.includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  const handleSave = async () => {
    if (selectedIds.size === 0) return;
    setIsSaving(true);
    try {
      const added = members.filter((m) => selectedIds.has(m.id));
      if (onMembersAdded) await onMembersAdded(added);
      onClose();
    } catch {
      // handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Add Members to ${group.name}`}
      onClose={onClose}
      maxWidth="max-w-xl"
      headerBorder={false}
      headerClassName="px-6 pt-6 pb-2"
      bodyClassName="px-6 py-4"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, mobile, email..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 transition shadow-2xs"
          />
        </div>

        {/* Selected count */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{selectedIds.size} Members selected</span>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-[#2832A4] font-semibold hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Member List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-2">
          {loading ? (
            <div className="p-3 space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-32 rounded-md" />
                    <Skeleton className="h-2 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching members found.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = selectedIds.has(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-white cursor-pointer transition select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'border-[#2832A4] bg-[#2832A4] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <Avatar
                      name={member.name}
                      src={member.avatar}
                      size="sm"
                      className="h-8 w-8 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-ink truncate">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {member.business || 'Member'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    {member.mobile || ''}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={selectedIds.size === 0}
            className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md shadow-brand-500/20"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Selected ({selectedIds.size})</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

