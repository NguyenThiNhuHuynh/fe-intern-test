"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

type Colors = {
  bg?: string;
  border?: string;
  text?: string;
  label?: string;
  labelFloated?: string;
  hoverBorder?: string;
  ring?: string;
  popupBg?: string;
  popupBorder?: string;
  activeItemBg?: string;
  activeItemText?: string;
  itemText?: string;
  itemHoverBg?: string;
  icon?: string;
  errorBorder?: string;
  errorLabel?: string;
  errorRing?: string;
};

interface DateTimePickerProps {
  label: string;
  value: Date | Dayjs | null;
  onChange: (value: Date | Dayjs | null) => void;
  disabled?: boolean;

  roundedClass?: string;
  colors?: Colors;
  className?: string;
  fullWidth?: boolean;

  error?: boolean;
  helperText?: string;

  displayFormat?: (d: Date) => string;
  defaultIfNull?: Date;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const defaultFormat = (d: Date) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addMonths(d: Date, delta: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}
function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  disabled,
  roundedClass = "rounded-[8px]",
  colors,
  className,
  fullWidth = true,
  error,
  helperText,
  displayFormat = defaultFormat,
  defaultIfNull,
}) => {
  const isDayjsValue = dayjs.isDayjs(value);

  const toDate = (v: Date | Dayjs | null | undefined): Date | null =>
    v ? (dayjs.isDayjs(v) ? (v as Dayjs).toDate() : (v as Date)) : null;

  const palette: Required<Colors> = {
    bg: colors?.bg ?? "bg-white",
    border: colors?.border ?? "border-[#E5E7EB]",
    text: colors?.text ?? "text-[#111827]",
    label: colors?.label ?? "text-[#6B7280]",
    labelFloated: colors?.labelFloated ?? "text-[#6B7280]",
    hoverBorder: colors?.hoverBorder ?? "hover:border-[#D1D5DB]",
    ring: colors?.ring ?? "focus-within:ring-[#93C5FD]/50",
    popupBg: colors?.popupBg ?? "bg-white",
    popupBorder: colors?.popupBorder ?? "border-[#E5E7EB]",
    activeItemBg: colors?.activeItemBg ?? "bg-[#111827]",
    activeItemText: colors?.activeItemText ?? "text-white",
    itemText: colors?.itemText ?? "text-[#374151]",
    itemHoverBg: colors?.itemHoverBg ?? "hover:bg-[#F3F4F6]",
    icon: colors?.icon ?? "text-[#6B7280]",
    errorBorder: colors?.errorBorder ?? "border-[#EF4444]",
    errorLabel: colors?.errorLabel ?? "text-[#EF4444]",
    errorRing: colors?.errorRing ?? "focus-within:ring-[#FCA5A5]/50",
  };

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = toDate(value) ?? defaultIfNull ?? new Date();
  const [tempValue, setTempValue] = useState<Date>(current);

  useEffect(() => {
    if (open) setTempValue(toDate(value) ?? defaultIfNull ?? new Date());
  }, [open, value, defaultIfNull]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const [viewMonth, setViewMonth] = useState<Date>(() => startOfDay(current));
  useEffect(() => {
    if (open) setViewMonth(startOfDay(toDate(value) ?? new Date()));
  }, [open, value]);

  const calendarGrid = useMemo(() => {
    const firstOfMonth = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      1
    );
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Mon=0
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startWeekday);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [viewMonth]);

  const [activeCol, setActiveCol] = useState<"hour" | "minute" | "second">(
    "hour"
  );
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const secondListRef = useRef<HTMLDivElement>(null);

  type DivRef =
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>;

  useEffect(() => {
    if (!open) return;
    const scrollInto = (ref: DivRef, idx: number) => {
      const el = ref.current?.querySelector<HTMLButtonElement>(
        `[data-idx="${idx}"]`
      );
      el?.scrollIntoView({ block: "center" });
    };
    scrollInto(hourListRef, tempValue.getHours());
    scrollInto(minuteListRef, tempValue.getMinutes());
    scrollInto(secondListRef, tempValue.getSeconds());
  }, [open, tempValue]);

  const setTimePart = (part: "hour" | "minute" | "second", v: number) => {
    const d = new Date(tempValue);
    if (part === "hour") d.setHours(v);
    if (part === "minute") d.setMinutes(v);
    if (part === "second") d.setSeconds(v);
    setTempValue(d);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter") {
      setOpen((o) => !o);
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      e.preventDefault();
      return;
    }
  };

  const outlined = [
    "border transition",
    roundedClass,
    palette.bg,
    error ? palette.errorBorder : palette.border,
    error ? palette.errorRing : palette.ring,
    error ? "" : palette.hoverBorder,
  ].join(" ");

  const displayText = value
    ? (displayFormat ?? defaultFormat)(
        dayjs.isDayjs(value) ? (value as Dayjs).toDate() : (value as Date)
      )
    : "";

  const commit = (d: Date | null) => {
    if (d === null) {
      onChange(null);
      return;
    }
    if (isDayjsValue) onChange(dayjs(d));
    else onChange(d);
  };

  return (
    <div
      className={`relative ${fullWidth ? "w-full" : ""} ${className ?? ""}`}
      ref={containerRef}
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
          readOnly
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          value={displayText}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={`w-full bg-transparent ${palette.text} px-3 pb-2 pr-10 outline-none cursor-pointer ${roundedClass}`}
          aria-label={label}
          placeholder="dd/MM/yyyy HH:mm:ss"
        />

        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-black/5 focus:ring-2 focus:ring-black/10"
          aria-label="Open date time picker"
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              className={`fill-current ${palette.icon}`}
              d="M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5z"
            />
          </svg>
        </button>
      </div>

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
          role="dialog"
          aria-label="Date time picker"
          className="absolute top-full left-0 z-50 mt-2"
          onWheel={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className={`w-full ${roundedClass} border ${palette.popupBorder} ${palette.popupBg} shadow-xl p-3`}
          >
            <div className="flex gap-3">
              <div className="w-[210px]">
                <div className="flex items-center justify-between mb-2">
                  <button
                    className={`p-1 ${palette.itemHoverBg} ${roundedClass}`}
                    onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      className={`fill-current ${palette.icon}`}
                    >
                      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  <div className={`text-sm font-medium ${palette.text}`}>
                    {viewMonth.toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    className={`p-1 ${palette.itemHoverBg} ${roundedClass}`}
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      className={`fill-current ${palette.icon}`}
                    >
                      <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                    </svg>
                  </button>
                </div>

                {/* Week days */}
                <div className="grid grid-cols-7 text-center text-[11px] text-[#6B7280] mb-1">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarGrid.map((d, i) => {
                    const inMonth = d.getMonth() === viewMonth.getMonth();
                    const isTemp = sameDate(d, tempValue);
                    const base =
                      "w-8 h-8 flex items-center justify-center rounded-md text-sm";
                    const muted = inMonth ? palette.itemText : "text-[#9CA3AF]";
                    const activeStyle = isTemp
                      ? `${palette.activeItemBg} ${palette.activeItemText}`
                      : `${muted} ${palette.itemHoverBg}`;
                    return (
                      <button
                        key={i}
                        className={`${base} ${activeStyle}`}
                        onClick={() => {
                          const nv = new Date(tempValue);
                          nv.setFullYear(
                            d.getFullYear(),
                            d.getMonth(),
                            d.getDate()
                          );
                          setTempValue(nv);
                        }}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time columns (24h) */}
              <div className="flex gap-2">
                {[
                  {
                    title: "HH",
                    len: 24,
                    ref: hourListRef,
                    active: tempValue.getHours(),
                    part: "hour" as const,
                  },
                  {
                    title: "MM",
                    len: 60,
                    ref: minuteListRef,
                    active: tempValue.getMinutes(),
                    part: "minute" as const,
                  },
                  {
                    title: "SS",
                    len: 60,
                    ref: secondListRef,
                    active: tempValue.getSeconds(),
                    part: "second" as const,
                  },
                ].map((col) => (
                  <div
                    key={col.title}
                    className={`flex flex-col w-14 max-h-44 ${
                      activeCol === col.part
                        ? "ring-2 ring-black/10 rounded-md"
                        : ""
                    }`}
                  >
                    <div className="px-1 py-0.5 text-[10px] uppercase tracking-wide text-[#6B7280]">
                      {col.title}
                    </div>
                    <div
                      ref={col.ref}
                      className="overflow-y-auto px-0.5 py-0.5 scroll-smooth"
                      style={{ scrollbarWidth: "thin" }}
                      onMouseEnter={() => setActiveCol(col.part)}
                    >
                      {Array.from({ length: col.len }, (_, i) => (
                        <button
                          key={i}
                          data-idx={i}
                          className={[
                            "w-full text-left px-2 py-1.5 rounded-md mb-1 text-sm transition",
                            i === col.active
                              ? `${palette.activeItemBg} ${palette.activeItemText} font-semibold shadow-inner`
                              : `${palette.itemText} ${palette.itemHoverBg}`,
                          ].join(" ")}
                          onClick={() => setTimePart(col.part, i)}
                        >
                          {pad2(i)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                className={`px-3 py-1.5 text-sm ${roundedClass} ${palette.itemHoverBg} ${palette.itemText}`}
                onClick={() => commit(null)}
              >
                Clear
              </button>
              <button
                className={`px-3 py-1.5 text-sm ${roundedClass} ${palette.itemHoverBg} ${palette.itemText}`}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`px-3 py-1.5 text-sm ${roundedClass} bg-[#93C5FD] text-black hover:opacity-90`}
                onClick={() => {
                  commit(new Date(tempValue));
                  setOpen(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
