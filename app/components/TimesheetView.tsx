"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getTimesheetsForEmployee,
  saveTimesheetForEmployee,
  getProjectsForEmployee,
  getLeavesForEmployee,
  getHolidaysFromStorage,
  TimesheetEntry,
  ProjectAllocation,
  LeaveRequest,
  HolidayItem,
} from "@/lib/firebase";
import TimesheetCalendarModal from "./TimesheetCalendarModal";
import {
  Clock,
  Calendar as CalendarIcon,
  Briefcase,
  Save,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  BarChart3,
  Lock,
} from "lucide-react";

export default function TimesheetView() {
  const { employee } = useAuth();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [activeProjectName, setActiveProjectName] = useState<string>("Unassigned Project");
  const [loading, setLoading] = useState(true);

  // Calendar Popup Modal State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Today's non-editable date
  const today = new Date();
  const todayIsoStr = today.toISOString().split("T")[0];

  const day = today.getDate();
  const monthName = today.toLocaleDateString("en-US", { month: "long" });
  const year = today.getFullYear();
  const weekdayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const todayDisplayString = `${day} ${monthName} ${year} (${weekdayName})`;

  // Default billing hours set to 09:00 (9 hours)
  const [billingHours, setBillingHours] = useState("09:00");
  const [taskNotes, setTaskNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check if timesheet is already submitted for Today
  const todaySavedEntry = timesheets.find((ts) => ts.date === todayIsoStr);
  const isTodayAlreadySaved = Boolean(todaySavedEntry);

  // History Filter State
  const [filterMonth, setFilterMonth] = useState("All Months");
  const [filterYear, setFilterYear] = useState("2026");
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);

  // Accordion state for month cards
  const currentMonthKey = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({
    [currentMonthKey]: true,
    "May 2026": true,
  });

  const [selectedEntryDetails, setSelectedEntryDetails] = useState<TimesheetEntry | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const [tsList, projList, lvList, holList] = await Promise.all([
          getTimesheetsForEmployee(empKey),
          getProjectsForEmployee(empKey),
          getLeavesForEmployee(empKey),
          getHolidaysFromStorage(),
        ]);

        setTimesheets(tsList);
        setLeaves(lvList);
        setHolidays(holList);

        // Find active allocated project
        const activeProj = projList.find((p) => p.status === "Active");
        if (activeProj) {
          setActiveProjectName(activeProj.projectName);
        } else if (projList.length > 0) {
          setActiveProjectName(projList[0].projectName);
        } else {
          setActiveProjectName("Unassigned Project");
        }
      } catch (err) {
        console.error("Timesheet data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employee]);

  const handleSaveTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (isTodayAlreadySaved) {
      setErrorMsg("Timesheet has already been submitted for today. Updates are not permitted.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;

      let parsedHours = 9;
      if (billingHours.includes(":")) {
        const [h, m] = billingHours.split(":");
        parsedHours = (Number(h) || 0) + (Number(m) || 0) / 60;
      } else {
        parsedHours = Number(billingHours) || 9;
      }

      const newEntry: TimesheetEntry = {
        employeeId: empKey,
        date: todayIsoStr,
        projectName: activeProjectName || "General Task",
        billingHours: parsedHours,
        tasks: taskNotes.trim() || activeProjectName || "General Tasks",
      };

      const saved = await saveTimesheetForEmployee(newEntry);
      setTimesheets((prev) => [saved, ...prev]);
      setTaskNotes("");
      setSuccessMsg("Timesheet entry marked successfully for today!");

      setExpandedMonths((prev) => ({ ...prev, [currentMonthKey]: true }));
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Save timesheet error:", err);
      setErrorMsg(err.message || "Failed to save timesheet.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  // Filter timesheets by selected month and year
  const filteredTimesheets = timesheets.filter((ts) => {
    if (!ts.date) return false;
    const d = new Date(ts.date);
    if (isNaN(d.getTime())) return true;
    if (filterYear && filterYear !== "All" && String(d.getFullYear()) !== filterYear) {
      return false;
    }
    if (filterMonth && filterMonth !== "All Months") {
      const mName = d.toLocaleDateString("en-US", { month: "long" });
      if (mName !== filterMonth) return false;
    }
    return true;
  });

  // Group timesheets by Month
  const groupedTimesheets: { [month: string]: TimesheetEntry[] } = {};

  filteredTimesheets.forEach((ts) => {
    const d = new Date(ts.date);
    const mKey = isNaN(d.getTime())
      ? "Recent"
      : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groupedTimesheets[mKey]) {
      groupedTimesheets[mKey] = [];
    }
    groupedTimesheets[mKey].push(ts);
  });

  const finalGroups = groupedTimesheets;

  const monthList = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const yearList = ["2026", "2025", "2024"];

  return (
    <div className="max-w-md md:max-w-lg mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in">
      {/* 1. Header Section with Calendar Popup Action */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-[8px] bg-[#0052cc] text-white flex items-center justify-center shadow-sm shrink-0">
            <Clock className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Timesheet
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Track and log your daily work hours
            </p>
          </div>
        </div>

        {/* Calendar & Analytics Popup Trigger Button */}
        <button
          type="button"
          onClick={() => setIsCalendarModalOpen(true)}
          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#0052cc] border border-blue-200 rounded-[8px] flex items-center space-x-1.5 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          title="Open Monthly Calendar & Analytics"
        >
          <CalendarIcon className="w-4 h-4 text-[#0052cc]" />
          <span className="hidden sm:inline">Calendar</span>
          <BarChart3 className="w-3.5 h-3.5 text-blue-600 hidden sm:inline" />
        </button>
      </div>

      {/* 2. Mark Timesheet Card */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0052cc] font-bold text-sm">
            <CalendarIcon className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Mark Timesheet</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(true)}
            className="text-[11px] text-[#0052cc] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>View Month Sheet</span>
          </button>
        </div>

        {/* Status Messages */}
        {successMsg && (
          <div className="p-3 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Lock Banner if Timesheet is Already Marked for Today */}
        {isTodayAlreadySaved && (
          <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-[8px] flex items-start space-x-2.5 text-xs text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                Timesheet Already Submitted for Today
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                You have logged <strong>{todaySavedEntry?.billingHours || 9} hrs</strong> on{" "}
                <strong>{todaySavedEntry?.projectName || activeProjectName}</strong>. Timesheet
                entries cannot be modified or re-submitted once saved.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveTimesheet} className="space-y-3.5">
          {/* Field 1: Date (NOT EDITABLE - Displays Today's Date Only) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">
                Date <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Today Only</span>
              </span>
            </div>
            <div className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between select-none cursor-not-allowed">
              <div className="flex items-center space-x-2.5 truncate">
                <CalendarIcon className="w-4 h-4 text-[#0052cc] shrink-0" />
                <span className="text-slate-900 font-semibold truncate">
                  {todayDisplayString}
                </span>
              </div>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
            </div>
          </div>

          {/* Field 2: Assigned Project (Displays Active Project Name) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Assigned Project <span className="text-rose-500">*</span>
            </label>
            <div className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between select-none cursor-not-allowed">
              <div className="flex items-center space-x-2.5 truncate">
                <Briefcase className="w-4 h-4 text-[#0052cc] shrink-0" />
                <span className="text-slate-900 font-semibold truncate">
                  {isTodayAlreadySaved
                    ? todaySavedEntry?.projectName || activeProjectName
                    : activeProjectName}
                </span>
              </div>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-60" />
            </div>
          </div>

          {/* Field 3: Billing Hours (Default 09:00, Locked if already saved) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Billing Hours <span className="text-rose-500">*</span>
            </label>
            <div
              className={`flex items-center border rounded-[8px] overflow-hidden ${
                isTodayAlreadySaved
                  ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                  : "bg-white border-slate-200 focus-within:ring-2 focus-within:ring-[#0052cc]/20 focus-within:border-[#0052cc]"
              }`}
            >
              <div className="pl-3.5 pr-2 py-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-[#0052cc]" />
              </div>
              <input
                type="text"
                disabled={isTodayAlreadySaved}
                value={
                  isTodayAlreadySaved
                    ? `${todaySavedEntry?.billingHours || 9}:00`
                    : billingHours
                }
                onChange={(e) => setBillingHours(e.target.value)}
                placeholder="09:00"
                className={`flex-1 py-2.5 text-xs font-medium outline-none bg-transparent ${
                  isTodayAlreadySaved ? "text-slate-500 cursor-not-allowed" : "text-slate-900"
                }`}
              />
              <span className="px-3.5 py-2.5 bg-slate-100/90 text-slate-500 text-xs font-semibold border-l border-slate-200">
                hrs
              </span>
            </div>
          </div>

          {/* Save Timesheet Button (Disabled if already saved today) */}
          {isTodayAlreadySaved ? (
            <button
              type="button"
              disabled
              className="w-full mt-2 py-3 px-4 bg-emerald-600/90 text-white text-xs font-bold rounded-[8px] shadow-xs flex items-center justify-center space-x-2 cursor-not-allowed opacity-90"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Timesheet Saved for Today</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-[#0052cc] hover:bg-[#0041a8] active:scale-[0.99] text-white text-xs font-bold rounded-[8px] shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Timesheet...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Timesheet</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>

      {/* 3. Timesheet History Section Below */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Timesheet History</h2>

          <div className="flex items-center space-x-2">
            {/* Month Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMonthFilter(!showMonthFilter);
                  setShowYearFilter(false);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-[8px] flex items-center space-x-1.5 text-slate-800 hover:border-slate-300 transition-colors select-none"
              >
                <span>{filterMonth === "All Months" ? "May" : filterMonth}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMonthFilter && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-[8px] shadow-lg z-50 py-1 w-32 max-h-48 overflow-y-auto animate-in fade-in">
                  {monthList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setFilterMonth(m);
                        setShowMonthFilter(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#0052cc]"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowYearFilter(!showYearFilter);
                  setShowMonthFilter(false);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-[8px] flex items-center space-x-1.5 text-slate-800 hover:border-slate-300 transition-colors select-none"
              >
                <span>{filterYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showYearFilter && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-[8px] shadow-lg z-50 py-1 w-24 animate-in fade-in">
                  {yearList.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setFilterYear(y);
                        setShowYearFilter(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#0052cc]"
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Month Accordions */}
        <div className="space-y-3">
          {Object.keys(finalGroups).length > 0 ? (
            Object.keys(finalGroups).map((monthKey) => {
              const entries = finalGroups[monthKey] || [];
              const isExpanded = !!expandedMonths[monthKey];

              const totalHoursNum = entries.reduce(
                (acc, curr) => acc + (Number(curr.billingHours) || 0),
                0
              );
              const totalHoursDisplay =
                totalHoursNum > 0
                  ? `${Math.floor(totalHoursNum)}:${Math.round((totalHoursNum % 1) * 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "00:00";

              return (
                <div
                  key={monthKey}
                  className="bg-white rounded-[8px] border border-slate-100 shadow-xs overflow-hidden transition-all"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleMonth(monthKey)}
                    className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                  >
                    <span className="font-bold text-xs text-[#0052cc]">{monthKey}</span>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">
                        Total: <span className="font-mono">{totalHoursDisplay} hrs</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#0052cc]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Day Rows */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 border-t border-slate-100 bg-white">
                      {entries.map((entry, idx) => {
                        const d = new Date(entry.date);
                        const dayNum = isNaN(d.getTime()) ? "—" : d.getDate().toString();
                        const monthAbbr = isNaN(d.getTime())
                          ? "DATE"
                          : d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                        const weekdayAbbr = isNaN(d.getTime())
                          ? "—"
                          : d.toLocaleDateString("en-US", { weekday: "short" });

                        const formattedHours =
                          typeof entry.billingHours === "number"
                            ? `${Math.floor(entry.billingHours)
                                .toString()
                                .padStart(2, "0")}:${Math.round((entry.billingHours % 1) * 60)
                                .toString()
                                .padStart(2, "0")} hrs`
                            : "09:00 hrs";

                        return (
                          <div
                            key={entry.id || idx}
                            className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs"
                          >
                            <div className="flex flex-col items-center justify-center w-8 shrink-0">
                              <span className="font-black text-xs text-slate-900 leading-none">
                                {dayNum}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-tight">
                                {monthAbbr}
                              </span>
                            </div>

                            <div className="w-9 text-slate-400 font-medium text-[11px] shrink-0 pl-1">
                              {weekdayAbbr}
                            </div>

                            <div className="flex-1 px-2 truncate font-semibold text-slate-800">
                              {entry.projectName}
                            </div>

                            <div className="font-bold text-[#0052cc] font-mono text-xs shrink-0 px-2">
                              {formattedHours}
                            </div>

                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedEntryDetails(entry)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">No Timesheet Records Found</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                No timesheet records found for the selected period. Submit your work hours using the form above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden">
            <div className="bg-[#0052cc] p-4 text-white flex items-center justify-between">
              <span className="text-xs font-bold">Timesheet Details</span>
              <button
                type="button"
                onClick={() => setSelectedEntryDetails(null)}
                className="text-white hover:bg-blue-800/60 p-1 rounded-[8px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Work Date
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedEntryDetails.date}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Project Name
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedEntryDetails.projectName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Hours Logged
                </span>
                <span className="font-mono font-bold text-[#0052cc] text-sm">
                  {selectedEntryDetails.billingHours} Hours
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Tasks Done
                </span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-[8px] border border-slate-100 leading-relaxed mt-1">
                  {selectedEntryDetails.tasks || "No additional task notes."}
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEntryDetails(null)}
                className="px-4 py-2 bg-[#0052cc] text-white text-xs font-bold rounded-[8px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timesheet Calendar & Analytics Modal Popup */}
      <TimesheetCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        timesheets={timesheets}
        leaves={leaves}
        holidays={holidays}
      />
    </div>
  );
}
