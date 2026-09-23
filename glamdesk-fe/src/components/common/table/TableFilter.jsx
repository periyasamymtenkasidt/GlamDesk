import { useState, useRef, useEffect } from "react";
import { Filter, Check, ChevronDown, X } from "lucide-react";

/**
 * Reusable Table Filter Component for GlamDesk
 *
 * Supports two presentation modes:
 * - "pills" (default): Horizontal scrollable pill buttons
 * - "dropdown": Compact popover dropdown menu
 *
 * @param {Array} options - Array of strings or { label: string, value: string, count?: number }
 * @param {string} value - Currently active filter value
 * @param {Function} onChange - Callback (value) => void
 * @param {string} mode - "pills" | "dropdown" (default: "pills")
 * @param {string} label - Label for dropdown button (default: "Filter")
 * @param {boolean} compact - Compact height (default: true)
 * @param {string} className - Additional classes
 */
const TableFilter = ({
  options = [],
  value = "All",
  onChange,
  mode = "pills",
  label = "Filter",
  compact = true,
  className = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!options || options.length === 0) return null;

  // ─── Mode A: Horizontal Filter Pills ─────────────────────────────────────────
  if (mode === "pills") {
    return (
      <div
        className={`flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none ${className}`}
      >
        {options.map((opt) => {
          const optVal = typeof opt === "object" ? opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          const optCount = typeof opt === "object" ? opt.count : undefined;
          const isSelected = value === optVal;

          return (
            <button
              type="button"
              key={optVal}
              onClick={() => onChange && onChange(optVal)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-medium tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-glam-accent-2 to-glam-accent text-white shadow-xs font-semibold"
                  : "bg-glam-surface/80 text-glam-text-muted hover:text-glam-text border border-glam-border/40 hover:border-glam-border hover:bg-glam-surface"
              }`}
            >
              <span>{optLabel}</span>
              {optCount !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-glam-surface-alt text-glam-text-muted"
                  }`}
                >
                  {optCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ─── Mode B: Compact Filter Dropdown Popover ──────────────────────────────────
  const isFiltered = value && value !== "All";

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center gap-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
          compact ? "h-8 px-2.5" : "h-9 px-3"
        } ${
          isFiltered
            ? "border-glam-accent/60 bg-glam-accent/10 text-glam-accent"
            : "border-glam-border/50 bg-glam-surface-alt text-glam-text hover:border-glam-accent/50"
        }`}
      >
        <Filter
          size={12}
          className={isFiltered ? "text-glam-accent" : "text-glam-text-muted"}
        />
        <span>{isFiltered ? `${label}: ${value}` : label}</span>
        {isFiltered ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange && onChange("All");
            }}
            className="p-0.5 rounded-full hover:bg-glam-accent/20 transition-colors ml-0.5"
          >
            <X size={10} />
          </button>
        ) : (
          <ChevronDown size={12} className="text-glam-text-muted" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-1.5 z-50 w-48 p-1.5 rounded-xl bg-glam-surface border border-glam-border/60 shadow-xl space-y-0.5 animate-in fade-in duration-150">
          {options.map((opt) => {
            const optVal = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            const isSelected = value === optVal;

            return (
              <button
                type="button"
                key={optVal}
                onClick={() => {
                  onChange && onChange(optVal);
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-glam-accent/10 text-glam-accent font-semibold"
                    : "text-glam-text hover:bg-glam-surface-alt"
                }`}
              >
                <span>{optLabel}</span>
                {isSelected && (
                  <Check size={12} className="text-glam-accent shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableFilter;
