import React from "react";

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  icon: Icon,
  prefix,
  suffix,
  className = "",
  inputClassName = "",
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

        {prefix && !Icon && (
          <span className="absolute left-3 text-xs font-semibold text-glam-text-muted pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full h-10 px-3.5 rounded-xl border text-xs font-medium transition-all ${
            Icon || prefix ? "pl-8" : "pl-3.5"
          } ${suffix ? "pr-8" : "pr-3.5"} ${
            error
              ? "border-rose-500 bg-rose-500/5 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40"
              : "border-glam-border/50 bg-glam-surface-alt/30 text-glam-text placeholder:text-glam-text-muted/60 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/40"
          } ${disabled ? "opacity-60 cursor-not-allowed bg-glam-surface-alt/60" : ""} ${inputClassName}`}
          {...props}
        />

        {suffix && (
          <span className="absolute right-3 text-xs font-medium text-glam-text-muted pointer-events-none">
            {suffix}
          </span>
        )}
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

export default Input;
