import React from "react";

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  error,
  hint,
  maxLength,
  className = "",
  textareaClassName = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-xs font-semibold text-glam-text">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-[10px] text-glam-text-muted">
            {(value || "").length} / {maxLength}
          </span>
        )}
      </div>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full p-3 rounded-xl border text-xs font-medium resize-none transition-all ${
          error
            ? "border-rose-500 bg-rose-500/5 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40"
            : "border-glam-border/50 bg-glam-surface-alt/30 text-glam-text placeholder:text-glam-text-muted/60 focus:outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent/40"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-glam-surface-alt/60" : ""} ${textareaClassName}`}
        {...props}
      />

      {error && (
        <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>
      )}

      {hint && !error && (
        <p className="text-[10px] text-glam-text-muted mt-1">{hint}</p>
      )}
    </div>
  );
};

export default Textarea;
