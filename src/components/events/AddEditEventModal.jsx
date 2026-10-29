'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import DatePicker from '@/components/common/DatePicker';
import { createEvent, updateEvent } from '@/services/event.service';
import { cn } from '@/lib/utils';

export default function AddEditEventModal({
  open,
  event = null,
  onClose,
  onEventSaved,
}) {
  const fileInputRef = useRef(null);
  const isEditing = Boolean(event);

  const [formData, setFormData] = useState({
    title: '',
    city: '',
    address: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    postedBy: 'Admin',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Sync state whenever modal opens or active event changes
  useEffect(() => {
    if (open) {
      if (event) {
        setFormData({
          title: event.title || event.name || '',
          city: event.city || '',
          address: event.address || '',
          description: event.description || '',
          startDate: event.startDate || '',
          endDate: event.endDate || '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          postedBy: event.postedBy || 'Admin',
          isActive: typeof event.isActive === 'boolean' ? event.isActive : true,
        });
        setImageFile(null);
        setImagePreview(event.image || null);
      } else {
        // Defaults for new event (empty fields so placeholders and validations match Image)
        setFormData({
          title: '',
          city: '',
          address: '',
          description: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          postedBy: 'Admin',
          isActive: true,
        });
        setImageFile(null);
        setImagePreview(null);
      }
      setErrors({});
      setApiError('');
    }
  }, [open, event]);

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) clearError(name);
    if ((name === 'startTime' || name === 'endTime') && errors.time) {
      clearError('time');
    }
    if (apiError) setApiError('');
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid image file (PNG, JPG, WEBP)',
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image file size must be less than 5MB',
      }));
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    clearError('image');
    if (apiError) setApiError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors((prev) => ({ ...prev, image: 'Event Image is required' }));
  };

  // Comprehensive field validation matching the reference design
  const validate = () => {
    const newErrors = {};

    // 1. Event Image
    if (!imageFile && !imagePreview) {
      newErrors.image = 'Event Image is required';
    }

    // 2. Event City
    if (!formData.city.trim()) {
      newErrors.city = 'City name is required';
    }

    // 3. Event Address
    if (!formData.address.trim()) {
      newErrors.address = 'Event address is required';
    }

    // 4. Event Name
    if (!formData.title.trim()) {
      newErrors.title = 'Event name is required';
    }

    // 5. Event Start Date
    if (!formData.startDate) {
      newErrors.startDate = 'Event start date is required';
    }

    // 6. Event End Date
    if (!formData.endDate) {
      newErrors.endDate = 'Event end date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'Event end date cannot be earlier than start date';
    }

    // 7. Event Time
    if (!formData.startTime.trim() || !formData.endTime.trim()) {
      newErrors.time = 'Event time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      let saved;
      if (imageFile) {
        const payload = new FormData();
        payload.append('image', imageFile);
        payload.append('title', formData.title.trim());
        payload.append('city', formData.city.trim());
        payload.append('address', formData.address.trim());
        payload.append('description', formData.description.trim());
        payload.append('startDate', formData.startDate);
        payload.append('endDate', formData.endDate);
        payload.append('startTime', formData.startTime.trim());
        payload.append('endTime', formData.endTime.trim());
        payload.append('postedBy', formData.postedBy || 'Admin');
        payload.append('isActive', formData.isActive.toString());

        if (isEditing) {
          saved = await updateEvent(event.id, payload);
        } else {
          saved = await createEvent(payload);
        }
      } else {
        const payload = {
          title: formData.title.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          description: formData.description.trim(),
          startDate: formData.startDate,
          endDate: formData.endDate,
          startTime: formData.startTime.trim(),
          endTime: formData.endTime.trim(),
          postedBy: formData.postedBy || 'Admin',
          isActive: formData.isActive,
        };
        if (imagePreview && !imageFile && event?.rawImage) {
          payload.image = event.rawImage;
        }

        if (isEditing) {
          saved = await updateEvent(event.id, payload);
        } else {
          saved = await createEvent(payload);
        }
      }

      if (onEventSaved) {
        onEventSaved(saved, isEditing);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save event:', err);
      setApiError(err.message || 'Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title={isEditing ? 'Edit Event' : 'Add Events'}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8 space-y-6">
        {apiError && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">{apiError}</p>
          </div>
        )}

        {/* 2-Column Responsive Layout Matching Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* LEFT COLUMN: Image, City, Address, Status */}
          <div className="space-y-4">
            {/* Event Image */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Event Image <span className="text-red-500">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="event-image-upload"
              />

              {imagePreview ? (
                <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Event Preview"
                    className="h-40 w-full object-cover rounded-xl border border-slate-100"
                  />
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#2832A4] hover:underline"
                    >
                      Change Photo
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
                    isDragging
                      ? 'border-[#2832A4] bg-[#EEF2FF]'
                      : 'border-[#D4DEFE] bg-[#F5F8FF] hover:border-[#2832A4] hover:bg-[#EEF2FF]/70'
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Upload event image"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2832A4] shadow-xs transition-transform duration-200 group-hover:-translate-y-0.5">
                    <Upload className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-ink">Upload Image</p>
                  <p className="mt-1 text-xs text-slate-400">PNG, JPG or WEBP (Max. 5MB)</p>
                </div>
              )}

              {/* Event Image Error Message */}
              {errors.image && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.image}
                </p>
              )}
            </div>

            {/* Event City */}
            <div>
              <label htmlFor="event-city" className="block text-sm font-semibold text-ink mb-1.5">
                Event City <span className="text-red-500">*</span>
              </label>
              <input
                id="event-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
              />
              {/* Event City Error Message */}
              {errors.city && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.city}
                </p>
              )}
            </div>

            {/* Event Address */}
            <div>
              <label htmlFor="event-address" className="block text-sm font-semibold text-ink mb-1.5">
                Event Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="event-address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 resize-none"
              />
              {/* Event Address Error Message */}
              {errors.address && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Event Status Toggle */}
            <div className="pt-1">
              <label className="block text-sm font-semibold text-ink mb-2">Event Status</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isActive}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={cn(
                    'relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20',
                    formData.isActive ? 'bg-[#2832A4]' : 'bg-slate-300'
                  )}
                >
                  <span className="sr-only">Toggle active event status</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                      formData.isActive ? 'translate-x-6' : 'translate-x-0'
                    )}
                  />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Name, Description, Dates, Times */}
          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <label htmlFor="event-name" className="block text-sm font-semibold text-ink mb-1.5">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                id="event-name"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
              />
              {/* Event Name Error Message */}
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Enter Description (Optional) */}
            <div>
              <label htmlFor="event-description" className="block text-sm font-semibold text-ink mb-1.5">
                Enter Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="event-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 resize-none"
              />
            </div>

            {/* Event Start Date */}
            <div>
              <label htmlFor="event-start-date" className="block text-sm font-semibold text-ink mb-1.5">
                Event Start Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                id="event-start-date"
                name="startDate"
                value={formData.startDate}
                onChange={(val) => {
                  setFormData((prev) => ({
                    ...prev,
                    startDate: val,
                    endDate: prev.endDate && prev.endDate < val ? val : prev.endDate,
                  }));
                  clearError('startDate');
                  if (apiError) setApiError('');
                }}
                valueFormat="YYYY-MM-DD"
                displayFormat="readable"
                placeholder="Select date"
              />
              {/* Event Start Date Error Message */}
              {errors.startDate && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* Event End Date */}
            <div>
              <label htmlFor="event-end-date" className="block text-sm font-semibold text-ink mb-1.5">
                Event End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                id="event-end-date"
                name="endDate"
                value={formData.endDate}
                minDate={formData.startDate}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, endDate: val }));
                  clearError('endDate');
                  if (apiError) setApiError('');
                }}
                valueFormat="YYYY-MM-DD"
                displayFormat="readable"
                placeholder="Select date"
              />
              {/* Event End Date Error Message */}
              {errors.endDate && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.endDate}
                </p>
              )}
            </div>

            {/* Event Time */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Event Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Start Time */}
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    placeholder="Start Time"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
                  />
                </div>

                {/* End Time */}
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    placeholder="End Time"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
                  />
                </div>
              </div>
              {/* Event Time Error Message */}
              {errors.time && (
                <p className="mt-1.5 text-xs text-red-500 font-normal">
                  {errors.time}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
