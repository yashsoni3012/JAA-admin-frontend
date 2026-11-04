'use client';

import {
  Calendar,
  Users,
  Paperclip,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  ExternalLink,
  Eye,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '').replace('/api', '') ||
  'http://localhost:5000';

/**
 * Resolves static attachment path into an absolute URL
 */
function resolveAttachmentUrl(filePath) {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('blob:')
  ) {
    return filePath;
  }
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  if (!cleanPath.startsWith('/uploads') && !cleanPath.startsWith('/images')) {
    return `${API_BASE_URL}/uploads${cleanPath}`;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Parses raw attachment data into structured file info (type, clean name, previewable URL)
 */
function getAttachmentInfo(rawAttachment) {
  if (!rawAttachment) return null;
  let filePath = '';
  let originalName = '';

  if (typeof rawAttachment === 'string') {
    filePath = rawAttachment;
  } else if (typeof rawAttachment === 'object') {
    filePath =
      rawAttachment.url ||
      rawAttachment.path ||
      rawAttachment.filePath ||
      rawAttachment.name ||
      '';
    originalName =
      rawAttachment.name ||
      rawAttachment.filename ||
      rawAttachment.originalName ||
      '';
  }

  if (!filePath || filePath === 'null' || filePath === 'undefined') return null;

  // Extract base file name from path
  const baseName = filePath.split(/[/\\]/).pop() || 'attachment';

  // If originalName wasn't provided, clean timestamp suffix (e.g. "gold-logo-1793710588266.jpg" -> "gold-logo.jpg")
  if (!originalName) {
    originalName = baseName.replace(/-\d{10,}(\.[a-zA-Z0-9]+)$/, '$1');
  }

  // Determine file extension
  const ext = (baseName.split('.').pop() || '').toLowerCase();

  const fileUrl = resolveAttachmentUrl(filePath);

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isDoc = ['doc', 'docx'].includes(ext);
  const isSheet = ['xls', 'xlsx', 'csv'].includes(ext);
  const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);

  return {
    rawPath: filePath,
    fileUrl,
    fileName: originalName,
    baseName,
    extension: ext.toUpperCase(),
    isImage,
    isPdf,
    isDoc,
    isSheet,
    isVideo,
  };
}

export default function ViewBroadcastModal({
  open,
  broadcast,
  onClose,
}) {
  if (!broadcast) return null;

  const rawAttachment =
    broadcast.attachment ||
    broadcast.file ||
    broadcast.image ||
    broadcast.media ||
    null;

  const attachmentInfo = getAttachmentInfo(rawAttachment);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Broadcast Details"
      maxWidth="max-w-xl sm:max-w-2xl"
      headerBorder={false}
      headerClassName="px-6 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-3"
      bodyClassName="px-6 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-3"
    >
      <div className="space-y-6">
        {/* Title & Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Broadcast Title
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-ink leading-snug break-words">
              {broadcast.title || broadcast.broadcastTitle || 'Untitled Broadcast'}
            </h3>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#A6F4C5] bg-[#D1FADF]/70 text-[#027A48] shrink-0 self-start sm:self-auto shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#027A48]" />
            <span>{broadcast.status || 'Delivered'}</span>
          </span>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sent To Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 shadow-2xs">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-[#2832A4] shrink-0 shadow-2xs">
              <Users className="h-5 w-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sent To
              </p>
              <p className="text-sm sm:text-base font-bold text-ink mt-0.5 truncate">
                {broadcast.sentTo || broadcast.sendTo || 'All Members'}
              </p>
            </div>
          </div>

          {/* Sent On Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 shadow-2xs">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-[#2832A4] shrink-0 shadow-2xs">
              <Calendar className="h-5 w-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sent On
              </p>
              <p className="text-sm sm:text-base font-bold text-ink mt-0.5 truncate">
                {broadcast.sentOn || broadcast.createdAt || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Message Content Box */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Message
          </label>
          <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 sm:p-5 text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[110px] shadow-2xs">
            {broadcast.message ? (
              broadcast.message
            ) : (
              <span className="text-slate-400 italic text-xs sm:text-sm">No message content</span>
            )}
          </div>
        </div>

        {/* Attachment Section (Preview & Interactive Cards instead of raw path) */}
        {attachmentInfo && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Attachment ({attachmentInfo.isImage ? 'Image' : attachmentInfo.isPdf ? 'PDF Document' : attachmentInfo.isSheet ? 'Spreadsheet' : 'File'})
              </label>
              <a
                href={attachmentInfo.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2832A4] hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in New Tab</span>
              </a>
            </div>

            {/* 1. Image Preview */}
            {attachmentInfo.isImage && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-4 shadow-2xs space-y-3">
                <div className="relative w-full max-h-[280px] sm:max-h-[320px] rounded-xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center group">
                  <img
                    src={attachmentInfo.fileUrl}
                    alt={attachmentInfo.fileName}
                    className="w-full h-auto max-h-[280px] sm:max-h-[320px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                    onError={(e) => {
                      if (!e.target.dataset.fallbackTried) {
                        e.target.dataset.fallbackTried = 'true';
                        e.target.src = attachmentInfo.rawPath.startsWith('/')
                          ? attachmentInfo.rawPath
                          : `/${attachmentInfo.rawPath}`;
                      }
                    }}
                  />
                </div>

                {/* File Details bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-[#2832A4] shrink-0">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-slate-700 truncate" title={attachmentInfo.fileName}>
                      {attachmentInfo.fileName}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                      {attachmentInfo.extension}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <a
                      href={attachmentInfo.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#2832A4] bg-white text-xs font-semibold text-[#2832A4] hover:bg-blue-50 transition active:scale-95 shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Full</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PDF Document Card */}
            {attachmentInfo.isPdf && (
              <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-red-100/80 text-red-600 flex items-center justify-center shrink-0 border border-red-200/60 shadow-2xs">
                    <FileText className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-ink truncate" title={attachmentInfo.fileName}>
                      {attachmentInfo.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-red-600 bg-red-100/70 px-1.5 py-0.5 rounded">
                        PDF
                      </span>
                      <span>Portable Document Format</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <a
                    href={attachmentInfo.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-500 bg-white text-xs font-bold text-red-600 hover:bg-red-50 transition active:scale-95 shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Full</span>
                  </a>
                </div>
              </div>
            )}

            {/* 3. Spreadsheet Document Card */}
            {attachmentInfo.isSheet && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                    <FileSpreadsheet className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-ink truncate" title={attachmentInfo.fileName}>
                      {attachmentInfo.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {attachmentInfo.extension}
                      </span>
                      <span>Spreadsheet Document</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <a
                    href={attachmentInfo.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-600 bg-white text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition active:scale-95 shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Full</span>
                  </a>
                </div>
              </div>
            )}

            {/* 4. Document / Generic File Card */}
            {!attachmentInfo.isImage && !attachmentInfo.isPdf && !attachmentInfo.isSheet && (
              <div className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-[#2832A4] flex items-center justify-center shrink-0 border border-indigo-100 shadow-2xs">
                    <FileText className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-ink truncate" title={attachmentInfo.fileName}>
                      {attachmentInfo.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-[#2832A4] bg-indigo-50 px-1.5 py-0.5 rounded">
                        {attachmentInfo.extension || 'FILE'}
                      </span>
                      <span>Attached File</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <a
                    href={attachmentInfo.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Full</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end pt-5 border-t border-slate-100">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="px-8 py-2.5 text-xs sm:text-sm font-semibold rounded-full shadow-md shadow-[#2832A4]/20 active:scale-95 transition-all cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
