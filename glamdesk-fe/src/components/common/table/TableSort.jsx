import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import ThemeSelect from "../form/ThemeSelect";

/**
 * Reusable Table Sort Dropdown Component for GlamDesk
 *
 * Matches the reference design with SORT BY header, warm sand highlight,
 * and bronze dot indicator on the active option.
 *
 * Styled 100% with pure Tailwind CSS utility classes.
 */
const TableSort = ({
  options = [
    { label: "Date (Newest)", value: "date-desc" },
    { label: "Date (Oldest)", value: "date-asc" },
    { label: "Amount ↓", value: "amount-high" },
    { label: "Amount ↑", value: "amount-low" },
    { label: "Name A–Z", value: "client-asc" },
  ],
  value = "date-desc",
  onChange,
  variant = "icon",
  compact = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  if (!options || options.length === 0) return null;

  const currentOption = options.find((opt) => opt.value === value) || options[0];

  // Variant A: Themed Select Dropdown
  if (variant === "select") {
    return (
      <div
        className={`flex items-center gap-1.5 text-xs text-glam-text font-medium shrink-0 min-w-[150px] ${className}`}
      >
        <SlidersHorizontal size={13} className="text-[#a67c52] shrink-0" />
        <ThemeSelect
          value={value}
          onChange={(val) => onChange && onChange(val)}
          options={options}
          triggerClassName={`${compact ? "h-8" : "h-9"} rounded-xl border-glam-border/50 bg-glam-surface text-xs`}
        />
      </div>
    );
  }

  // Variant B: Premium Popover Menu matching Reference Screenshot 2
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Sort: ${currentOption?.label || "Sort records"}`}
        className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? "border-glam-accent/60 bg-[#f7ebe3] text-[#a67c52] shadow-2xs"
            : "border-glam-border/40 bg-glam-surface text-glam-text hover:border-glam-accent/40"
        }`}
      >
        <ArrowUpDown size={15} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-52 p-2 rounded-3xl bg-glam-surface border border-glam-border/40 shadow-2xl animate-in fade-in duration-150">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-glam-text-muted">
            SORT BY
          </div>

          <div className="space-y-0.5 mt-1">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => {
                    onChange && onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#f8f0ea] dark:bg-white/5 font-semibold text-[#a67c52] dark:text-glam-accent"
                      : "text-glam-text hover:bg-glam-surface-alt/60 font-medium"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#c9956c] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableSort;
