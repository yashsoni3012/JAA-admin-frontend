'use client';

import { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/common/Button';
import { createBroadcast } from '@/services/broadcast.service';
import { cn } from '@/lib/utils';

export default function CreateBroadcastView({
  onBack,
  onSuccess,
}) {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [message, setMessage] = useState('');
  // Pre-selected to 'All Members' exactly as shown in screenshot media_1793701439985_1579f5f1.jpg
  const [sendTo, setSendTo] = useState('All Members');
  const [attachment, setAttachment] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({
    title: false,
    message: false,
    sendTo: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = (e) => {
    e.stopPropagation();
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setBroadcastTitle('');
    setMessage('');
    setSendTo('All Members');
    setAttachment(null);
    setErrors({ title: false, message: false, sendTo: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleValid = Boolean(broadcastTitle.trim());
    const messageValid = Boolean(message.trim());
    const sendToValid = Boolean(sendTo);

    setErrors({
      title: !titleValid,
      message: !messageValid,
      sendTo: !sendToValid,
    });

    if (!titleValid || !messageValid || !sendToValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: broadcastTitle.trim(),
        broadcastTitle: broadcastTitle.trim(),
        message: message.trim(),
        sentTo: sendTo,
        sendTo: sendTo,
      };

      const result = await createBroadcast(payload, attachment);
      handleCancel();
      if (onSuccess) {
        onSuccess(result, `Broadcast "${payload.title}" created successfully!`);
      }
    } catch (err) {
      console.error('Failed to create broadcast:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white bg-white p-6 sm:p-8 md:p-10 shadow-card space-y-6">
      {/* Top Header Row matching screenshot */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
          Create Broadcast
        </h2>
      </div>

      {/* Main Broadcast Form matching media_1793701439985_1579f5f1.jpg */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Broadcast Title * */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
            Broadcast Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={broadcastTitle}
            onChange={(e) => {
              setBroadcastTitle(e.target.value);
              if (errors.title && e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, title: false }));
              }
            }}
            placeholder="Enter broadcast title"
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:outline-none transition shadow-2xs',
              errors.title
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200 focus:border-[#2832A4] focus:ring-4 focus:ring-[#2832A4]/10'
            )}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              Broadcast Title is required
            </p>
          )}
        </div>

        {/* 2. Message * */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message && e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, message: false }));
              }
            }}
            placeholder="Enter message"
            rows={7}
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:outline-none transition shadow-2xs resize-none',
              errors.message
                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-slate-200 focus:border-[#2832A4] focus:ring-4 focus:ring-[#2832A4]/10'
            )}
          />
          {errors.message && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              Message is required
            </p>
          )}
        </div>

        {/* 3. Attachment (Optional) matching screenshot with soft pink/red tint */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
            Attachment (Optional)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            id="page-broadcast-attachment"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'w-full max-w-md sm:max-w-lg rounded-2xl border px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all select-none',
              'bg-[#FFF5F6] border-[#FDE8E9]',
              isDragging && 'border-red-300 ring-2 ring-red-200 bg-red-100/60'
            )}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 truncate">
              <Paperclip className="h-4 w-4 text-slate-500 shrink-0 rotate-45" />
              {attachment ? (
                <span className="font-semibold text-ink truncate">
                  {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                </span>
              ) : (
                <span className="text-slate-500 truncate">
                  Click choose image/ document or drag here
                </span>
              )}
            </div>

            {attachment && (
              <button
                type="button"
                onClick={removeAttachment}
                title="Remove attachment"
                className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-white/80 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4. Send To * matching screenshot */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-3">
            Send To<span className="text-red-500">*</span>
          </label>

          <div className="flex items-center gap-8">
            {/* All Members */}
            <label
              onClick={() => {
                setSendTo('All Members');
                if (errors.sendTo) setErrors((prev) => ({ ...prev, sendTo: false }));
              }}
              className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                  sendTo === 'All Members'
                    ? 'border-[#2832A4] bg-white'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                )}
              >
                {sendTo === 'All Members' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#2832A4]" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                All Members
              </span>
            </label>

            {/* Committee Members */}
            <label
              onClick={() => {
                setSendTo('Committee Members');
                if (errors.sendTo) setErrors((prev) => ({ ...prev, sendTo: false }));
              }}
              className="inline-flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                  sendTo === 'Committee Members'
                    ? 'border-[#2832A4] bg-white'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                )}
              >
                {sendTo === 'Committee Members' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#2832A4]" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Committee Members
              </span>
            </label>
          </div>

          {errors.sendTo && (
            <p className="mt-2 text-xs font-medium text-red-500">
              Please select anyone
            </p>
          )}
        </div>

        {/* 5. Bottom Action Buttons matching media_1793701439985_1579f5f1.jpg */}
        <div className="flex items-center justify-end gap-3 pt-6">
          {/* Cancel button */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-8 py-2.5 text-xs sm:text-sm font-medium active:scale-95 shadow-2xs"
          >
            Cancel
          </Button>

          {/* Send to Broadcast button */}
          <Button
            type="submit"
            variant="outline"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="rounded-full border-[#2832A4] hover:bg-indigo-50/70 bg-white text-[#2832A4] px-8 py-2.5 text-xs sm:text-sm font-medium active:scale-95 shadow-2xs gap-2"
          >
            <Send className="h-4 w-4 -rotate-12" />
            <span>Send to Broadcast</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
