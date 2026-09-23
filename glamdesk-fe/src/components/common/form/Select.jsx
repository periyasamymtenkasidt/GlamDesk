import React from "react";
import ThemeSelect from "./ThemeSelect";

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
  placeholder,
  searchable = false,
  searchPlaceholder,
  children,
  className = "",
  selectClassName = "",
  triggerClassName = "",
  menuClassName = "",
  ...props
}) => {
  // Extract options from children if <option> tags were passed
  let parsedOptions = options;
  if ((!options || options.length === 0) && children) {
    const childArray = React.Children.toArray(children);
    parsedOptions = childArray
      .filter((child) => child && child.props)
      .map((child) => ({
        value: child.props.value,
        label: child.props.children,
      }));
  }

  return (
    <ThemeSelect
      label={label}
      name={name}
      value={value}
      onChange={(val) => {
        if (typeof onChange === "function") {
          onChange({
            target: { name, value: val },
            currentTarget: { name, value: val },
          });
        }
      }}
      options={parsedOptions}
      required={required}
      disabled={disabled}
      error={error}
      hint={hint}
      icon={Icon}
      placeholder={placeholder}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      className={className}
      triggerClassName={`${selectClassName} ${triggerClassName}`}
      menuClassName={menuClassName}
      {...props}
    />
  );
};

export default Select;

