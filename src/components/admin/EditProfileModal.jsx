'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import DatePicker from '@/components/common/DatePicker';
import { updateAdminProfile, getAvatarUrl } from '@/services/admin.service';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/hooks/useAuth';

export default function EditProfileModal({ open, profile, onClose, onProfileUpdated }) {
  const { showToast } = useToast();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    gender: 'Male',
    dateOfBirth: '',
    city: '',
    pincode: '',
    address: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync profile when opened
  useEffect(() => {
    if (profile) {
      const currentImg = profile.image || profile.profilePhoto || profile.avatar || '';
      setFormData({
        fullName: profile.fullName || profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile || profile.phone || '',
        gender: profile.gender || 'Male',
        dateOfBirth: profile.dateOfBirth || profile.dob || '',
        city: profile.city || '',
        pincode: profile.pincode || '',
        address: profile.address || '',
        image: currentImg,
      });
      setImagePreview(getAvatarUrl(currentImg) || '');
      setImageFile(null);
      setImageRemoved(false);
      setFormError('');
    }
  }, [profile, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a PNG, JPG, or WEBP image', 'error');
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      showToast('Image file size must be under 5MB', 'error');
      return;
    }

    setImageFile(file);
    setImageRemoved(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
    showToast('Image selected! Click "Save Changes" to apply.', 'info');
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Image removed', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }

    setSaving(true);
    try {
      let updated;
      if (imageFile) {
        // Send as FormData to handle the uploaded file
        const fd = new FormData();
        fd.append('fullName', formData.fullName.trim());
        fd.append('name', formData.fullName.trim());
        fd.append('mobile', formData.mobile.trim());
        fd.append('phone', formData.mobile.trim());
        fd.append('gender', formData.gender);
        fd.append('dateOfBirth', formData.dateOfBirth.trim());
        fd.append('dob', formData.dateOfBirth.trim());
        fd.append('city', formData.city.trim());
        fd.append('pincode', formData.pincode.trim());
        fd.append('address', formData.address.trim());
        fd.append('image', imageFile);
        fd.append('profilePhoto', imageFile);
        fd.append('avatar', imageFile);

        updated = await updateAdminProfile(fd);
      } else {
        const payload = {
          fullName: formData.fullName.trim(),
          name: formData.fullName.trim(),
          mobile: formData.mobile.trim(),
          phone: formData.mobile.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth.trim(),
          dob: formData.dateOfBirth.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
          address: formData.address.trim(),
        };

        if (imageRemoved) {
          payload.image = null;
          payload.profilePhoto = null;
          payload.avatar = null;
        }

        updated = await updateAdminProfile(payload);
      }

      // Sync user state in header & session
      const finalImg =
        updated?.image ||
        updated?.profilePhoto ||
        updated?.avatar ||
        (imageRemoved ? null : imagePreview);

      if (updateUser) {
        updateUser({
          name: updated?.fullName || updated?.name || formData.fullName,
          image: finalImg,
          avatar: finalImg,
        });
      }

      showToast('Admin profile updated successfully!', 'success');
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to update profile';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100';

  return (
    <Modal
      open={open}
      title="Edit Admin Profile"
      onClose={onClose}
      maxWidth="max-w-2xl"
      bodyClassName="p-6 md:p-8"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-in fade-in duration-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Profile Image Editable Field */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Profile Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Avatar
                    name={formData.fullName || 'Admin'}
                    src={null}
                    size="lg"
                    className="h-full w-full text-xl"
                  />
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <p className="text-xs font-bold text-ink truncate">
                {imageFile
                  ? imageFile.name
                  : imagePreview
                  ? 'Current Profile Image'
                  : 'No image uploaded'}
              </p>
              <p className="text-[11px] text-slate-400">
                Allowed formats: PNG, JPG, or WEBP. Max size: 5MB.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl text-xs py-1.5 px-3 flex items-center gap-1.5 border-slate-300 bg-white hover:bg-slate-50"
                >
                  <Upload className="h-3.5 w-3.5 text-brand-600" />
                  <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                </Button>

                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter full name"
                className={inputBase}
              />
            </div>
          </div>

          {/* Email Address (STRICTLY READ-ONLY) */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                readOnly
                tabIndex={-1}
                value={formData.email}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/90 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-600 cursor-not-allowed select-all focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Email address cannot be changed.
            </p>
          </div>

          {/* Mobile / Phone */}
          <div>
            <label htmlFor="mobile" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Mobile / Phone
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="9876543210"
                className={inputBase}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-ink transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth with Custom Calendar Picker */}
          <div>
            <DatePicker
              id="dateOfBirth"
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(val) => handleChange('dateOfBirth', val)}
              placeholder="Select date of birth"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              City
            </label>
            <div className="relative">
              <Building className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Ahmedabad"
                className={inputBase}
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label htmlFor="pincode" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Pincode
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="pincode"
                type="text"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="380001"
                className={inputBase}
              />
            </div>
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter full address"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            className="px-6 py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
