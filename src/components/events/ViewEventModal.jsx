'use client';

import { Calendar, Clock, MapPin, User, Edit3, X, CheckCircle2, XCircle } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function ViewEventModal({
  open,
  event,
  onClose,
  onEdit,
}) {
  if (!open || !event) return null;

  return (
    <Modal
      open={open}
      title="Event Details"
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div className="p-6 md:p-8 space-y-6">
        {/* Event Banner Image */}
        <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
          <img
            src={event.image}
            alt={event.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/uploads/events/workshop.jpg';
            }}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                event.isActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  event.isActive ? 'bg-white' : 'bg-slate-400'
                }`}
              />
              {event.isActive ? 'Active Event' : 'Inactive Event'}
            </span>
          </div>
        </div>

        {/* Title & Posted By */}
        <div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            {event.title}
          </h2>
          <p className="mt-1 text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Posted by:</span>
            <span className="text-slate-700 font-semibold">{event.postedBy || 'Admin'}</span>
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50/80 p-5 border border-slate-100 text-sm">
          {/* Start Date & Time */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-600" /> Start Schedule
            </span>
            <p className="font-semibold text-ink">
              {event.displayStartDate || event.startDate}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {event.startTime || '10:00 AM'}
            </p>
          </div>

          {/* End Date & Time */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-600" /> End Schedule
            </span>
            <p className="font-semibold text-ink">
              {event.displayEndDate || event.endDate}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {event.endTime || '07:00 PM'}
            </p>
          </div>

          {/* Location */}
          <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-200/60">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand-600" /> Location & Venue
            </span>
            <p className="font-semibold text-ink">{event.city || 'Ahmedabad'}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {event.address}
            </p>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-100">
              {event.description}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Close
          </Button>

          {onEdit && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Event</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

