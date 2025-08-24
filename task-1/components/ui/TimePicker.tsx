import React, { useEffect, useMemo, useRef, useState } from "react";

interface CustomTimePickerProps {
  label: string;
  value: string; // "HH:mm:ss"
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** MUI-like TimePicker (Outlined + Floating label + Paper popup, không đẩy layout) */
export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  label,
  value,
  onChange,
  disabled,
}) => {
  // ====== States ======
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeCol, setActiveCol] = useState<
    "hour" | "minute" | "second" | "ampm"
  >("hour");

  // Container relative để popup absolute không làm dồn UI
  const containerRef = useRef<HTMLDivElement>(null);

  // ====== Parse value ======
  const [rawH, rawM, rawS] = useMemo(
    () =>
      value.split(":").map((n) => Math.max(0, Math.min(59, Number(n) || 0))),
    [value]
  );
  const ampm = rawH >= 12 ? "PM" : "AM";
  const displayHour12 = rawH % 12 || 12;
  const minutes = rawM;
  const seconds = rawS;

  const setTime = (h12: number, m: number, s: number, ap: "AM" | "PM") => {
    const newHour24 = ap === "PM" ? (h12 % 12) + 12 : h12 % 12;
    const next = `${String(newHour24).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
    onChange(next);
  };

  // ====== Click outside to close ======
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

  // ====== Keyboard handling (MUI-like) ======
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const inc = (v: number, max: number, min = 0) => (v < max ? v + 1 : min);
    const dec = (v: number, max: number, min = 0) => (v > min ? v - 1 : max);

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
    if (e.key === "ArrowRight") {
      setActiveCol((c) =>
        c === "hour"
          ? "minute"
          : c === "minute"
          ? "second"
          : c === "second"
          ? "ampm"
          : "hour"
      );
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowLeft") {
      setActiveCol((c) =>
        c === "ampm"
          ? "second"
          : c === "second"
          ? "minute"
          : c === "minute"
          ? "hour"
          : "ampm"
      );
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (activeCol === "hour") {
        const next =
          e.key === "ArrowUp"
            ? inc(displayHour12, 12, 1)
            : dec(displayHour12, 12, 1);
        setTime(next, minutes, seconds, ampm as "AM" | "PM");
      } else if (activeCol === "minute") {
        const next =
          e.key === "ArrowUp" ? inc(minutes, 59, 0) : dec(minutes, 59, 0);
        setTime(displayHour12, next, seconds, ampm as "AM" | "PM");
      } else if (activeCol === "second") {
        const next =
          e.key === "ArrowUp" ? inc(seconds, 59, 0) : dec(seconds, 59, 0);
        setTime(displayHour12, minutes, next, ampm as "AM" | "PM");
      } else {
        const next = ampm === "AM" ? "PM" : "AM";
        setTime(displayHour12, minutes, seconds, next as "AM" | "PM");
      }
      e.preventDefault();
    }
  };

  // ====== Refs cho list & autoscroll ======
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const secondListRef = useRef<HTMLDivElement>(null);
  const ampmListRef = useRef<HTMLDivElement>(null);

  // Chấp nhận cả RefObject & MutableRefObject cho hàm trợ giúp
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
    // Giờ là 1..12 -> index 0..11
    scrollInto(hourListRef, displayHour12 - 1);
    scrollInto(minuteListRef, minutes);
    scrollInto(secondListRef, seconds);
    scrollInto(ampmListRef, ampm === "AM" ? 0 : 1);
  }, [open, displayHour12, minutes, seconds, ampm]);

  // ====== UI helpers ======
  const outlinedBorder =
    "rounded-xl border border-[#CFBFAD]/60 bg-transparent hover:border-[#CFBFAD] focus-within:border-[#CFBFAD] focus-within:ring-2 focus-within:ring-[#768D85]/50 transition";
  const labelFloated = focused || open || value !== "00:00:00";
  const displayText = `${String(displayHour12).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${ampm}`;

  const Column = ({
    title,
    items,
    activeIndex,
    onPick,
    refObj,
    colType,
  }: {
    title: string;
    items: Array<{ label: string; value: number | string }>;
    activeIndex: number;
    onPick: (i: number) => void;
    refObj: DivRef; // quan trọng: nhận cả 2 dạng ref
    colType: "hour" | "minute" | "second" | "ampm";
  }) => (
    <div
      className={`flex flex-col w-14 max-h-44 ${
        activeCol === colType ? "ring-2 ring-[#768D85]/60 rounded-md" : ""
      }`}
    >
      <div className="px-1 py-0.5 text-[10px] uppercase tracking-wide text-[#BAC6C2]">
        {title}
      </div>
      <div
        ref={refObj as React.RefObject<HTMLDivElement>}
        className="overflow-y-auto px-0.5 py-0.5 scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((it, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={`${title}-${idx}`}
              data-idx={idx}
              onClick={() => onPick(idx)}
              className={[
                "w-full text-left px-2 py-1.5 rounded-md mb-1 text-sm transition",
                active
                  ? "bg-[#2E2E2E] text-white font-semibold shadow-inner"
                  : "text-[#CFBFAD] hover:bg-[#2E2E2E]/60",
              ].join(" ")}
            >
              {typeof it.value === "number"
                ? String(it.label).padStart(2, "0")
                : it.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const hours12 = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return { label: String(h), value: h };
  });
  const minsSecs = Array.from({ length: 60 }, (_, i) => ({
    label: String(i),
    value: i,
  }));
  const ampmItems = [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Outlined TextField with floating label & end icon */}
      <div
        className={`relative ${outlinedBorder} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <label
          className={[
            "absolute left-3 px-1 bg-[#252525]",
            "origin-left transform transition-all",
            labelFloated
              ? "-top-2 text-xs text-[#BAC6C2]"
              : "top-2.5 text-sm text-[#CFBFAD]",
          ].join(" ")}
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
          className="w-full bg-transparent text-[#CFBFAD] px-3 py-2.5 pr-10 outline-none cursor-pointer"
          aria-label={label}
        />

        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[#2E2E2E] focus:ring-2 focus:ring-[#768D85]/50"
          aria-label="Open time picker"
          disabled={disabled}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="fill-current text-[#CFBFAD]"
          >
            <path d="M12 1.75a10.25 10.25 0 1 0 0 20.5 10.25 10.25 0 0 0 0-20.5Zm0 18.5a8.25 8.25 0 1 1 0-16.5 8.25 8.25 0 0 1 0 16.5Zm.75-13.5a.75.75 0 0 0-1.5 0v5.19c0 .3.18.57.46.69l4.5 2a.75.75 0 0 0 .6-1.37l-4.06-1.8V6.75Z" />
          </svg>
        </button>
      </div>

      {open && !disabled && (
        <div
          role="dialog"
          aria-label="Time picker"
          className="absolute top-full left-0 z-50 mt-2"
          onWheel={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="w-fit rounded-xl border border-[#CFBFAD]/40 bg-[#1E1E1E] shadow-xl p-2">
            <div className="flex gap-2">
              <Column
                title="Hours"
                items={hours12}
                activeIndex={displayHour12 - 1}
                onPick={(idx) => {
                  setTime(idx + 1, minutes, seconds, ampm as "AM" | "PM");
                  setActiveCol("hour");
                }}
                refObj={hourListRef}
                colType="hour"
              />
              <Column
                title="Minutes"
                items={minsSecs}
                activeIndex={minutes}
                onPick={(idx) => {
                  setTime(displayHour12, idx, seconds, ampm as "AM" | "PM");
                  setActiveCol("minute");
                }}
                refObj={minuteListRef}
                colType="minute"
              />
              <Column
                title="Seconds"
                items={minsSecs}
                activeIndex={seconds}
                onPick={(idx) => {
                  setTime(displayHour12, minutes, idx, ampm as "AM" | "PM");
                  setActiveCol("second");
                }}
                refObj={secondListRef}
                colType="second"
              />
              <Column
                title="AM/PM"
                items={ampmItems}
                activeIndex={ampm === "AM" ? 0 : 1}
                onPick={(idx) => {
                  const ap = idx === 0 ? "AM" : "PM";
                  setTime(displayHour12, minutes, seconds, ap as "AM" | "PM");
                  setActiveCol("ampm");
                }}
                refObj={ampmListRef}
                colType="ampm"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-2.5 py-1 text-xs rounded-md hover:bg-[#2E2E2E] text-[#CFBFAD]"
                onClick={() => onChange("00:00:00")}
              >
                Clear
              </button>
              <button
                className="px-2.5 py-1 text-xs rounded-md hover:bg-[#2E2E2E] text-[#CFBFAD]"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-2.5 py-1 text-xs rounded-md bg-[#768D85] text-black hover:opacity-90"
                onClick={() => setOpen(false)}
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
