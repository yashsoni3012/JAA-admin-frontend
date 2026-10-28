'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Parses diverse date inputs (YYYY-MM-DD, DD-MM-YYYY, or standard Date strings)
 */
function parseDateString(val) {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const parsed = new Date(y, m, d);
      return isNaN(parsed.getTime()) ? null : parsed;
    } else {
      // DD-MM-YYYY
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsed = new Date(y, m, d);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a Date object to DD-MM-YYYY
 */
function formatDateToDMY(date) {
  if (!date || isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}


/**
 * Customized Date Picker Component
 * Matches the reference design with M-T-W-T-F-S-S header, circular date indicators,
 * and "Remove" and "Done" action pill buttons.
 */
export default function DatePicker({
  id = 'date-picker',
  label,
  value,
  onChange,
  placeholder = 'Select date',
  className,
  inputClassName,
  disabled = false,
  readOnly = false,
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse current active value
  const activeDate = useMemo(() => parseDateString(value), [value]);

  // Current calendar view month & year
  const [viewYear, setViewYear] = useState(() => (activeDate ? activeDate.getFullYear() : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (activeDate ? activeDate.getMonth() : new Date().getMonth()));

  // Pending selected date within the calendar (before pressing Done)
  const [pendingDate, setPendingDate] = useState(() => activeDate);

  // View mode: 'calendar' or 'year-select' (convenient for Date of Birth navigation)
  const [viewMode, setViewMode] = useState('calendar');

  // Synchronize calendar view whenever value changes or popover opens
  useEffect(() => {
    if (activeDate) {
      setViewYear(activeDate.getFullYear());
      setViewMonth(activeDate.getMonth());
      setPendingDate(activeDate);
    } else {
      setPendingDate(null);
    }
  }, [activeDate, isOpen]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setViewMode('calendar');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Days in month calculation (Monday-first: M T W T F S S)
  const calendarDays = useMemo(() => {
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    // (getDay() + 6) % 7 yields 0 for Monday, 6 for Sunday
    const startDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const days = [];
    // Blank padding slots before the 1st
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      days.push({ day: d, key: `day-${d}` });
    }
    return days;
  }, [viewYear, viewMonth]);

  // Today indicator
  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  // Selected indicator
  const isSelected = (day) =>
    pendingDate &&
    pendingDate.getFullYear() === viewYear &&
    pendingDate.getMonth() === viewMonth &&
    pendingDate.getDate() === day;

  // Handle day click
  const handleDayClick = (day) => {
    const newSelected = new Date(viewYear, viewMonth, day);
    setPendingDate(newSelected);
  };

  // Confirm selection ("Done" button)
  const handleDone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pendingDate) {
      onChange(formatDateToDMY(pendingDate));
    }
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Remove selection ("Remove" button)
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDate(null);
    onChange('');
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Display value formatted as DD-MM-YYYY
  const displayValue = useMemo(() => {
    if (!value) return '';
    const parsed = parseDateString(value);
    return parsed ? formatDateToDMY(parsed) : value;
  }, [value]);

  // Quick years list for Date of Birth selection (past 100 years to current)
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 90; y--) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}

      {/* Input Display Box */}
      <div
        onClick={() => {
          if (!disabled && !readOnly) setIsOpen((prev) => !prev);
        }}
        className={cn(
          'relative flex items-center w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink transition cursor-pointer select-none',
          'hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-50',
          isOpen && 'border-brand-500 ring-4 ring-brand-100',
          inputClassName
        )}
      >
        <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <span className={cn('truncate', !displayValue && 'text-slate-400')}>
          {displayValue || placeholder}
        </span>
      </div>


      {/* Customized Popup Calendar */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Date Picker Calendar"
          className="absolute z-[100] mt-2 left-0 sm:left-auto right-auto sm:right-0 w-[300px] sm:w-[320px] rounded-3xl bg-white p-5 shadow-2xl shadow-slate-900/15 border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header: Month Year + Navigation Arrows */}
          <div className="flex items-center justify-between pb-3">
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'calendar' ? 'year-select' : 'calendar'))}
              className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition flex items-center gap-1.5 focus:outline-none"
              title="Click to jump to another year"
            >
              <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            <div className="flex items-center gap-1 text-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-ink transition focus:outline-none"
              >
                <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-ink transition focus:outline-none"
              >
                <ChevronRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* View Mode: Fast Year & Month Picker */}
          {viewMode === 'year-select' ? (
            <div className="py-2">
              <p className="text-xs font-semibold text-slate-400 mb-2">Select Year & Month:</p>
              {/* Months Grid */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 text-xs">
                {MONTH_NAMES.map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setViewMode('calendar');
                    }}
                    className={cn(
                      'py-1.5 px-1 rounded-lg text-center font-medium transition',
                      viewMonth === idx
                        ? 'bg-brand-500 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {name.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* Year Dropdown/Scroll */}
              <div className="max-h-36 overflow-y-auto no-scrollbar grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2 text-xs">
                {yearList.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewYear(yr);
                      setViewMode('calendar');
                    }}
                    className={cn(
                      'py-1.5 rounded-lg text-center font-medium transition',
                      viewYear === yr
                        ? 'bg-[#2B3BE5] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Weekdays Row: M  T  W  T  F  S  S */}
              <div className="grid grid-cols-7 gap-1 text-center py-2">
                {WEEKDAYS.map((day, idx) => (
                  <div
                    key={`${day}-${idx}`}
                    className="text-xs font-bold text-slate-800 flex items-center justify-center h-8"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((item) => {
                  if (item.day === null) {
                    return <div key={item.key} className="h-9 w-9" />;
                  }

                  const selected = isSelected(item.day);
                  const currentToday = isToday(item.day);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleDayClick(item.day)}
                      className={cn(
                        'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition focus:outline-none',
                        selected
                          ? 'bg-[#2B3BE5] text-white font-bold shadow-md shadow-blue-500/35 scale-105'
                          : currentToday
                          ? 'bg-[#F0F5FF] text-[#2B3BE5] font-bold hover:bg-blue-100'
                          : 'text-slate-800 hover:bg-slate-100'
                      )}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Action Buttons: Remove & Done */}
          <div className="mt-5 flex items-center justify-between gap-3 pt-2 border-t border-slate-50">
            <button
              type="button"
              onClick={handleRemove}
              className="flex-1 rounded-full bg-[#626C7A] hover:bg-[#525B68] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition active:scale-[0.98] focus:outline-none"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-full bg-[#2B3BE5] hover:bg-[#202eb8] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition active:scale-[0.98] focus:outline-none"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
