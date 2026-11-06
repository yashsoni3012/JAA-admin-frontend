'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { cn } from '@/lib/utils';

const INITIAL_FORM = {
  fullName: '',
  businessName: '',
  mobile: '',
  email: '',
  password: '',
  businessType: '',
  isActive: true,
  address: '',
  profileImage: null,
  imagePreview: '',
};

export default function AddMemberModal({ open, onClose, onAddMember }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);
  const passwordRef = useRef(null);
  const fullNameRef = useRef(null);
  const businessNameRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const businessTypeRef = useRef(null);
  const addressRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormData(INITIAL_FORM);
      setErrors({});
      setTouched({});
      setImageError('');
      setIsSubmitting(false);
      setIsDragging(false);
      setShowPassword(false);
    }
  }, [open]);

  // Validation function per field
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Please enter a valid full name';
        return '';
      case 'businessName':
        if (!value.trim()) return 'Business name is required';
        if (value.trim().length < 2) return 'Business name must be at least 2 characters';
        return '';
      case 'mobile':
        if (!value.trim()) return 'Mobile number is required';
        if (!/^\d{10}$/.test(value.trim())) return 'Mobile number must be a 10-digit number';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
        return '';
      case 'businessType':
        if (!value.trim()) return 'Business type is required';
        if (value.trim().length < 2) return 'Business type must be at least 2 characters';
        return '';
      case 'password':
        if (!value || !value.trim()) return 'Password is required and must be at least 6 characters';
        if (value.trim().length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 5) return 'Address must be at least 5 characters';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    const fieldOrder = ['fullName', 'email', 'address', 'businessName', 'mobile', 'businessType', 'password'];

    fieldOrder.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    return newErrors;
  };

  const handleChange = (field, value) => {
    let sanitizedValue = value;
    if (field === 'mobile') {
      // Only digits, maximum 10
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));

    // Real-time error clearing when valid
    if (errors[field]) {
      const errorMsg = validateField(field, sanitizedValue);
      setErrors((prev) => ({
        ...prev,
        [field]: errorMsg,
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg,
    }));
  };

  const handleFileProcess = (file) => {
    setImageError('');
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only PNG, JPG, or WEBP images are supported');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setImageError('File size exceeds the 10MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        imagePreview: e.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileProcess(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
      imagePreview: '',
    }));
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched = {
      fullName: true,
      businessName: true,
      mobile: true,
      email: true,
      businessType: true,
      password: true,
      address: true,
    };
    setTouched(allTouched);

    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first error field
      if (validationErrors.fullName && fullNameRef.current) fullNameRef.current.focus();
      else if (validationErrors.email && emailRef.current) emailRef.current.focus();
      else if (validationErrors.address && addressRef.current) addressRef.current.focus();
      else if (validationErrors.businessName && businessNameRef.current) businessNameRef.current.focus();
      else if (validationErrors.mobile && mobileRef.current) mobileRef.current.focus();
      else if (validationErrors.businessType && businessTypeRef.current) businessTypeRef.current.focus();
      else if (validationErrors.password && passwordRef.current) passwordRef.current.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new member record
      const newMember = {
        id: `M-${Date.now().toString().slice(-4)}`,
        name: formData.fullName.trim(),
        business: formData.businessName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        businessType: formData.businessType.trim(),
        address: formData.address.trim(),
        country: 'India',
        city: 'Ahmedabad',
        avatar: formData.imagePreview || null,
        profileImage: formData.profileImage,
        status: formData.isActive ? 'Approved' : 'Pending',
        isActive: Boolean(formData.isActive),
        joinedOn: new Date().toISOString().split('T')[0],
      };

      if (onAddMember) {
        await onAddMember(newMember);
      }

      onClose();
    } catch (err) {
      console.error('Error adding member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Add Member" onClose={onClose} maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} noValidate className="p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-4 sm:gap-y-5">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Profile Image (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Profile Image <span className="text-slate-400 font-normal">(Optional)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="profile-image-upload"
              />

              {formData.imagePreview ? (
                <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <img
                    src={formData.imagePreview}
                    alt="Profile Preview"
                    className="h-16 w-16 rounded-xl object-cover border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink truncate">
                      {formData.profileImage?.name || 'Uploaded photo'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formData.profileImage
                        ? `${(formData.profileImage.size / 1024).toFixed(1)} KB`
                        : 'Image selected'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        Change
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all',
                    isDragging
                      ? 'border-brand-500 bg-[#EEF2FF]'
                      : 'border-[#D4DEFE] bg-[#F5F8FF] hover:border-brand-400 hover:bg-[#EEF2FF]/70'
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-label="Upload profile image"
                >
                  {/* Upload Icon matching reference image */}
                  <div className="text-[#3F4BC4] transition-transform duration-200 group-hover:-translate-y-0.5">
                    <svg
                      className="h-9 w-9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 8H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2" />
                      <polyline points="9 7 12 4 15 7" />
                      <line x1="12" y1="4" x2="12" y2="16" />
                    </svg>
                  </div>
                  <p className="mt-2 text-sm font-bold text-ink">Upload Image</p>
                  <p className="mt-1 text-xs text-slate-400">PNG, JPG or WEBP (Max. 10MB)</p>
                </div>
              )}

              {imageError && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{imageError}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-ink mb-1.5">
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                ref={fullNameRef}
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter full name"
                className={cn(
                  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition',
                  errors.fullName && touched.fullName
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none'
                )}
              />
              {errors.fullName && touched.fullName && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="Enter email address"
                className={cn(
                  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition',
                  errors.email && touched.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none'
                )}
              />
              {errors.email && touched.email && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-ink mb-1.5">
                Address <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                ref={addressRef}
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                placeholder="Enter full address"
                className={cn(
                  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition resize-none',
                  errors.address && touched.address
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none'
                )}
              />
              {errors.address && touched.address && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.address}</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-ink mb-1.5">
                Business Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                ref={businessNameRef}
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                onBlur={() => handleBlur('businessName')}
                placeholder="Enter business name"
                className={cn(
                  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition',
                  errors.businessName && touched.businessName
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none'
                )}
              />
              {errors.businessName && touched.businessName && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.businessName}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-ink mb-1.5">
                Mobile Number <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                className={cn(
                  'flex rounded-xl border bg-white overflow-hidden transition',
                  errors.mobile && touched.mobile
                    ? 'border-red-400 focus-within:ring-4 focus-within:ring-red-100'
                    : 'border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100'
                )}
              >
                <span className="flex items-center justify-center bg-[#EEF2FF]/70 px-4 py-3 text-sm font-semibold text-slate-700 border-r border-slate-200 select-none">
                  +91
                </span>
                <input
                  ref={mobileRef}
                  id="mobile"
                  name="mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  onBlur={() => handleBlur('mobile')}
                  placeholder="Enter mobile number"
                  className="flex-1 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              {errors.mobile && touched.mobile && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.mobile}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-semibold text-ink mb-1.5">
                Business Type <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                ref={businessTypeRef}
                id="businessType"
                name="businessType"
                type="text"
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                onBlur={() => handleBlur('businessType')}
                placeholder="Enter business type e.g. (Wholesaler, Retailer)"
                className={cn(
                  'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition',
                  errors.businessType && touched.businessType
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none'
                )}
              />
              {errors.businessType && touched.businessType && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.businessType}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
                Password <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter password (min. 6 characters)"
                  autoComplete="new-password"
                  className={cn(
                    'w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-ink placeholder:text-slate-400 transition',
                    errors.password && touched.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Active / Inactive Status Switch */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="block text-sm font-semibold text-ink">Member Activity Status</span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {formData.isActive
                  ? 'Active — Member account is active and enabled'
                  : 'Inactive — Member account is deactivated and suspended'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(formData.isActive)}
              onClick={() => handleChange('isActive', !formData.isActive)}
              className="inline-flex items-center gap-2.5 cursor-pointer focus:outline-none select-none shrink-0 transition-opacity active:opacity-80"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  formData.isActive ? 'bg-[#2832A4]' : 'bg-slate-300'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    formData.isActive ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </span>
              <span className={cn('text-sm font-medium w-16 text-left select-none', formData.isActive ? 'text-[#2832A4]' : 'text-slate-400')}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto text-center justify-center rounded-full border border-slate-200 bg-white px-7 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-ink transition focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#3F4BC4] bg-[#F7F9FF] px-6 py-2.5 text-sm font-semibold text-[#3F4BC4] hover:bg-[#EEF2FF] hover:border-[#333DA8] active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-100 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add Member</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
