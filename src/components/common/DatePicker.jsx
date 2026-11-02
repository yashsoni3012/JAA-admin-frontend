'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
 * Safely parses diverse date inputs (YYYY-MM-DD, DD-MM-YYYY, Date objects, or text like "27 July 2026")
 * into a local Date without UTC timezone shifts.
 */
export function parseDateString(val) {
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
export function formatDateToYMD(date) {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date object to DD-MM-YYYY
 */
export function formatDateToDMY(date) {
  if (!date || isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Formats a Date object to readable string: "27 July 2026"
 */
export function formatReadable(date) {
  if (!date || isNaN(date.getTime())) return '';
  const d = date.getDate();
  const m = MONTH_NAMES[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Formats a date according to a requested format key
 */
export function formatByFormat(date, format) {
  if (!date) return '';
  if (format === 'YYYY-MM-DD') return formatDateToYMD(date);
  if (format === 'DD-MM-YYYY') return formatDateToDMY(date);
  if (format === 'readable') return formatReadable(date);
  return formatDateToYMD(date);
}

/**
 * Customized Date Picker Component
 * Matches the reference design with M-T-W-T-F-S-S header, circular date indicators,
 * fast month/year jump, and "Remove" and "Done" action pill buttons.
 *
 * Supports both Single Date and Date Range modes (isRange=true).
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
  isRange = false,
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse active value(s)
  const activeDate = useMemo(() => (!isRange ? parseDateString(value) : null), [isRange, value]);

  const activeRange = useMemo(() => {
    if (!isRange || !value) return { start: null, end: null };
    if (typeof value === 'object') {
      return {
        start: parseDateString(value.startDate || value.start),
        end: parseDateString(value.endDate || value.end),
      };
    }
    if (typeof value === 'string') {
      const parts = value.split(/\s+(?:-|to)\s+/);
      return {
        start: parseDateString(parts[0]),
        end: parts[1] ? parseDateString(parts[1]) : null,
      };
    }
    return { start: null, end: null };
  }, [isRange, value]);

  const minDateObj = useMemo(() => parseDateString(minDate), [minDate]);
  const maxDateObj = useMemo(() => parseDateString(maxDate), [maxDate]);

  // Current calendar view month & year
  const initialDate = isRange ? activeRange.start || new Date() : activeDate || new Date();
  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth());

  // Pending dates within the calendar before clicking Done
  const [pendingDate, setPendingDate] = useState(() => activeDate);
  const [pendingStart, setPendingStart] = useState(() => activeRange.start);
  const [pendingEnd, setPendingEnd] = useState(() => activeRange.end);

  // View mode: 'calendar' or 'year-select'
  const [viewMode, setViewMode] = useState('calendar');

  // Synchronize calendar view whenever value changes or popover opens
  useEffect(() => {
    if (isRange) {
      setPendingStart(activeRange.start);
      setPendingEnd(activeRange.end);
      if (activeRange.start) {
        setViewYear(activeRange.start.getFullYear());
        setViewMonth(activeRange.start.getMonth());
      }
    } else {
      if (activeDate) {
        setViewYear(activeDate.getFullYear());
        setViewMonth(activeDate.getMonth());
        setPendingDate(activeDate);
      } else {
        setPendingDate(null);
      }
    }
  }, [isRange, activeRange, activeDate, isOpen]);

  // Commit single date to parent
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

  // Commit date range to parent
  const commitRange = useCallback(
    (start, end) => {
      if (!onChange) return;
      if (!start && !end) {
        onChange(null);
      } else {
        const startFormatted = start ? formatByFormat(start, valueFormat) : '';
        const endFormatted = end ? formatByFormat(end, valueFormat) : '';
        const displayRange =
          start && end
            ? `${formatReadable(start)} - ${formatReadable(end)}`
            : start
            ? formatReadable(start)
            : '';

        onChange({
          startDate: startFormatted,
          endDate: endFormatted,
          display: displayRange,
          start,
          end,
        });
      }
    },
    [onChange, valueFormat]
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isRange) {
          if (pendingStart) {
            commitRange(pendingStart, pendingEnd);
          }
        } else {
          if (pendingDate) {
            commitDate(pendingDate);
          }
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
  }, [isOpen, isRange, pendingStart, pendingEnd, pendingDate, commitRange, commitDate]);

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
    const startDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const days = [];
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
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

  // Single date selected indicator
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
    const clickedDate = new Date(viewYear, viewMonth, day);

    if (isRange) {
      if (!pendingStart || (pendingStart && pendingEnd)) {
        setPendingStart(clickedDate);
        setPendingEnd(null);
      } else if (pendingStart && !pendingEnd) {
        if (clickedDate.getTime() < pendingStart.getTime()) {
          setPendingEnd(pendingStart);
          setPendingStart(clickedDate);
        } else {
          setPendingEnd(clickedDate);
        }
      }
    } else {
      setPendingDate(clickedDate);
    }
  };

  // Quick double click day selection in single mode
  const handleDayDoubleClick = (day) => {
    if (isRange || isDateDisabled(day)) return;
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
    if (isRange) {
      commitRange(pendingStart, pendingEnd);
    } else {
      if (pendingDate) {
        commitDate(pendingDate);
      }
    }
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Remove selection ("Remove" button)
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRange) {
      setPendingStart(null);
      setPendingEnd(null);
      commitRange(null, null);
    } else {
      setPendingDate(null);
      commitDate(null);
    }
    setIsOpen(false);
    setViewMode('calendar');
  };

  // Formatted display value for input box
  const displayValue = useMemo(() => {
    if (isRange) {
      if (activeRange.start && activeRange.end) {
        return `${formatReadable(activeRange.start)} - ${formatReadable(activeRange.end)}`;
      }
      if (activeRange.start) {
        return formatReadable(activeRange.start);
      }
      return '';
    }
    if (!value) return '';
    const parsed = parseDateString(value);
    if (!parsed) return typeof value === 'string' ? value : '';
    return formatByFormat(parsed, displayFormat);
  }, [isRange, activeRange, value, displayFormat]);

  const hasValue = Boolean(isRange ? activeRange.start : activeDate);

  // Quick years list for fast navigation
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
          'relative flex items-center justify-between gap-2 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink transition cursor-pointer select-none shadow-xs',
          'hover:border-slate-300 focus:outline-none focus:border-[#2832A4] focus:ring-2 focus:ring-[#2832A4]/20',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-50',
          isOpen && 'border-[#2832A4] ring-2 ring-[#2832A4]/20',
          hasValue && 'border-[#2832A4]/40 bg-blue-50/20',
          inputClassName
        )}
      >
        <CalendarIcon
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition',
            hasValue ? 'text-[#2832A4]' : 'text-slate-400'
          )}
        />
        <span
          className={cn(
            'truncate',
            !displayValue ? 'text-slate-400 font-normal text-xs sm:text-sm' : 'text-slate-900 font-semibold text-xs sm:text-sm'
          )}
        >
          {displayValue || placeholder}
        </span>

        {/* Quick clear button if a date is selected */}
        {hasValue && !disabled && !readOnly && (
          <button
            type="button"
            aria-label="Clear date selection"
            onClick={(e) => {
              e.stopPropagation();
              if (isRange) {
                setPendingStart(null);
                setPendingEnd(null);
                commitRange(null, null);
              } else {
                setPendingDate(null);
                commitDate(null);
              }
            }}
            className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-600 transition shrink-0 ml-1.5 focus:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Hidden native input for form compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={typeof value === 'object' ? JSON.stringify(value) : value || ''}
        />
      )}

      {/* Customized Popup Calendar */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Date Picker Calendar"
          className={cn(
            'absolute z-[100] mt-2 w-[295px] rounded-2xl bg-white p-4 shadow-xl shadow-slate-900/10 border border-slate-100 animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {/* Range Selection Status Pill Header */}
          {isRange && (
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px]">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Range:
              </span>
              <span className="font-bold text-[#2832A4] truncate max-w-[200px]">
                {pendingStart && pendingEnd
                  ? `${formatReadable(pendingStart)} - ${formatReadable(pendingEnd)}`
                  : pendingStart
                  ? `${formatReadable(pendingStart)} (Select End)`
                  : 'Select Start Date'}
              </span>
            </div>
          )}

          {/* Month Year + Navigation Arrows */}
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
                className="flex h-7.5 w-7.5 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-ink transition focus:outline-none cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex h-7.5 w-7.5 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-ink transition focus:outline-none cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Fast Year & Month Picker Mode */}
          {viewMode === 'year-select' ? (
            <div className="py-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">Select Month & Year:</p>
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
                      'py-1.5 px-1 rounded-lg text-center font-semibold transition cursor-pointer',
                      viewMonth === idx
                        ? 'bg-[#2832A4] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {nameStr.slice(0, 3)}
                  </button>
                ))}
              </div>

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
                      'py-1.5 rounded-lg text-center font-semibold transition cursor-pointer',
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

                  const disabledDay = isDateDisabled(item.day);
                  const currentToday = isToday(item.day);

                  let selected = false;
                  let isStart = false;
                  let isEnd = false;
                  let isInRange = false;

                  if (isRange) {
                    const dayDate = new Date(viewYear, viewMonth, item.day);
                    dayDate.setHours(0, 0, 0, 0);
                    const dayTime = dayDate.getTime();

                    const startTime = pendingStart
                      ? new Date(
                          pendingStart.getFullYear(),
                          pendingStart.getMonth(),
                          pendingStart.getDate()
                        ).getTime()
                      : null;
                    const endTime = pendingEnd
                      ? new Date(
                          pendingEnd.getFullYear(),
                          pendingEnd.getMonth(),
                          pendingEnd.getDate()
                        ).getTime()
                      : null;

                    isStart = startTime !== null && dayTime === startTime;
                    isEnd = endTime !== null && dayTime === endTime;
                    isInRange =
                      startTime !== null &&
                      endTime !== null &&
                      dayTime > startTime &&
                      dayTime < endTime;
                  } else {
                    selected = isSelected(item.day);
                  }

                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => handleDayClick(item.day)}
                      onDoubleClick={() => handleDayDoubleClick(item.day)}
                      className={cn(
                        'mx-auto flex h-8.5 w-8.5 items-center justify-center text-[13px] font-semibold transition focus:outline-none cursor-pointer',
                        disabledDay && 'text-slate-300 cursor-not-allowed bg-transparent',
                        !disabledDay && selected && 'bg-[#2832A4] text-white font-bold shadow-md shadow-[#2832A4]/35 scale-105 rounded-full',
                        !disabledDay && (isStart || isEnd) && 'bg-[#2832A4] text-white font-bold shadow-md shadow-[#2832A4]/35 scale-105 rounded-full z-10',
                        !disabledDay && isInRange && 'bg-[#EEF2FF] text-[#2832A4] font-semibold rounded-none scale-100',
                        !disabledDay && !selected && !isStart && !isEnd && !isInRange && currentToday && 'bg-[#EEF2FF] text-[#2832A4] font-bold hover:bg-[#E0E7FF] rounded-full',
                        !disabledDay && !selected && !isStart && !isEnd && !isInRange && !currentToday && 'text-slate-800 hover:bg-slate-100 rounded-full'
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
              className="flex-1 rounded-full bg-[#626C7A] hover:bg-[#525B68] py-2 text-xs sm:text-[13px] font-semibold text-white shadow-xs transition active:scale-[0.98] focus:outline-none cursor-pointer"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 rounded-full bg-[#2832A4] hover:bg-[#1E2580] py-2 text-xs sm:text-[13px] font-semibold text-white shadow-md shadow-[#2832A4]/25 transition active:scale-[0.98] focus:outline-none cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
