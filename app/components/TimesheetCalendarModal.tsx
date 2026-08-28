"use client";

import { useState, useMemo } from "react";
import {
  TimesheetEntry,
  LeaveRequest,
  HolidayItem,
} from "@/lib/firebase";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  TrendingUp,
  Award,
} from "lucide-react";

interface TimesheetCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  timesheets: TimesheetEntry[];
  leaves: LeaveRequest[];
  holidays: HolidayItem[];
}

type DayStatusType = "logged" | "weekend" | "holiday" | "leave" | "missing" | "future";

interface DayData {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  dayOfWeek: number; // 0=Sun, 6=Sat
  status: DayStatusType;
  label: string;
  details?: {
    timesheet?: TimesheetEntry;
    leave?: LeaveRequest;
    holiday?: HolidayItem;
  };
}

export default function TimesheetCalendarModal({
  isOpen,
  onClose,
  timesheets,
  leaves,
  holidays,
}: TimesheetCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  // Build calendar matrix and calculate analytics
  const { daysInMonth, paddingDays, analytics } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Fast lookup maps
    const timesheetMap = new Map<string, TimesheetEntry>();
    timesheets.forEach((ts) => {
      if (ts.date) timesheetMap.set(ts.date, ts);
    });

    const holidayMap = new Map<string, HolidayItem>();
    holidays.forEach((h) => {
      if (h.date) holidayMap.set(h.date, h);
    });

    const leaveMap = new Map<string, LeaveRequest>();
    leaves.forEach((l) => {
      if (l.status !== "Rejected" && l.fromDate && l.toDate) {
        let cur = new Date(l.fromDate);
        const end = new Date(l.toDate);
        while (cur <= end) {
          const dStr = cur.toISOString().split("T")[0];
          leaveMap.set(dStr, l);
          cur.setDate(cur.getDate() + 1);
        }
      }
    });

    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

    const days: DayData[] = [];

    let loggedCount = 0;
    let loggedHours = 0;
    let weekendCount = 0;
    let holidayCount = 0;
    let leaveCount = 0;
    let missingCount = 0;
    let totalWorkingDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPastOrToday = dateStr <= todayStr;

      let status: DayStatusType = "future";
      let label = "Working Day";
      const details: DayData["details"] = {};

      const ts = timesheetMap.get(dateStr);
      const hol = holidayMap.get(dateStr);
      const lv = leaveMap.get(dateStr);

      if (ts) {
        status = "logged";
        label = `Logged (${ts.billingHours || 8} hrs)`;
        details.timesheet = ts;
        loggedCount++;
        loggedHours += Number(ts.billingHours) || 8;
        if (!isWeekend && !hol) totalWorkingDays++;
      } else if (hol) {
        status = "holiday";
        label = hol.title;
        details.holiday = hol;
        holidayCount++;
      } else if (lv) {
        status = "leave";
        label = `${lv.leaveType} (${lv.status})`;
        details.leave = lv;
        leaveCount++;
        if (!isWeekend) totalWorkingDays++;
      } else if (isWeekend) {
        status = "weekend";
        label = dayOfWeek === 0 ? "Sunday" : "Saturday";
        weekendCount++;
      } else if (isPastOrToday) {
        status = "missing";
        label = "Timesheet Not Applied";
        missingCount++;
        totalWorkingDays++;
      } else {
        status = "future";
        label = "Upcoming Day";
        totalWorkingDays++;
      }

      days.push({
        dateStr,
        dayNum: day,
        dayOfWeek,
        status,
        label,
        details,
      });
    }

    const workingDaysEligible = loggedCount + missingCount + leaveCount;
    const complianceRate =
      workingDaysEligible > 0
        ? Math.round((loggedCount / (loggedCount + missingCount)) * 100) || 100
        : 100;

    return {
      daysInMonth: days,
      paddingDays: firstDayOfWeek,
      analytics: {
        totalDays,
        totalWorkingDays,
        loggedCount,
        loggedHours,
        weekendCount,
        holidayCount,
        leaveCount,
        missingCount,
        complianceRate,
      },
    };
  }, [currentYear, currentMonth, timesheets, leaves, holidays]);

  if (!isOpen) return null;

  const getStatusClasses = (status: DayStatusType, isSelected: boolean) => {
    let base = "border transition-all cursor-pointer font-semibold relative";

    if (isSelected) {
      base += " ring-2 ring-slate-900 shadow-md scale-105 z-10 ";
    }

    switch (status) {
      case "logged":
        return `${base} bg-emerald-50/90 text-emerald-800 border-emerald-200 hover:bg-emerald-100`;
      case "weekend":
        return `${base} bg-blue-50/80 text-[#0052cc] border-blue-200 hover:bg-blue-100`;
      case "holiday":
        return `${base} bg-purple-50/90 text-purple-800 border-purple-200 hover:bg-purple-100`;
      case "leave":
        return `${base} bg-amber-50/90 text-amber-800 border-amber-200 hover:bg-amber-100`;
      case "missing":
        return `${base} bg-rose-50/90 text-rose-800 border-rose-200 hover:bg-rose-100`;
      case "future":
      default:
        return `${base} bg-slate-50/60 text-slate-400 border-slate-100 hover:bg-slate-100`;
    }
  };

  const getStatusDotColor = (status: DayStatusType) => {
    switch (status) {
      case "logged":
        return "bg-emerald-500";
      case "weekend":
        return "bg-[#0052cc]";
      case "holiday":
        return "bg-purple-500";
      case "leave":
        return "bg-amber-500";
      case "missing":
        return "bg-rose-500";
      default:
        return "bg-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-[8px] shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003680] via-[#0B4FBA] to-[#0A47A4] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-[8px] bg-white/15 border border-white/20">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Timesheet Calendar & Analytics
              </h2>
              <p className="text-[11px] text-blue-100">Monthly Attendance & Status Overview</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-[8px] text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Month & Year Navigation with Quick Dropdowns */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-[8px] gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-[6px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Month & Year Dropdown Selectors */}
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) => {
                  setCurrentDate(new Date(currentYear, parseInt(e.target.value), 1));
                  setSelectedDay(null);
                }}
                aria-label="Select month"
                className="text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-[6px] px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer shadow-xs"
              >
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => {
                  setCurrentDate(new Date(parseInt(e.target.value), currentMonth, 1));
                  setSelectedDay(null);
                }}
                aria-label="Select year"
                className="text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-[6px] px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0052cc] cursor-pointer shadow-xs"
              >
                {Array.from({ length: 50 }, (_, i) => 2015 + i).map((yr) => (
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
              className="p-1.5 rounded-[6px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Color Legend Bar */}
          <div className="bg-slate-50/80 border border-slate-200/60 p-3 rounded-[8px] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Color Notations
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
              <div className="flex items-center space-x-1.5 bg-emerald-50/90 text-emerald-900 border border-emerald-200 px-2 py-1 rounded-[8px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium truncate">Timesheet Applied</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-blue-50/90 text-blue-900 border border-blue-200 px-2 py-1 rounded-[8px]">
                <span className="w-2 h-2 rounded-full bg-[#0052cc] shrink-0" />
                <span className="font-medium truncate">Sat / Sun (Holiday)</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-purple-50/90 text-purple-900 border border-purple-200 px-2 py-1 rounded-[8px]">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="font-medium truncate">Official Holiday</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-50/90 text-amber-900 border border-amber-200 px-2 py-1 rounded-[8px]">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="font-medium truncate">Leave Applied</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-rose-50/90 text-rose-900 border border-rose-200 px-2 py-1 rounded-[8px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span className="font-medium truncate">Not Applied</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-[8px]">
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <span className="font-medium truncate">Upcoming Day</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1.5">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase text-slate-400">
              <span className="text-blue-600">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-blue-600">Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="h-11 rounded-[8px] bg-slate-50/30 opacity-20" />
              ))}

              {daysInMonth.map((dayObj) => {
                const isSelected = selectedDay?.dateStr === dayObj.dateStr;
                return (
                  <button
                    key={dayObj.dateStr}
                    type="button"
                    onClick={() => setSelectedDay(dayObj)}
                    className={`h-11 rounded-[8px] flex flex-col items-center justify-between p-1 select-none ${getStatusClasses(
                      dayObj.status,
                      isSelected
                    )}`}
                  >
                    <span className="text-[11px] font-bold leading-none">{dayObj.dayNum}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(dayObj.status)}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Info Card */}
          {selectedDay && (
            <div className="p-3 bg-slate-50 rounded-[8px] border border-slate-200 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  {selectedDay.dateStr}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-[8px] ${getStatusClasses(
                    selectedDay.status,
                    false
                  )}`}
                >
                  {selectedDay.label}
                </span>
              </div>

              {selectedDay.details?.timesheet && (
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/60">
                  <p>
                    <strong>Project:</strong> {selectedDay.details.timesheet.projectName}
                  </p>
                  <p>
                    <strong>Logged Hours:</strong> {selectedDay.details.timesheet.billingHours} hrs
                  </p>
                  {selectedDay.details.timesheet.tasks && (
                    <p className="text-slate-500 italic">
                      "{selectedDay.details.timesheet.tasks}"
                    </p>
                  )}
                </div>
              )}

              {selectedDay.details?.holiday && (
                <div className="text-[11px] text-purple-900 pt-1 border-t border-slate-200/60">
                  <p className="font-semibold">{selectedDay.details.holiday.title}</p>
                  <p className="text-purple-700">{selectedDay.details.holiday.description}</p>
                </div>
              )}

              {selectedDay.details?.leave && (
                <div className="text-[11px] text-amber-900 pt-1 border-t border-slate-200/60">
                  <p className="font-semibold">{selectedDay.details.leave.leaveType} ({selectedDay.details.leave.status})</p>
                  <p className="text-amber-700">Reason: {selectedDay.details.leave.reason}</p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Summary */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-[#0052cc]" />
                <span>Monthly Analytics</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[8px]">
                {analytics.complianceRate}% Compliance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-[8px]">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  Logged Days
                </span>
                <span className="font-black text-sm text-emerald-950">
                  {analytics.loggedCount}d ({analytics.loggedHours}h)
                </span>
              </div>

              <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-[8px]">
                <span className="text-[10px] font-bold uppercase text-rose-800 block">
                  Missing Days
                </span>
                <span className="font-black text-sm text-rose-950">
                  {analytics.missingCount} Days
                </span>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-[8px]">
                <span className="text-[10px] font-bold uppercase text-blue-800 block">
                  Weekends
                </span>
                <span className="font-black text-sm text-blue-950">
                  {analytics.weekendCount} Days
                </span>
              </div>

              <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-[8px]">
                <span className="text-[10px] font-bold uppercase text-purple-800 block">
                  Holidays & Leave
                </span>
                <span className="font-black text-sm text-purple-950">
                  {analytics.holidayCount + analytics.leaveCount} Days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-[8px] transition-colors"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
