"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getTimesheetsForEmployee,
  saveTimesheetForEmployee,
  getProjectsForEmployee,
  getMasterProjectsFromStorage,
  TimesheetEntry,
} from "@/lib/firebase";
import CustomDatePicker from "./CustomDatePicker";
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
  Plus,
  X,
} from "lucide-react";

export default function TimesheetView() {
  const { employee } = useAuth();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("Gamanext Web Application");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [billingHours, setBillingHours] = useState("08:00");
  const [taskDescription, setTaskDescription] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // History Filter State
  const [filterMonth, setFilterMonth] = useState("All Months");
  const [filterYear, setFilterYear] = useState("2026");
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);

  // Accordion open/close state for month groups
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({
    "May 2026": true,
    "August 2026": true,
  });

  // Action popup state for single entry
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<TimesheetEntry | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const [tsList, projList, masterList] = await Promise.all([
          getTimesheetsForEmployee(empKey),
          getProjectsForEmployee(empKey),
          getMasterProjectsFromStorage(),
        ]);

        setTimesheets(tsList);

        const projectNames = Array.from(
          new Set([
            ...projList.map((p) => p.projectName),
            ...masterList.map((m) => m.name),
            "Gamanext Web Application",
            "Mobile App Development",
            "UI/UX Design",
            "API Integration",
            "Bug Fixing & Testing",
          ])
        ).filter(Boolean);

        setProjectOptions(projectNames);
        if (projectNames.length > 0) {
          setSelectedProject(projectNames[0]);
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
    if (!selectedProject.trim()) {
      setErrorMsg("Please select an assigned project.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;

      let parsedHours = 8;
      if (billingHours.includes(":")) {
        const [h, m] = billingHours.split(":");
        parsedHours = (Number(h) || 0) + (Number(m) || 0) / 60;
      } else {
        parsedHours = Number(billingHours) || 8;
      }

      const newEntry: TimesheetEntry = {
        employeeId: empKey,
        date: date || todayStr,
        projectName: selectedProject,
        billingHours: parsedHours,
        tasks: taskDescription.trim() || selectedProject,
      };

      const saved = await saveTimesheetForEmployee(newEntry);
      setTimesheets((prev) => [saved, ...prev]);
      setTaskDescription("");
      setSuccessMsg("Timesheet entry saved successfully!");

      const d = new Date(date || todayStr);
      const mName = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      setExpandedMonths((prev) => ({ ...prev, [mName]: true }));

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

  // Group timesheets by Month
  const groupedTimesheets: { [month: string]: TimesheetEntry[] } = {};

  const sampleFallbackData: { [month: string]: TimesheetEntry[] } = {
    "May 2026": [
      {
        id: "s1",
        employeeId: "emp",
        date: "2026-05-23",
        projectName: "Gamanext Web Application",
        billingHours: 8,
        tasks: "Frontend architecture & dashboard integration",
      },
      {
        id: "s2",
        employeeId: "emp",
        date: "2026-05-22",
        projectName: "Mobile App Development",
        billingHours: 7.5,
        tasks: "React Native UI components & screens",
      },
      {
        id: "s3",
        employeeId: "emp",
        date: "2026-05-21",
        projectName: "UI/UX Design",
        billingHours: 8,
        tasks: "Design system & Figma tokens layout",
      },
      {
        id: "s4",
        employeeId: "emp",
        date: "2026-05-20",
        projectName: "API Integration",
        billingHours: 9,
        tasks: "REST API endpoints & Firebase database hooks",
      },
      {
        id: "s5",
        employeeId: "emp",
        date: "2026-05-19",
        projectName: "Bug Fixing & Testing",
        billingHours: 8,
        tasks: "QA testing & unit test cases validation",
      },
    ],
  };

  timesheets.forEach((ts) => {
    const d = new Date(ts.date);
    const mKey = isNaN(d.getTime())
      ? "Recent"
      : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groupedTimesheets[mKey]) {
      groupedTimesheets[mKey] = [];
    }
    groupedTimesheets[mKey].push(ts);
  });

  const finalGroups =
    Object.keys(groupedTimesheets).length > 0 ? groupedTimesheets : sampleFallbackData;

  const defaultMonthTotals: { [key: string]: string } = {
    "May 2026": "40:30",
    "April 2026": "160:00",
    "March 2026": "168:30",
    "February 2026": "152:00",
    "January 2026": "176:00",
  };

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
      {/* 1. Top Header Section */}
      <div className="flex items-center space-x-3 pt-1">
        <div className="w-12 h-12 rounded-[8px] bg-[#0052cc] text-white flex items-center justify-center shadow-sm shrink-0">
          <Clock className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
            Timesheet
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track and log your work hours
          </p>
        </div>
      </div>

      {/* 2. Mark Timesheet Card */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center space-x-2 text-[#0052cc] font-bold text-sm">
          <CalendarIcon className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Mark Timesheet</span>
        </div>

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

        <form onSubmit={handleSaveTimesheet} className="space-y-3.5">
          {/* Field 1: Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Date <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker
              value={date}
              onChange={setDate}
              placeholder="Select date..."
              className="w-full"
            />
          </div>

          {/* Field 2: Assigned Project */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-slate-800 block">
              Assigned Project <span className="text-rose-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-[8px] flex items-center justify-between hover:border-slate-300 transition-colors select-none"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Briefcase className="w-4 h-4 text-[#0052cc] shrink-0" />
                <span className="text-slate-900 font-medium truncate">
                  {selectedProject || "Select Assigned Project"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  showProjectDropdown ? "rotate-180 text-[#0052cc]" : ""
                }`}
              />
            </button>

            {showProjectDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-100 rounded-[8px] shadow-xl z-50 p-1.5 max-h-48 overflow-y-auto space-y-0.5 animate-in fade-in">
                {projectOptions.map((proj) => (
                  <button
                    key={proj}
                    type="button"
                    onClick={() => {
                      setSelectedProject(proj);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-[8px] flex items-center space-x-2 transition-colors ${
                      selectedProject === proj
                        ? "bg-blue-50 text-[#0052cc] font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#0052cc] shrink-0" />
                    <span className="truncate">{proj}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Field 3: Billing Hours */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">
              Billing Hours <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center border border-slate-200 rounded-[8px] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#0052cc]/20 focus-within:border-[#0052cc]">
              <div className="pl-3.5 pr-2 py-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-[#0052cc]" />
              </div>
              <input
                type="text"
                value={billingHours}
                onChange={(e) => setBillingHours(e.target.value)}
                placeholder="08:00"
                className="flex-1 py-2.5 text-xs font-medium text-slate-900 outline-none bg-transparent"
              />
              <span className="px-3.5 py-2.5 bg-slate-100/90 text-slate-500 text-xs font-semibold border-l border-slate-200">
                hrs
              </span>
            </div>
          </div>

          {/* Task Details Description */}
          <div className="pt-1">
            {!showTaskInput ? (
              <button
                type="button"
                onClick={() => setShowTaskInput(true)}
                className="text-[11px] font-bold text-[#0052cc] hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add task description (optional)</span>
              </button>
            ) : (
              <div className="space-y-1 animate-in fade-in">
                <label className="text-xs font-bold text-slate-700 block">Task Details</label>
                <textarea
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe sprint items or deliverables completed today..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052cc] text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Save Timesheet Button */}
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
        </form>
      </div>

      {/* 3. Timesheet History Section */}
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

        {/* Accordions */}
        <div className="space-y-3">
          {Object.keys(finalGroups).map((monthKey) => {
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
                : defaultMonthTotals[monthKey] || "40:30";

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
                      const dayNum = isNaN(d.getTime()) ? "23" : d.getDate().toString();
                      const monthAbbr = isNaN(d.getTime())
                        ? "MAY"
                        : d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                      const weekdayAbbr = isNaN(d.getTime())
                        ? "Fri"
                        : d.toLocaleDateString("en-US", { weekday: "short" });

                      const formattedHours =
                        typeof entry.billingHours === "number"
                          ? `${Math.floor(entry.billingHours)
                              .toString()
                              .padStart(2, "0")}:${Math.round((entry.billingHours % 1) * 60)
                              .toString()
                              .padStart(2, "0")} hrs`
                          : "08:00 hrs";

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
          })}

          {["April 2026", "March 2026", "February 2026", "January 2026"].map(
            (mName) =>
              !finalGroups[mName] && (
                <div
                  key={mName}
                  onClick={() => toggleMonth(mName)}
                  className="bg-white rounded-[8px] border border-slate-100 shadow-xs px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                >
                  <span className="font-bold text-xs text-[#0052cc]">{mName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800">
                      Total:{" "}
                      <span className="font-mono">
                        {defaultMonthTotals[mName] || "160:00"} hrs
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden">
            <div className="bg-[#0052cc] p-4 text-white flex items-center justify-between">
              <span className="text-xs font-bold">Timesheet Entry Details</span>
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
                  Project
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
                  Tasks Completed
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
    </div>
  );
}
