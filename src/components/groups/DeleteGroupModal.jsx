'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function DeleteGroupModal({ open, group, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!group) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(group.id);
      onClose();
    } catch {
      // Handled by parent toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Delete Group"
      onClose={onClose}
      maxWidth="max-w-md"
      headerBorder={false}
      headerClassName="px-6 pt-6 pb-2"
      bodyClassName="px-6 py-4"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-ink">
              Are you sure you want to delete this group?
            </h4>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              This will permanently remove <span className="font-semibold text-slate-800">"{group.name}"</span>. Members of this group will not be deleted.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            loading={isDeleting}
            className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Group</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

