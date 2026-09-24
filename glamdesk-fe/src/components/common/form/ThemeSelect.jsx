import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Check, Search } from "lucide-react";

/**
 * ThemeSelect - A custom themed select dropdown component that matches the
 * GlamDesk luxury atelier theme (warm caramel active state, checkmark, search filter,
 * rounded-2xl menu, and invisible scrollbars).
 */
const ThemeSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "— Select an option —",
  searchable = false,
  searchPlaceholder = "Search...",
  required = false,
  disabled = false,
  error,
  hint,
  icon: Icon,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  emptyMessage = "No matching options found",
  dropUp = false,
  maxMenuHeight = "max-h-56",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Normalize options
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt.value,
          label: opt.label !== undefined ? opt.label : String(opt.value),
          sublabel: opt.sublabel || "",
          icon: opt.icon || null,
        };
      }
      return {
        value: opt,
        label: String(opt),
        sublabel: "",
        icon: null,
      };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchSub = opt.sublabel ? opt.sublabel.toLowerCase().includes(q) : false;
      const matchVal = String(opt.value).toLowerCase().includes(q);
      return matchLabel || matchSub || matchVal;
    });
  }, [normalizedOptions, searchQuery]);

  const handleSelect = (val) => {
    if (disabled) return;
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? "z-50" : ""} ${className}`}
    >
      {label && (
        <label className="block text-[11px] font-bold tracking-wider text-glam-accent uppercase mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Hidden input for native form compatibility */}
      {name && <input type="hidden" name={name} value={value || ""} />}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-11 px-3.5 rounded-xl border transition-colors flex items-center justify-between text-left cursor-pointer ${
          error
            ? "border-rose-400 bg-rose-500/10 text-rose-500"
            : isOpen
            ? "border-glam-accent bg-glam-surface shadow-xs text-glam-text"
            : "border-glam-border/60 bg-glam-surface-alt/40 hover:bg-glam-surface-alt/70 text-glam-text"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-glam-surface-alt" : ""} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
          {Icon && <Icon size={15} className="text-glam-accent shrink-0" />}
          {selectedOption ? (
            <span className="text-sm font-medium text-glam-text truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-sm font-normal text-glam-text-muted/60 truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="shrink-0 text-glam-accent ml-1">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 p-2 rounded-2xl bg-glam-surface border border-glam-border/60 shadow-2xl ${
            dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } ${menuClassName}`}
        >
          {/* Optional Search Input */}
          {searchable && (
            <div className="relative mb-2">
              <Search
                size={15}
                className="absolute left-3 top-2.5 text-glam-accent/70 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-glam-border/60 bg-glam-surface-alt text-xs font-medium text-glam-text placeholder:text-glam-text-muted/50 focus:outline-none focus:border-glam-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div
            className={`${maxMenuHeight} overflow-y-auto scrollbar-none space-y-1`}
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3.5 text-center text-xs text-glam-text-muted font-medium">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between text-sm transition-all cursor-pointer ${
                      isSelected
                        ? "bg-glam-accent text-white font-medium shadow-2xs"
                        : "text-glam-text hover:bg-glam-surface-alt font-medium"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span
                          className={`block text-xs truncate ${
                            isSelected ? "text-white/80" : "text-glam-text-muted"
                          }`}
                        >
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-white shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>
      )}

      {hint && !error && (
        <p className="text-[10px] text-glam-text-muted mt-1">{hint}</p>
      )}
    </div>
  );
};

export default ThemeSelect;
