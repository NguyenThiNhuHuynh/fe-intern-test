"use client";
import { useState, useEffect } from "react";

interface TimePickerProps {
  setTime: React.Dispatch<React.SetStateAction<string>>;
  initialTime: string; // Nhận "HH:mm:ss" hoặc "hh:mm:ss AM/PM"
}

const pad = (n: number) => n.toString().padStart(2, "0");

// Parse initialTime: hỗ trợ cả "hh:mm:ss AM/PM" và "HH:mm:ss" -> trả về 24h
const parseInitial = (t: string | undefined) => {
  if (!t) return { h: 0, m: 0, s: 0 };

  const str = t.trim();

  // 12h với AM/PM
  const ampm = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10) % 12;
    if (ampm[4].toUpperCase() === "PM") h += 12;
    const m = parseInt(ampm[2], 10) || 0;
    const s = parseInt(ampm[3] || "0", 10) || 0;
    return { h, m, s };
  }

  // 24h
  const h24 = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (h24) {
    const h = Math.min(23, Math.max(0, parseInt(h24[1], 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(h24[2], 10) || 0));
    const s = Math.min(59, Math.max(0, parseInt(h24[3] || "0", 10) || 0));
    return { h, m, s };
  }

  return { h: 0, m: 0, s: 0 };
};

const TimePicker = ({ setTime, initialTime }: TimePickerProps) => {
  const init = parseInitial(initialTime);

  const [showPicker, setShowPicker] = useState(false);
  const [hour, setHour] = useState<number>(init.h);
  const [minute, setMinute] = useState<number>(init.m);
  const [second, setSecond] = useState<number>(init.s);
  const [timeValue, setTimeValue] = useState<string>(
    `${pad(init.h)}:${pad(init.m)}:${pad(init.s)}`
  );

  // Nếu initialTime thay đổi từ cha → đồng bộ lại
  useEffect(() => {
    const p = parseInitial(initialTime);
    setHour(p.h);
    setMinute(p.m);
    setSecond(p.s);
    setTimeValue(`${pad(p.h)}:${pad(p.m)}:${pad(p.s)}`);
  }, [initialTime]);

  const handleOk = () => {
    const formatted = `${pad(hour)}:${pad(minute)}:${pad(second)}`; // 24h
    setTime(formatted);
    setTimeValue(formatted);
    setShowPicker(false);
  };

  const handleCancel = () => setShowPicker(false);

  return (
    <div className="relative inline-block">
      <input
        type="text"
        value={timeValue}
        onFocus={() => setShowPicker(true)}
        readOnly
        className="border border-gray-300 rounded p-2 w-32 bg-white cursor-pointer"
      />
      {showPicker && (
        <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow p-4 z-10">
          <div className="flex space-x-3">
            {/* Hours 0..23 */}
            <div className="flex flex-col items-center max-h-40 overflow-y-auto">
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <div
                  key={h}
                  onClick={() => setHour(h)}
                  className={`px-2 py-1 cursor-pointer rounded ${
                    h === hour ? "bg-pink-500 text-white" : ""
                  }`}
                >
                  {pad(h)}
                </div>
              ))}
            </div>
            {/* Minutes 0..59 */}
            <div className="flex flex-col items-center max-h-40 overflow-y-auto">
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <div
                  key={m}
                  onClick={() => setMinute(m)}
                  className={`px-2 py-1 cursor-pointer rounded ${
                    m === minute ? "bg-pink-500 text-white" : ""
                  }`}
                >
                  {pad(m)}
                </div>
              ))}
            </div>
            {/* Seconds 0..59 */}
            <div className="flex flex-col items-center max-h-40 overflow-y-auto">
              {Array.from({ length: 60 }, (_, i) => i).map((s) => (
                <div
                  key={s}
                  onClick={() => setSecond(s)}
                  className={`px-2 py-1 cursor-pointer rounded ${
                    s === second ? "bg-pink-500 text-white" : ""
                  }`}
                >
                  {pad(s)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={handleCancel}
              className="px-3 py-1 rounded border text-gray-600"
            >
              CANCEL
            </button>
            <button
              onClick={handleOk}
              className="px-3 py-1 rounded bg-pink-500 text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
