import React from "react";

const SegmentedControl = ({
  label,
  options = [], // [{ value, label, icon: Icon, dotColor, description }]
  value,
  onChange,
  required = false,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-glam-text mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="grid grid-flow-col auto-cols-fr gap-2">
        {options.map((opt) => {
          const optValue = typeof opt === "object" ? opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          const isSelected = value === optValue;
          const Icon = opt.icon;

          return (
            <button
              key={optValue}
              type="button"
              onClick={() => onChange(optValue)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "border-glam-accent bg-glam-accent/15 text-glam-accent shadow-xs"
                  : "border-glam-border/40 bg-glam-surface-alt/30 text-glam-text-muted hover:border-glam-accent/40"
              }`}
            >
              {opt.dotColor && (
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dotColor}`} />
              )}
              {Icon && <Icon size={14} className="mb-0.5" />}
              <span className="leading-tight text-center">{optLabel}</span>
              {opt.description && (
                <span className="text-[9px] opacity-75 font-normal text-center">
                  {opt.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SegmentedControl;
