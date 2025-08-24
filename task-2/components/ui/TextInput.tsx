"use client";

import React, { useState } from "react";

type Colors = {
  bg?: string;
  border?: string;
  text?: string;
  label?: string;
  labelFloated?: string;
  hoverBorder?: string;
  ring?: string;
  icon?: string;
  errorBorder?: string;
  errorLabel?: string;
  errorRing?: string;
};

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: boolean;
  helperText?: string;

  fullWidth?: boolean;
  roundedClass?: string;
  colors?: Colors;
  wrapperClassName?: string;
  inputClassName?: string;

  hideNumberArrows?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  roundedClass = "rounded-lg",
  colors,
  wrapperClassName,
  inputClassName,
  hideNumberArrows = true,
  onFocus,
  onBlur,
  onChange,
  value,
  defaultValue,
  disabled,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  const palette: Required<Colors> = {
    bg: colors?.bg ?? "bg-white",
    border: colors?.border ?? "border-[#E5E7EB]",
    text: colors?.text ?? "text-[#111827]",
    label: colors?.label ?? "text-[#6B7280]",
    labelFloated: colors?.labelFloated ?? "text-[#6B7280]",
    hoverBorder: colors?.hoverBorder ?? "hover:border-[#D1D5DB]",
    ring: colors?.ring ?? "focus-within:ring-[#93C5FD]/50",
    icon: colors?.icon ?? "text-[#6B7280]",
    errorBorder: colors?.errorBorder ?? "border-[#EF4444]",
    errorLabel: colors?.errorLabel ?? "text-[#EF4444]",
    errorRing: colors?.errorRing ?? "focus-within:ring-[#FCA5A5]/50",
  };

  const outlined = [
    "border transition",
    roundedClass,
    palette.bg,
    error ? palette.errorBorder : palette.border,
    error ? palette.errorRing : palette.ring,
    error ? "" : palette.hoverBorder,
  ].join(" ");

  const helperId = helperText
    ? `${(rest.id ?? label).toString()}-help`
    : undefined;

  return (
    <div
      className={`relative ${fullWidth ? "w-full" : ""} ${
        wrapperClassName ?? ""
      }`}
    >
      <div
        className={`relative ${outlined} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <label
          className={` left-3 px-3 top-2.5 text-[12px] ${
            error ? palette.errorLabel : palette.label
          }`}
        >
          {label}
        </label>

        <input
          {...rest}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          aria-label={label}
          aria-describedby={helperId}
          className={`w-full bg-transparent ${
            palette.text
          } px-3 pb-2 pr-3 outline-none ${roundedClass} ${
            inputClassName ?? ""
          } ${hideNumberArrows ? "no-arrows" : ""}`}
        />
      </div>

      {helperText ? (
        <p
          id={helperId}
          className={`mt-1 text-xs ${
            error ? palette.errorLabel : "text-[#6B7280]"
          }`}
        >
          {helperText}
        </p>
      ) : null}

      {hideNumberArrows ? (
        <style jsx global>{`
          input.no-arrows[type="number"]::-webkit-outer-spin-button,
          input.no-arrows[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input.no-arrows[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
      ) : null}
    </div>
  );
};

export default TextInput;
