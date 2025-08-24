"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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

type Option = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export interface SelectInputProps {
  label: string;
  value: string | number | null | undefined;
  options: Option[];
  onChange: (value: string | number) => void;

  fullWidth?: boolean;
  roundedClass?: string;
  colors?: Colors;
  wrapperClassName?: string;
  buttonClassName?: string;
  menuClassName?: string;

  error?: boolean;
  helperText?: string;

  disabled?: boolean;
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  options,
  onChange,
  fullWidth = true,
  roundedClass = "rounded-lg",
  colors,
  wrapperClassName,
  buttonClassName,
  menuClassName,
  error,
  helperText,
  disabled,
  placeholder = "",
}) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx =
      selectedIndex >= 0
        ? selectedIndex
        : options.findIndex((o) => !o.disabled);
    setHighlighted(idx);
    if (idx >= 0) {
      const el = listRef.current?.querySelector<HTMLButtonElement>(
        `[data-idx="${idx}"]`
      );
      el?.scrollIntoView({ block: "center" });
    }
  }, [open, selectedIndex, options]);

  const moveHighlight = (dir: 1 | -1) => {
    if (!options.length) return;
    let i = highlighted;
    for (let step = 0; step < options.length; step++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) {
        setHighlighted(i);
        const el = listRef.current?.querySelector<HTMLButtonElement>(
          `[data-idx="${i}"]`
        );
        el?.scrollIntoView({ block: "nearest" });
        break;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        moveHighlight(1);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        moveHighlight(-1);
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (highlighted >= 0 && !options[highlighted].disabled) {
          onChange(options[highlighted].value);
          setOpen(false);
        }
        e.preventDefault();
      } else if (e.key === "Escape") {
        setOpen(false);
        e.preventDefault();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full" : ""} ${
        wrapperClassName ?? ""
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`relative ${outlined} w-full text-left ${
          palette.text
        } ${roundedClass} ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${buttonClassName ?? ""}`}
      >
        <label
          className={` left-3 px-3 top-2.5 text-[12px] ${
            error ? palette.errorLabel : palette.label
          }`}
        >
          {label}
        </label>

        <span className={`block px-3 pb-2 pr-9`}>
          {selected ? (
            selected.label
          ) : (
            <span className="text-[#9CA3AF]">{placeholder}</span>
          )}
        </span>

        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={`fill-current ${palette.icon} transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </span>
      </button>

      {helperText ? (
        <p
          className={`mt-1 text-xs ${
            error ? palette.errorLabel : "text-[#6B7280]"
          }`}
        >
          {helperText}
        </p>
      ) : null}

      {open && !disabled && (
        <div
          role="listbox"
          className={`absolute z-50 mt-2 left-0 top-full w-full ${
            menuClassName ?? ""
          }`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className={`max-h-56 overflow-y-auto border border-[#E5E7EB] bg-white shadow-xl ${roundedClass} p-1`}
            ref={listRef}
            style={{ scrollbarWidth: "thin" }}
          >
            {options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isActive = highlighted === idx;
              const base =
                "w-full text-left text-sm px-3 py-2 rounded-md transition";
              const cls = opt.disabled
                ? "text-[#9CA3AF] cursor-not-allowed"
                : isActive
                ? "bg-[#F3F4F6] text-[#111827]"
                : "hover:bg-[#F3F4F6] text-[#111827]";

              return (
                <button
                  key={`${opt.value}-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={`${base} ${cls} ${
                    isSelected ? "font-medium" : ""
                  }`}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-[#9CA3AF]">
                Không có lựa chọn
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectInput;
