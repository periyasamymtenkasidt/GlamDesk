import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import ThemeSelect from "../form/ThemeSelect";

/**
 * Reusable Table Filter Options Popover Component for GlamDesk
 *
 * Matches Screenshot 3 with:
 * - SlidersHorizontal trigger icon button
 * - FILTER OPTIONS header
 * - LOCATION (or customizable) section with dropdown
 * - Warm sand active state
 *
 * Styled 100% with pure Tailwind CSS utility classes.
 */
const TableFilterDropdown = ({
  sections = [],
  // Fallback single section props
  label = "LOCATION",
  options = [
    { label: "All Locations", value: "All" },
    { label: "Studio", value: "Studio" },
    { label: "Venue", value: "Venue" },
  ],
  value = "All",
  onChange,
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

  // Normalize sections
  const activeSections =
    sections && sections.length > 0
      ? sections
      : [
          {
            key: "default",
            label,
            options,
            value,
            onChange,
          },
        ];

  const hasActiveFilter = activeSections.some(
    (sec) => sec.value && sec.value !== "All" && sec.value !== "All Locations"
  );

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Filter Options"
        className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer relative ${
          isOpen || hasActiveFilter
            ? "border-glam-accent/60 bg-[#f7ebe3] text-[#a67c52] shadow-2xs"
            : "border-glam-border/40 bg-glam-surface text-glam-text hover:border-glam-accent/40"
        }`}
      >
        <SlidersHorizontal size={15} />
        {hasActiveFilter && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-glam-accent ring-2 ring-glam-surface" />
        )}
      </button>

      {/* Popover Dropdown matching Reference Screenshot 3 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-60 p-4 rounded-3xl bg-glam-surface border border-glam-border/40 shadow-2xl space-y-3.5 animate-in fade-in duration-150">
          <div className="text-[10px] font-bold uppercase tracking-wider text-glam-text-muted border-b border-glam-border/30 pb-2">
            FILTER OPTIONS
          </div>

          <div className="space-y-3">
            {activeSections.map((section, sIdx) => {
              const secValue = section.value || "All";
              const currentOpt = section.options.find(
                (o) =>
                  (typeof o === "object" ? o.value : o) === secValue
              );
              const currentLabel =
                typeof currentOpt === "object"
                  ? currentOpt.label
                  : currentOpt || secValue;

              return (
                <div key={section.key || `sec-${sIdx}`} className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a67c52] dark:text-glam-accent">
                    {section.label}
                  </label>

                  {/* Dropdown Select matching Reference Image */}
                  <ThemeSelect
                    value={secValue}
                    onChange={(val) => {
                      if (section.onChange) {
                        section.onChange(val);
                      }
                    }}
                    options={section.options}
                    triggerClassName="h-9 rounded-2xl border-glam-border/40 bg-glam-surface text-xs"
                    maxMenuHeight="max-h-48"
                  />
                </div>

              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilterDropdown;
