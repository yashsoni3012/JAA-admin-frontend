'use client';

import { Calendar, Users, Radio, Paperclip, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function ViewBroadcastModal({
  open,
  broadcast,
  onClose,
}) {
  if (!broadcast) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Broadcast Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 p-1 sm:p-2">
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Broadcast Title
            </span>
            <h3 className="text-base sm:text-lg font-bold text-ink mt-0.5">
              {broadcast.title || broadcast.broadcastTitle}
            </h3>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#A6F4C5] bg-[#D1FADF]/70 text-[#027A48] self-start sm:self-auto">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{broadcast.status || 'Delivered'}</span>
          </span>
        </div>

        {/* 2x2 Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-[#2832A4] shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Sent To</p>
              <p className="text-xs sm:text-sm font-bold text-ink">
                {broadcast.sentTo || broadcast.sendTo || 'All Members'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-[#2832A4] shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400">Sent On</p>
              <p className="text-xs sm:text-sm font-bold text-ink">
                {broadcast.sentOn || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Message
          </label>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {broadcast.message}
          </div>
        </div>

        {/* Attachment if present */}
        {broadcast.attachment && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Attachment
            </label>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs">
              <Paperclip className="h-4 w-4 text-[#2832A4]" />
              <span className="truncate max-w-xs">{broadcast.attachment}</span>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="px-7 py-2.5 text-xs sm:text-sm active:scale-95 shadow-md shadow-[#2832A4]/20"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

