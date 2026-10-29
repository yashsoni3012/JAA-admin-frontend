'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
 * Safely parses diverse date inputs (YYYY-MM-DD, DD-MM-YYYY, Date objects, or text like "27 July 2026")
 * into a local Date without UTC timezone shifts.
 */
function parseDateString(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  // YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    const parsed = new Date(y, m, d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    const parsed = new Date(y, m, d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Fallback for standard date strings (e.g. "27 July 2026")
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a Date object to YYYY-MM-DD (standard API ISO format)
 */
function formatDateToYMD(date) {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
 * Formats a Date object to readable string: "27 July 2026"
 */
function formatReadable(date) {
  if (!date || isNaN(date.getTime())) return '';
  const d = date.getDate();
  const m = MONTH_NAMES[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Formats a date according to a requested format key
 */
function formatByFormat(date, format) {
  if (!date) return '';
  if (format === 'YYYY-MM-DD') return formatDateToYMD(date);
  if (format === 'DD-MM-YYYY') return formatDateToDMY(date);
  if (format === 'readable') return formatReadable(date);
  return formatDateToYMD(date);
}

/**
 * Customized Date Picker Component
 * Matches the reference design with M-T-W-T-F-S-S header, circular date indicators,
 * and "Remove" and "Done" action pill buttons.
 */
export default function DatePicker({
  id = 'date-picker',
  name,
  label,
  value,
  onChange,
  placeholder = 'Select date',
  valueFormat = 'YYYY-MM-DD', // 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'readable'
  displayFormat = 'readable',  // 'readable' ("27 July 2026") | 'DD-MM-YYYY' | 'YYYY-MM-DD'
  minDate = null,
  maxDate = null,
  align = 'left',
  className,
  inputClassName,
  disabled = false,
  readOnly = false,
  required = false,
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse current active value
  const activeDate = useMemo(() => parseDateString(value), [value]);
  const minDateObj = useMemo(() => parseDateString(minDate), [minDate]);
  const maxDateObj = useMemo(() => parseDateString(maxDate), [maxDate]);

  // Current calendar view month & year
  const [viewYear, setViewYear] = useState(() =>
    activeDate ? activeDate.getFullYear() : new Date().getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    activeDate ? activeDate.getMonth() : new Date().getMonth()
  );

  // Pending selected date within the calendar (before pressing Done)
  const [pendingDate, setPendingDate] = useState(() => activeDate);

  // View mode: 'calendar' or 'year-select' (convenient for fast year/month jumps)
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

  // Helper to commit date to parent
  const commitDate = useCallback(
    (targetDate) => {
      if (!onChange) return;
      if (!targetDate) {
        onChange('');
      } else {
        const formatted = formatByFormat(targetDate, valueFormat);
        onChange(formatted);
      }
    },
    [onChange, valueFormat]
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // If a pending date was chosen, apply it smoothly
        if (pendingDate) {
          commitDate(pendingDate);
        }
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
  }, [isOpen, pendingDate, commitDate]);

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

  // Date disabled check (minDate / maxDate)
  const isDateDisabled = useCallback(
    (day) => {
      if (!day) return true;
      const target = new Date(viewYear, viewMonth, day);
      target.setHours(0, 0, 0, 0);

      if (minDateObj) {
        const min = new Date(minDateObj);
        min.setHours(0, 0, 0, 0);
        if (target < min) return true;
      }
      if (maxDateObj) {
        const max = new Date(maxDateObj);
        max.setHours(0, 0, 0, 0);
        if (target > max) return true;
      }
      return false;
    },
    [viewYear, viewMonth, minDateObj, maxDateObj]
  );

  // Handle day click
  const handleDayClick = (day) => {
    if (isDateDisabled(day)) return;
    const newSelected = new Date(viewYear, viewMonth, day);
    setPendingDate(newSelected);
  };

  // Quick double click day selection
  const handleDayDoubleClick = (day) => {
    if (isDateDisabled(day)) return;
    const newSelected = new Date(viewYear, viewMonth, day);
    setPendingDate(newSelected);
    commitDate(newSelected);
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Confirm selection ("Done" button)
  const handleDone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pendingDate) {
      commitDate(pendingDate);
    }
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Remove selection ("Remove" button)
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDate(null);
    commitDate(null);
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Formatted display value for input box
  const displayValue = useMemo(() => {
    if (!value) return '';
    const parsed = parseDateString(value);
    if (!parsed) return value;
    return formatByFormat(parsed, displayFormat);
  }, [value, displayFormat]);

  // Quick years list for fast navigation (past 50 years to future 10 years)
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear + 10; y >= currentYear - 50; y--) {
      years.push(y);
    }
    return years;
  }, []);

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Display Box */}
      <div
        id={id}
        role="button"
        tabIndex={disabled || readOnly ? -1 : 0}
        aria-label={label || placeholder}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => {
          if (!disabled && !readOnly) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (disabled || readOnly) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          'relative flex items-center w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink transition cursor-pointer select-none shadow-xs',
          'hover:border-slate-300 focus:outline-none focus:border-[#2832A4] focus:ring-2 focus:ring-[#2832A4]/20',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-50',
          isOpen && 'border-[#2832A4] ring-2 ring-[#2832A4]/20',
          inputClassName
        )}
      >
        <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <span className={cn('truncate', !displayValue ? 'text-slate-400 font-normal text-sm' : 'text-slate-900 font-semibold text-sm')}>
          {displayValue || placeholder}
        </span>
      </div>

      {/* Hidden native input for form compatibility if name is provided */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ''}
        />
      )}

      {/* Customized Popup Calendar - Normal Medium Balanced Size */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Date Picker Calendar"
          className={cn(
            'absolute z-[100] mt-2 w-[288px] rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {/* Header: Month Year + Navigation Arrows */}
          <div className="flex items-center justify-between pb-2.5">
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'calendar' ? 'year-select' : 'calendar'))}
              className="text-[15px] font-bold text-slate-900 hover:text-[#2832A4] transition flex items-center gap-1.5 focus:outline-none"
              title="Click to jump to another month or year"
            >
              <span>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            <div className="flex items-center gap-1 text-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex h-7.5 w-7.5 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-ink transition focus:outline-none"
              >
                <ChevronLeft className="h-4 w-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex h-7.5 w-7.5 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-ink transition focus:outline-none"
              >
                <ChevronRight className="h-4 w-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* View Mode: Fast Year & Month Picker */}
          {viewMode === 'year-select' ? (
            <div className="py-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">Select Month & Year:</p>
              {/* Months Grid */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 text-xs">
                {MONTH_NAMES.map((nameStr, idx) => (
                  <button
                    key={nameStr}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setViewMode('calendar');
                    }}
                    className={cn(
                      'py-1.5 px-1 rounded-lg text-center font-semibold transition',
                      viewMonth === idx
                        ? 'bg-[#2832A4] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {nameStr.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* Year Dropdown/Scroll */}
              <div className="max-h-32 overflow-y-auto no-scrollbar grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2 text-xs">
                {yearList.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setViewYear(yr);
                      setViewMode('calendar');
                    }}
                    className={cn(
                      'py-1.5 rounded-lg text-center font-semibold transition',
                      viewYear === yr
                        ? 'bg-[#2832A4] text-white font-bold'
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
              <div className="grid grid-cols-7 gap-1 text-center py-1.5">
                {WEEKDAYS.map((day, idx) => (
                  <div
                    key={`${day}-${idx}`}
                    className="text-xs font-bold text-slate-600 flex items-center justify-center h-7"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((item) => {
                  if (item.day === null) {
                    return <div key={item.key} className="h-8.5 w-8.5" />;
                  }

                  const selected = isSelected(item.day);
                  const currentToday = isToday(item.day);
                  const disabledDay = isDateDisabled(item.day);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => handleDayClick(item.day)}
                      onDoubleClick={() => handleDayDoubleClick(item.day)}
                      className={cn(
                        'mx-auto flex h-8.5 w-8.5 items-center justify-center rounded-full text-[13px] font-semibold transition focus:outline-none',
                        disabledDay
                          ? 'text-slate-300 cursor-not-allowed bg-transparent'
                          : selected
                          ? 'bg-[#2832A4] text-white font-bold shadow-md shadow-[#2832A4]/35 scale-105'
                          : currentToday
                          ? 'bg-[#EEF2FF] text-[#2832A4] font-bold hover:bg-[#E0E7FF]'
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
          <div className="mt-4 flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRemove}
              className="flex-1 rounded-full bg-[#626C7A] hover:bg-[#525B68] py-2 text-xs sm:text-[13px] font-semibold text-white shadow-xs transition active:scale-[0.98] focus:outline-none"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-full bg-[#2832A4] hover:bg-[#1E2580] py-2 text-xs sm:text-[13px] font-semibold text-white shadow-md shadow-[#2832A4]/25 transition active:scale-[0.98] focus:outline-none"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
