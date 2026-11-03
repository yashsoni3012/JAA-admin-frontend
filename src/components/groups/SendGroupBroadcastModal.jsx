'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Send, Users } from 'lucide-react';
import { createBroadcast } from '@/services/broadcast.service';

export default function SendGroupBroadcastModal({ open, group, onClose, onSent }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  if (!group) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please provide both title and message.');
      return;
    }

    setIsSending(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        broadcastTitle: title.trim(),
        message: message.trim(),
        sendTo: group.name,
        sentTo: group.name,
        status: 'Delivered',
        group_id: {
          id: group.id,
          name: group.name,
        },
        createdBy: 'Admin User',
      };
      const created = await createBroadcast(payload);
      if (onSent) await onSent(created);
      setTitle('');
      setMessage('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      open={open}
      title={`Send Broadcast to ${group.name}`}
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

        <div className="flex items-center gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 font-medium">
          <Users className="h-4 w-4 text-[#2832A4] shrink-0" />
          <span>This broadcast will be sent to all {group.memberCount || 25} members of <strong className="font-bold">{group.name}</strong>.</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Broadcast Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual General Meeting Notice"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 transition shadow-2xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Message Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write message details for the group members..."
            rows={4}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 transition shadow-2xs resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSending}
            className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSending}
            className="rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md shadow-brand-500/20"
          >
            <Send className="h-4 w-4" />
            <span>Send Now</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

