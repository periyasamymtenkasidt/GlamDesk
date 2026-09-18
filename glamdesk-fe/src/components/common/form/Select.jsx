import React from "react";
import { ChevronDown } from "lucide-react";

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  hint,
  icon: Icon,
  children,
  className = "",
  selectClassName = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-glam-text mb-1">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-glam-text-muted pointer-events-none flex items-center justify-center">
            <Icon size={14} className="text-glam-accent" />
          </div>
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full h-10 rounded-xl border text-xs font-medium appearance-none pr-8 cursor-pointer transition-all ${
            Icon ? "pl-8" : "pl-3.5"
          } ${
            error
              ? "border-rose-500 bg-rose-500/5 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40"
              : "border-glam-border/50 bg-glam-surface-alt/30 text-glam-text focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/40"
          } ${disabled ? "opacity-60 cursor-not-allowed bg-glam-surface-alt/60" : ""} ${selectClassName}`}
          {...props}
        >
          {children
            ? children
            : options.map((opt) => {
                const optValue = typeof opt === "object" ? opt.value : opt;
                const optLabel = typeof opt === "object" ? opt.label : opt;
                return (
                  <option key={optValue} value={optValue}>
                    {optLabel}
                  </option>
                );
              })}
        </select>

        <div className="absolute right-3 text-glam-text-muted pointer-events-none flex items-center justify-center">
          <ChevronDown size={14} />
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>
      )}

      {hint && !error && (
        <p className="text-[10px] text-glam-text-muted mt-1">{hint}</p>
      )}
    </div>
  );
};

export default Select;
