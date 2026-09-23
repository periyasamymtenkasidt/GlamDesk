import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  X,
} from "lucide-react";
import ThemeSelect from "../form/ThemeSelect";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatBoxDate = (dateStr) => {
  if (!dateStr) return "Select...";
  try {
    const [y, m, d] = dateStr.split("-");
    const mIndex = parseInt(m, 10) - 1;
    const month = MONTH_NAMES[mIndex]?.slice(0, 3) || m;
    return `${parseInt(d, 10)} ${month} ${y}`;
  } catch {
    return dateStr;
  }
};

/**
 * Reusable Date Range Picker for GlamDesk
 *
 * Matches the reference design with dual FROM/TO boxes, month/year selectors,
 * interactive day grid with range highlighting, reset/close actions, and Apply button.
 *
 * Styled 100% with pure Tailwind CSS utility classes.
 */
const DateRangePicker = ({
  startDate = "",
  endDate = "",
  onChange,
  placeholder = "Date Range",
  variant = "icon", // "icon" | "button"
  compact = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [selectingField, setSelectingField] = useState("start"); // "start" | "end"

  // Initial month/year navigation state
  const initialDate = startDate ? new Date(startDate) : new Date(2026, 8, 1); // Default to Sept 2026
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const containerRef = useRef(null);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    if (startDate) {
      const d = new Date(startDate);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [startDate, endDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasRange = Boolean(startDate || endDate);
  const hasTempRange = Boolean(tempStart || tempEnd);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Day selection logic
  const handleDayClick = (dateString, isCurrentMonth) => {
    if (!isCurrentMonth) return;

    if (selectingField === "start") {
      setTempStart(dateString);
      if (tempEnd && dateString > tempEnd) {
        setTempEnd("");
      }
      setSelectingField("end");
    } else {
      if (tempStart && dateString < tempStart) {
        setTempStart(dateString);
        setSelectingField("end");
      } else {
        setTempEnd(dateString);
      }
    }
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    setTempStart("");
    setTempEnd("");
    setSelectingField("start");
    if (onChange) {
      onChange({ startDate: "", endDate: "" });
    }
  };

  const handleApply = () => {
    if (onChange) {
      onChange({ startDate: tempStart, endDate: tempEnd });
    }
    setIsOpen(false);
  };

  // Generate calendar days for current viewMonth and viewYear
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Previous month tail days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(viewYear, viewMonth - 1, dayNum);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        dayNumber: dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: true,
      });
    }

    // Next month head days to complete full grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Year options for the dropdown
  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* ─── Trigger Button ──────────────────────────────────────────────── */}
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={hasRange ? `Date Range: ${tempStart} to ${tempEnd}` : "Filter by date range"}
          className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer relative ${
            isOpen || hasRange
              ? "border-glam-accent/60 bg-[#f7ebe3] text-[#a67c52] shadow-2xs"
              : "border-glam-border/40 bg-glam-surface text-glam-text hover:border-glam-accent/40"
          }`}
        >
          <CalendarIcon size={15} />
          {hasRange && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-glam-accent ring-2 ring-glam-surface" />
          )}
        </button>
      ) : (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-2xl border text-xs font-medium cursor-pointer transition-all ${
            compact ? "h-8 px-2.5" : "h-9 px-3"
          } ${
            hasRange
              ? "border-glam-accent/60 bg-[#f7ebe3] text-[#a67c52]"
              : "border-glam-border/50 bg-glam-surface text-glam-text hover:border-glam-accent/50"
          }`}
        >
          <CalendarIcon size={13} className="text-[#a67c52]" />
          <span className="truncate max-w-44 font-outfit text-xs font-semibold">
            {hasRange ? `${formatBoxDate(startDate)} → ${formatBoxDate(endDate)}` : placeholder}
          </span>
          <ChevronDown size={12} className="text-glam-text-muted" />
        </div>
      )}

      {/* ─── Popover Dropdown matching Reference Design ─────────────────── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-76 sm:w-80 p-4 rounded-3xl bg-glam-surface border border-glam-border/40 shadow-2xl animate-in fade-in duration-150">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-glam-border/30">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-[#a67c52]" />
              <h3 className="text-sm font-bold font-outfit text-glam-text">
                Select Date Range
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                title="Reset Date Range"
                className="w-7 h-7 rounded-xl border border-glam-border/40 hover:border-glam-accent/50 hover:bg-glam-surface-alt text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="w-7 h-7 rounded-xl border border-glam-border/40 hover:border-glam-accent/50 hover:bg-glam-surface-alt text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Dual FROM and TO Input Boxes */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {/* FROM Box */}
            <div
              onClick={() => setSelectingField("start")}
              className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                selectingField === "start"
                  ? "border-[#c9956c] bg-[#fbf5f0] dark:bg-white/5 ring-1 ring-[#c9956c]/30"
                  : "border-glam-border/40 bg-glam-surface hover:border-glam-border"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
                FROM
              </span>
              <p className="text-xs font-semibold text-glam-text mt-0.5 truncate">
                {formatBoxDate(tempStart)}
              </p>
            </div>

            {/* TO Box */}
            <div
              onClick={() => setSelectingField("end")}
              className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                selectingField === "end"
                  ? "border-[#c9956c] bg-[#fbf5f0] dark:bg-white/5 ring-1 ring-[#c9956c]/30"
                  : "border-glam-border/40 bg-glam-surface hover:border-glam-border"
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
                TO
              </span>
              <p className="text-xs font-semibold text-glam-text mt-0.5 truncate">
                {formatBoxDate(tempEnd)}
              </p>
            </div>
          </div>

          {/* Month & Year Navigation Bar */}
          <div className="flex items-center justify-between gap-1.5 mt-3.5 px-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl border border-glam-border/40 hover:border-glam-accent/50 bg-glam-surface text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {/* Month Select */}
              <div className="w-28">
                <ThemeSelect
                  value={viewMonth}
                  onChange={(val) => setViewMonth(Number(val))}
                  options={MONTH_NAMES.map((name, idx) => ({
                    value: idx,
                    label: name,
                  }))}
                  triggerClassName="h-8 px-2 rounded-xl border-glam-border/40 bg-glam-surface text-xs font-semibold"
                  maxMenuHeight="max-h-44"
                />
              </div>

              {/* Year Select */}
              <div className="w-24">
                <ThemeSelect
                  value={viewYear}
                  onChange={(val) => setViewYear(Number(val))}
                  options={yearOptions.map((yr) => ({
                    value: yr,
                    label: String(yr),
                  }))}
                  triggerClassName="h-8 px-2 rounded-xl border-glam-border/40 bg-glam-surface text-xs font-semibold"
                  maxMenuHeight="max-h-44"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl border border-glam-border/40 hover:border-glam-accent/50 bg-glam-surface text-glam-text-muted hover:text-glam-text flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mt-3">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 mb-1 text-center">
              {WEEKDAY_NAMES.map((w) => (
                <span
                  key={w}
                  className="text-[11px] font-semibold text-glam-text-muted/80 py-1"
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {calendarDays.map((day, idx) => {
                const isStart = tempStart === day.dateString;
                const isEnd = tempEnd === day.dateString;
                const inRange =
                  tempStart &&
                  tempEnd &&
                  day.dateString > tempStart &&
                  day.dateString < tempEnd;

                if (!day.isCurrentMonth) {
                  return (
                    <div
                      key={`other-${idx}`}
                      className="w-8 h-8 mx-auto flex items-center justify-center text-xs text-glam-text-muted/30 select-none"
                    >
                      {day.dayNumber}
                    </div>
                  );
                }

                return (
                  <button
                    key={`day-${day.dateString}`}
                    type="button"
                    onClick={() => handleDayClick(day.dateString, true)}
                    className={`w-8 h-8 mx-auto rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                      isStart || isEnd
                        ? "border-2 border-[#c9956c] bg-[#f7ebe3] text-[#a67c52] font-bold shadow-2xs"
                        : inRange
                        ? "bg-[#f7ebe3]/70 text-[#a67c52] font-semibold rounded-none first:rounded-l-full last:rounded-r-full"
                        : "text-glam-text hover:bg-glam-surface-alt"
                    }`}
                  >
                    {day.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Apply Button */}
          <button
            type="button"
            onClick={handleApply}
            className="w-full mt-4 py-2.5 rounded-2xl bg-[#dfc9b8] hover:bg-[#d5bba8] dark:bg-glam-accent/30 text-glam-text font-bold text-xs tracking-wide shadow-xs transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
