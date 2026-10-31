'use client';

import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  PlayCircle,
  FileText,
  Upload,
  Send,
  X,
  Plus,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/common/Button';
import { createPost } from '@/services/post.service';
import { cn } from '@/lib/utils';

// Helper to detect file category
function getFileCategory(file) {
  if (!file) return 'File';
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  if (type.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.webm') || name.endsWith('.mkv')) {
    return 'Video';
  }
  if (type.includes('pdf') || name.endsWith('.pdf') || type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) {
    return 'Notice';
  }
  if (type.startsWith('image/') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp') || name.endsWith('.gif')) {
    return 'Photo';
  }
  return 'Document';
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function CreatePostView({ onBack, onPostCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [isPinned, setIsPinned] = useState(false);

  // Files state (multi-file support for photo, video, notice all in one)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Process newly selected files
  const processFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;

    setError('');
    const validFiles = Array.from(newFiles);

    const newPreviews = validFiles.map((file) => {
      const category = getFileCategory(file);
      let previewUrl = null;
      if (category === 'Photo') {
        previewUrl = URL.createObjectURL(file);
      }
      return {
        file,
        name: file.name,
        size: formatFileSize(file.size),
        category,
        previewUrl,
      };
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (indexToRemove, e) => {
    e?.stopPropagation();
    setFilePreviews((prev) => {
      const item = prev[indexToRemove];
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (location.trim()) {
        formData.append('location', location.trim());
      }
      formData.append('allowComments', String(allowComments));
      formData.append('isPinned', String(isPinned));
      formData.append('status', 'published');

      // Detect overall dominant type
      const hasVideo = selectedFiles.some((f) => getFileCategory(f) === 'Video');
      const hasNotice = selectedFiles.some((f) => getFileCategory(f) === 'Notice');
      const dominantType = hasVideo ? 'Video' : hasNotice ? 'Notice' : 'Photo';
      formData.append('type', dominantType);

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('media', file);
        });
      } else {
        // Default media fallback if user didn't attach any file
        formData.append('media', '/uploads/jaa-logo-1793342977457.png');
      }

      const res = await createPost(formData);
      if (onPostCreated) {
        onPostCreated(res);
      }
    } catch (err) {
      console.error('Failed to publish post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBadge = (category) => {
    switch (category) {
      case 'Video':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-200">
            <PlayCircle className="h-3 w-3" /> Video
          </span>
        );
      case 'Notice':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-200">
            <FileText className="h-3 w-3" /> Notice
          </span>
        );
      case 'Photo':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2832A4] border border-blue-200">
            <ImageIcon className="h-3 w-3" /> Photo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card matching Image 2 */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* Header Row: Title & Back Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
              Create Post
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Publish photos, videos, or notice circulars for all members.
            </p>
          </div>

          {/* Back Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body: Left Inputs + Right Toggle Controls */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Inputs (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your title"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a description"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 resize-none transition"
                />
              </div>

              {/* Unified Media Upload Area (Single upload for Photo, Video & Notice) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Media Upload <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {filePreviews.length > 0
                      ? `${filePreviews.length} file(s) selected`
                      : 'Photo, Video, or Notice'}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition cursor-pointer select-none text-center',
                    isDragging
                      ? 'border-[#2832A4] bg-blue-50/70 scale-[1.01]'
                      : 'border-[#C7D2FE] bg-[#F4F7FF] hover:bg-[#EEF2FF]'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-[#2832A4] transition group-hover:scale-105">
                    <Upload className="h-6 w-6 stroke-[2]" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-ink">
                    Click to upload or drag & drop files
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                    Upload any <span className="font-semibold text-slate-600">Photo</span> (PNG, JPG, WEBP),{' '}
                    <span className="font-semibold text-slate-600">Video</span> (MP4, MOV), or{' '}
                    <span className="font-semibold text-slate-600">Notice</span> document (PDF, DOC) up to 50MB
                  </p>
                </div>

                {/* Uploaded Files Gallery / List */}
                {filePreviews.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Selected Files ({filePreviews.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#2832A4] hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add more</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filePreviews.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-[#2832A4]/40 transition group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.previewUrl ? (
                              <img
                                src={item.previewUrl}
                                alt={item.name}
                                className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : item.category === 'Video' ? (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
                                <PlayCircle className="h-6 w-6 stroke-[2]" />
                              </div>
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                                <FileText className="h-6 w-6 stroke-[2]" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-ink truncate max-w-[150px]">
                                  {item.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {renderBadge(item.category)}
                                <span className="text-[11px] text-slate-400">
                                  {item.size}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleRemoveFile(idx, e)}
                            title="Remove file"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Toggles matching Image 2 (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6 pt-2">
              {/* Toggle 1: Allow Comments */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-sm font-bold text-ink">
                  Allow Comments
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={allowComments}
                  onClick={() => setAllowComments((prev) => !prev)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20',
                    allowComments ? 'bg-[#2832A4]' : 'bg-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                      allowComments ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Toggle 2: Pin Post */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-sm font-bold text-ink block">
                    Pin Post
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Show that post at the top
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPinned}
                  onClick={() => setIsPinned((prev) => !prev)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 mt-0.5',
                    isPinned ? 'bg-[#2832A4]' : 'bg-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                      isPinned ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>


              {/* Info Note Box */}
              {/* <div className="rounded-2xl bg-[#F4F7FF] border border-[#D4DEFE] p-4 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-[#2832A4]">Unified Media Upload</p>
                <p className="text-slate-500 leading-relaxed">
                  You can select any photo, video, or official notice document from a single upload. Type badges will automatically be assigned based on your file.
                </p>
              </div> */}
            </div>
          </div>

          {/* Action Buttons: Cancel and Publish Post matching Image 2 */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="rounded-full border border-slate-300 bg-white px-7 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
            >
              <Send className="h-4 w-4" />
              <span>Publish Post</span>
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
