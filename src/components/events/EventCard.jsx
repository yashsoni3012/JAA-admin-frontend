'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Edit3, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EventCard({
  event,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [isActive, setIsActive] = useState(Boolean(event.isActive));

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    const nextState = !isActive;
    setIsActive(nextState);

    try {
      if (onToggleStatus) {
        await onToggleStatus(event.id);
      }
    } catch (err) {
      // Revert optimistic update on failure
      setIsActive(!nextState);
    } finally {
      setIsToggling(false);
    }
  };

  const displayDate =
    event.displayStartDate ||
    (event.startDate ? event.startDate : '27 July 2026');

  const displayTime =
    event.startTime && event.endTime
      ? `${event.startTime} - ${event.endTime}`
      : '10:00AM - 7:00PM';

  return (
    <div className="group relative rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-5 md:gap-6">
        {/* COLUMN 1 (Col 1-7): Event Thumbnail + Details */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-52 h-36 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-100 shadow-xs">
            <img
              src={event.image}
              alt={event.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/uploads/events/workshop.jpg';
              }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Event Details */}
          <div className="min-w-0 flex-1 space-y-2">
            <h3
              onClick={() => onView && onView(event)}
              className="text-lg md:text-xl font-bold text-ink truncate cursor-pointer hover:text-[#2832A4] transition-colors"
            >
              {event.title}
            </h3>

            {/* Meta row: Date | Time | City */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">{displayDate}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">{displayTime}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">{event.city || 'Ahmedabad'}</span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-1.5 text-xs text-slate-500 leading-relaxed">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="truncate max-w-xl text-slate-600">
                {event.address || 'The Exhibition Center, Science City Road, Ahmedabad, Gujarat - 380009'}
              </span>
            </div>

            {/* Posted By */}
            <p className="text-xs text-slate-400 font-medium pt-0.5">
              Posted by:{' '}
              <span className="text-slate-700 font-semibold">
                {event.postedBy || 'Admin'}
              </span>
            </p>
          </div>
        </div>

        {/* COLUMN 2 (Col 8-9): Dedicated Status Column with Switch */}
        <div className="lg:col-span-2 xl:col-span-2 flex flex-row lg:flex-col items-center lg:items-center justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 lg:hidden">
            Status
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={handleToggle}
              disabled={isToggling}
              title={isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
              aria-label="Toggle active event status"
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 disabled:opacity-60',
                isActive ? 'bg-[#2832A4]' : 'bg-slate-300'
              )}
            >
              <span className="sr-only">Toggle active event status</span>
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  isActive ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <span
              className={cn(
                'text-xs font-semibold select-none',
                isActive ? 'text-[#2832A4]' : 'text-slate-400'
              )}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* COLUMN 3 (Col 10-12): Dedicated Actions Column with Eye Icon, Edit & Delete */}
        <div className="lg:col-span-3 xl:col-span-2 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-2 lg:pt-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 lg:hidden">
            Actions
          </span>
          <div className="flex items-center gap-2.5">
            {/* View Details Eye Icon Button (replacing text button) */}
            <button
              type="button"
              onClick={() => onView && onView(event)}
              title="View Details"
              aria-label="View Details"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
            >
              <Eye className="h-4 w-4 stroke-[2]" />
            </button>

            {/* Edit Event Button */}
            <button
              type="button"
              onClick={() => onEdit && onEdit(event)}
              title="Edit Event"
              aria-label="Edit Event"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#2832A4] hover:text-[#2832A4] hover:bg-slate-50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
            >
              <Edit3 className="h-4 w-4 stroke-[2]" />
            </button>

            {/* Delete Event Button */}
            <button
              type="button"
              onClick={() => onDelete && onDelete(event)}
              title="Delete Event"
              aria-label="Delete Event"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              <Trash2 className="h-4 w-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
