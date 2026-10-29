'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { updateMember } from '@/services/admin.service';
import { cn } from '@/lib/utils';

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler',
  'Manufacturer',
  'Bullion Dealer',
  'Artisan / Karigar',
  'Gemstone Trader',
  'Exporter',
  'Other',
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'approved', label: 'Approved', labelText: 'Approved', color: 'emerald' },
  { value: 'rejected', label: 'Rejected', color: 'rose' },
];

export default function EditMemberModal({ open, member, onClose, onMemberUpdated }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    business: '',
    businessType: 'Retailer',
    mobile: '',
    email: '',
    city: 'Ahmedabad',
    address: '',
    membershipId: '',
    status: 'pending',
    rejectionReason: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Sync form state whenever modal opens or active member changes
  useEffect(() => {
    if (member && open) {
      setFormData({
        name: member.name || member.fullName || '',
        business: member.business || member.businessName || '',
        businessType: member.businessType || 'Retailer',
        mobile: member.mobile || member.phone || '',
        email: member.email || '',
        city: member.city || 'Ahmedabad',
        address: member.address || '',
        membershipId: member.membershipId || `JBAD${150 + Number(member.id || 0)}`,
        status: (member.status || 'pending').toString().toLowerCase(),
        rejectionReason: member.rejectionReason || member.reason || '',
      });
      setAvatarFile(null);
      setAvatarPreview(member.avatar || member.image || member.profilePhoto || null);
      setError('');
    }
  }, [member, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setError('');
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

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) return;

    if (!formData.name.trim()) {
      setError('Member name is required');
      return;
    }
    if (!formData.business.trim()) {
      setError('Business name is required');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }
    if (formData.status === 'rejected' && !formData.rejectionReason.trim()) {
      setError('Please specify a rejection reason when status is Rejected');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let updatedRecord;
      if (avatarFile) {
        const payload = new FormData();
        payload.append('avatar', avatarFile);
        payload.append('name', formData.name.trim());
        payload.append('business', formData.business.trim());
        payload.append('businessType', formData.businessType.trim());
        payload.append('mobile', formData.mobile.trim());
        payload.append('email', formData.email.trim());
        payload.append('city', formData.city.trim());
        payload.append('address', formData.address.trim());
        payload.append('membershipId', formData.membershipId.trim());
        payload.append('status', formData.status.toLowerCase());
        payload.append('rejectionReason', formData.status === 'rejected' ? formData.rejectionReason.trim() : '');

        updatedRecord = await updateMember(member.id, payload);
      } else {
        const payload = {
          name: formData.name.trim(),
          business: formData.business.trim(),
          businessType: formData.businessType.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          membershipId: formData.membershipId.trim(),
          status: formData.status.toLowerCase(),
          rejectionReason: formData.status === 'rejected' ? formData.rejectionReason.trim() : '',
          avatar: avatarPreview,
        };
        updatedRecord = await updateMember(member.id, payload);
      }

      if (onMemberUpdated) {
        onMemberUpdated(updatedRecord);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update member:', err);
      setError(err.message || 'Failed to update member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !member) return null;

  return (
    <Modal
      open={open}
      title={`Edit Member — ${member.name || 'Member'}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} noValidate className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Top: Avatar Edit & Status Pill */}
        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
          <div className="relative group shrink-0">
            <Avatar
              name={formData.name || 'Member'}
              src={avatarPreview}
              size="xl"
              className="h-20 w-20 text-2xl font-bold shadow-md border-2 border-white object-cover"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="edit-member-avatar"
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h4 className="text-base font-bold text-ink truncate">
              {formData.name || 'Member Name'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Membership ID:{' '}
              <span className="font-mono font-semibold text-slate-700">
                {formData.membershipId}
              </span>
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Upload className="h-3 w-3 text-brand-600" />
                Change Photo
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition shadow-xs"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Status Selector */}
          <div className="w-full sm:w-auto text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Membership Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full sm:w-44 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Rejection Reason (Conditional) */}
        {formData.status === 'rejected' && (
          <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 space-y-1.5">
            <label className="block text-xs font-bold text-red-700 uppercase tracking-wider">
              Rejection Reason *
            </label>
            <input
              type="text"
              name="rejectionReason"
              value={formData.rejectionReason}
              onChange={handleChange}
              placeholder="Provide a clear reason for rejecting this member..."
              className="w-full rounded-xl border border-red-300 bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400/20"
            />
          </div>
        )}

        {/* 2-Column Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Yash Ranpura"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="business"
              value={formData.business}
              onChange={handleChange}
              placeholder="e.g. Ranpura Jewellers"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Membership ID */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Membership ID
            </label>
            <input
              type="text"
              name="membershipId"
              value={formData.membershipId}
              onChange={handleChange}
              placeholder="e.g. JBAD168"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="e.g. 9737126164"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. member@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Ahmedabad"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Maninagar, Ahmedabad"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Footer Actions */}
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
            className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold shadow-md shadow-brand-500/20"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

