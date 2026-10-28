'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  Edit3,
  CheckCircle2,
  Clock,
  Hash,
  Activity,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EditProfileModal from '@/components/admin/EditProfileModal';
import ChangePasswordModal from '@/components/admin/ChangePasswordModal';
import { fetchAdminProfile } from '@/services/admin.service';


// Formats birthday to DD-MM-YYYY format
function formatDob(val) {
  if (!val) return '';
  const trimmed = String(val).trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-YYYY
      const [y, m, d] = parts;
      const cleanDay = d.split('T')[0];
      return `${cleanDay.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    } else {
      // DD-MM-YYYY
      const [d, m, y] = parts;
      const cleanYear = y.split('T')[0];
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${cleanYear}`;
    }
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function ProfilePage() {

  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileUpdated = (updated) => {
    setProfile(updated);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading profile details..." />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-card max-w-lg mx-auto mt-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
          <AlertCircle className="h-6 w-6 stroke-[2.2]" />
        </div>
        <h3 className="text-lg font-bold text-ink">Unable to Load Profile</h3>
        <p className="mt-1.5 text-sm text-slate-500">{error}</p>
        <Button
          type="button"
          variant="primary"
          onClick={loadProfile}
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  const name = profile?.fullName || profile?.name || user?.name || 'Admin User';
  const email = profile?.email || user?.email || 'admin@gmail.com';
  const role = profile?.role || user?.role || 'Admin';
  const status = profile?.status || (profile?.isActive ? 'active' : 'inactive');
  const mobile = profile?.mobile || profile?.phone;
  const dob = profile?.dateOfBirth || profile?.dob;
  const gender = profile?.gender;
  const address = profile?.address;
  const city = profile?.city;
  const pincode = profile?.pincode;
  const avatar = profile?.avatar || profile?.profilePhoto || user?.avatar;
  const id = profile?.id;
  const mongoId = profile?._id;
  const createdAt = profile?.createdAt || 'N/A';
  const updatedAt = profile?.updatedAt || 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Header with Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/70 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1F3B] tracking-tight">Admin Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal administrator account details and contact information.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => setChangePwOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <KeyRound className="h-4 w-4 text-brand-600" />
            <span>Change Password</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Hero Card */}
        <div className="space-y-6">
          <section className="flex flex-col items-center rounded-3xl border border-white bg-white p-8 text-center shadow-card">
            <div className="relative">
              <Avatar
                name={name}
                src={avatar}
                size="xl"
                className="h-24 w-24 text-3xl font-bold shadow-md border-4 border-slate-50"
              />
              <span
                className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-xs"
                title="Active Account"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-ink tracking-tight">{name}</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">{email}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2832A4] to-[#4F5DEC] px-3.5 py-1 text-xs font-semibold text-white shadow-xs capitalize">
                <Shield className="h-3 w-3" />
                {role}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 capitalize">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {status}
              </span>
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
              {/* <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Admin ID</span>
                <span className="font-mono font-bold text-slate-700">#{id || '12'}</span>
              </div> */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Joined On</span>
                <span className="font-medium text-slate-700">{createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Last Updated</span>
                <span className="font-medium text-slate-700">{updatedAt}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="w-full rounded-2xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePwOpen(true)}
                className="w-full rounded-2xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <KeyRound className="h-3.5 w-3.5 text-brand-600" />
                <span>Change Password</span>
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column: Detailed Information Blocks */}
        <div className="space-y-6 lg:col-span-2">
          {/* Block 1: Personal & Contact Information */}
          <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <User className="h-4 w-4 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-lg text-ink">Personal & Contact Details</h3>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Full Name</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{name}</span>
                </dd>
              </div>

              {/* Email (Read-Only) */}
              <div>
                <div className="flex items-center gap-2">
                  <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Email Address</dt>
                </div>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </dd>
              </div>

              {/* Mobile / Phone */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Mobile / Contact</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{mobile || <span className="text-slate-400 font-normal italic">Not provided</span>}</span>
                </dd>
              </div>

              {/* Gender */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Gender</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{gender || <span className="text-slate-400 font-normal italic">Not provided</span>}</span>
                </dd>
              </div>

              {/* Date of Birth */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Date of Birth</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{formatDob(dob) || <span className="text-slate-400 font-normal italic">Not provided</span>}</span>
                </dd>
              </div>

              {/* Role */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">System Role</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink capitalize">
                  <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{role}</span>
                </dd>
              </div>
            </dl>
          </section>

          {/* Block 2: Location & Address Details */}
          <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <MapPin className="h-4 w-4 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-lg text-ink">Location & Address</h3>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* City */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">City</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Building className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{city || <span className="text-slate-400 font-normal italic">Not provided</span>}</span>
                </dd>
              </div>

              {/* Pincode */}
              <div>
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Pincode</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{pincode || <span className="text-slate-400 font-normal italic">Not provided</span>}</span>
                </dd>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase font-bold tracking-wider text-slate-400">Full Address</dt>
                <dd className="mt-1.5 flex items-start gap-2 text-sm font-semibold text-ink leading-relaxed">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400 shrink-0" />
                  <span>{address || <span className="text-slate-400 font-normal italic">Not provided</span>}</span>
                </dd>
              </div>
            </dl>
          </section>


        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={changePwOpen}
        onClose={() => setChangePwOpen(false)}
      />
    </div>
  );
}
