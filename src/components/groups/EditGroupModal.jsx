'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Pencil } from 'lucide-react';

export default function EditGroupModal({ open, group, onClose, onUpdated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setDescription(group.description || group.about || '');
      setError('');
    }
  }, [group, open]);

  if (!group) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onUpdated({
        name: name.trim(),
        description: description.trim(),
        about: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Group"
      onClose={onClose}
      maxWidth="max-w-lg"
      headerBorder={false}
      headerClassName="px-6 pt-6 pb-2"
      bodyClassName="px-6 py-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 transition shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter group description..."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 transition shadow-2xs resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md shadow-brand-500/20"
          >
            <Pencil className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

