import React from "react";
import { Check } from "lucide-react";

const Checkbox = ({
  label,
  sublabel,
  name,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <label
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className="w-4 h-4 rounded-md border border-glam-border/60 bg-glam-surface-alt/40 transition-all peer-checked:bg-glam-accent peer-checked:border-glam-accent flex items-center justify-center">
          <Check
            size={11}
            className={`text-white transition-opacity ${
              checked ? "opacity-100" : "opacity-0"
            }`}
            strokeWidth={3}
          />
        </div>
      </div>

      {(label || sublabel) && (
        <div className="leading-tight">
          {label && (
            <span className="block text-xs font-semibold text-glam-text">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="block text-[10px] text-glam-text-muted mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Checkbox;
