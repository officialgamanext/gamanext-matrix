"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  className = "",
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const parsedDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState<Date>(
    isNaN(parsedDate.getTime()) ? new Date() : parsedDate
  );

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setViewDate(d);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generous Year options (1950 - 2060)
  const startYear = 1950;
  const endYear = 2060;
  const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: { day: number; monthOffset: number; dateStr: string }[] = [];

  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(currentYear, currentMonth - 1, day);
    const dateStr = formatDateToYYYYMMDD(d);
    calendarDays.push({ day, monthOffset: -1, dateStr });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentYear, currentMonth, i);
    const dateStr = formatDateToYYYYMMDD(d);
    calendarDays.push({ day: i, monthOffset: 0, dateStr });
  }

  const totalFilled = calendarDays.length;
  const remainingCells = totalFilled <= 35 ? 35 - totalFilled : 42 - totalFilled;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(currentYear, currentMonth + 1, i);
    const dateStr = formatDateToYYYYMMDD(d);
    calendarDays.push({ day: i, monthOffset: 1, dateStr });
  }

  const todayStr = formatDateToYYYYMMDD(new Date());

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleQuickToday = () => {
    onChange(todayStr);
    setViewDate(new Date());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const displayLabel = value
    ? new Date(value).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div ref={popoverRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 text-xs border rounded-[8px] bg-white flex items-center justify-between transition-all select-none ${
          isOpen
            ? "border-[#0052cc] ring-2 ring-[#0052cc]/20 shadow-sm"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"}`}
      >
        <div className="flex items-center space-x-2 truncate">
          <CalendarIcon className="w-4 h-4 text-[#0052cc] shrink-0" />
          <span className={value ? "text-slate-900 font-medium truncate" : "text-slate-400 truncate"}>
            {value ? displayLabel : placeholder}
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:bg-slate-100 rounded-[8px] text-slate-400 hover:text-slate-600 transition-colors mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-90 text-[#0052cc]" : "rotate-90"
            }`}
          />
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-[8px] shadow-xl z-50 p-3.5 w-[300px] animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header with Quick Month & Year Dropdown Selectors */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 hover:bg-slate-100 rounded-[6px] text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Month & Year Dropdowns */}
            <div className="flex items-center gap-1.5 flex-1 justify-center">
              <select
                value={currentMonth}
                onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value), 1))}
                aria-label="Select month"
                className="text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[6px] px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setViewDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                aria-label="Select year"
                className="text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[6px] px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer"
              >
                {yearOptions.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 hover:bg-slate-100 rounded-[6px] text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {dayHeaders.map((dh) => (
              <span key={dh} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1">
                {dh}
              </span>
            ))}
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              const isSelected = item.dateStr === value;
              const isToday = item.dateStr === todayStr;
              const isCurrentMonth = item.monthOffset === 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(item.dateStr)}
                  className={`h-7.5 w-7.5 text-xs rounded-[8px] flex items-center justify-center font-medium transition-all ${
                    isSelected
                      ? "bg-[#0052cc] text-white shadow-xs font-bold"
                      : isToday
                      ? "bg-blue-50 text-[#0052cc] font-bold border border-blue-200"
                      : isCurrentMonth
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleQuickToday}
              className="text-[#0052cc] hover:text-[#003680] font-semibold text-xs transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
