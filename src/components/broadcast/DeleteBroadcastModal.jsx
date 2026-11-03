'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function DeleteBroadcastModal({
  open,
  broadcast,
  onClose,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!broadcast) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(broadcast.id);
      onClose();
    } catch (err) {
      console.error('Delete broadcast error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Broadcast"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 p-1 sm:p-2">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">
              Delete &quot;{broadcast.title || broadcast.broadcastTitle}&quot;?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              This broadcast will be permanently removed from records.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 text-xs sm:text-sm active:scale-95 shadow-2xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white border-transparent px-6 py-2.5 text-xs sm:text-sm active:scale-95 shadow-md shadow-red-600/20 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

