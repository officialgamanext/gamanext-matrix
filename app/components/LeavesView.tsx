"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getLeavesForEmployee,
  saveLeaveForEmployee,
  LeaveRequest,
} from "@/lib/firebase";
import CustomDatePicker from "./CustomDatePicker";
import CustomDropdown from "./CustomDropdown";
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";

function getQuarterFromDateStr(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Q1";
  const month = date.getMonth() + 1;

  if (month >= 4 && month <= 6) return "Q1";
  if (month >= 7 && month <= 9) return "Q2";
  if (month >= 10 && month <= 12) return "Q3";
  return "Q4";
}

export default function LeavesView() {
  const { employee } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [leaveType, setLeaveType] = useState<
    "Casual Leave" | "Sick Leave" | "Maternity Leave" | "Paternity Leave"
  >("Casual Leave");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const leaveTypeOptions = [
    "Casual Leave",
    "Sick Leave",
    "Maternity Leave",
    "Paternity Leave",
  ];

  useEffect(() => {
    async function loadLeaves() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const list = await getLeavesForEmployee(empKey);
        setLeaves(list);
      } catch (err) {
        console.error("Leaves load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaves();
  }, [employee]);

  const calculateDaysCount = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays >= 1 ? diffDays : 1;
  };

  const calculatedDays = calculateDaysCount(fromDate, toDate);
  const calculatedQuarter = getQuarterFromDateStr(fromDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for the leave application.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;
      const newLeave: LeaveRequest = {
        employeeId: empKey,
        fromDate,
        toDate,
        leaveType,
        reason: reason.trim(),
        status: "Pending",
        quarter: calculatedQuarter,
        daysCount: calculatedDays,
      };

      const saved = await saveLeaveForEmployee(newLeave);
      setLeaves((prev) => [saved, ...prev]);
      setReason("");
      setSuccessMsg("Leave application submitted successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Submit leave error:", err);
      setErrorMsg(err.message || "Failed to submit leave application.");
    } finally {
      setSubmitting(false);
    }
  };

  const approvedLeaves = leaves.filter((l) => l.status === "Approved");
  const approvedDays = approvedLeaves.reduce((acc, curr) => acc + (curr.daysCount || 1), 0);
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");

  return (
    <div className="max-w-md md:max-w-lg mx-auto px-4 pb-28 space-y-4 animate-in fade-in">
      {/* Summary Card */}
      <div className="bg-white p-4 rounded-[8px] border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Approved Leaves
          </span>
          <span className="text-lg font-black text-slate-900">{approvedDays} Days</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Pending Approval
          </span>
          <span className="text-lg font-black text-[#0052cc]">{pendingLeaves.length} Req</span>
        </div>
      </div>

      {/* Apply Leave Form */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0052cc] font-bold text-sm">
            <Calendar className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Apply Leave</span>
          </div>
          <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[8px] font-semibold">
            {calculatedQuarter} • {calculatedDays} {calculatedDays === 1 ? "day" : "days"}
          </span>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">Leave Type</label>
            <CustomDropdown
              options={leaveTypeOptions}
              value={leaveType}
              onChange={(val) => setLeaveType(val as any)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">From Date</label>
              <CustomDatePicker value={fromDate} onChange={setFromDate} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">To Date</label>
              <CustomDatePicker value={toDate} onChange={setToDate} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 block">Reason for Leave</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending a family function / Medical appointment"
              required
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052cc] text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-[8px] shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Submit Leave Application</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Leave History & Status
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{leaves.length} Total</span>
        </div>

        {leaves.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-[8px]">
            No leave requests submitted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {leaves.map((l, idx) => {
              const statusColor =
                l.status === "Approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : l.status === "Rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";

              return (
                <div
                  key={l.id || idx}
                  className="p-3 bg-slate-50/80 rounded-[8px] border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900">{l.leaveType}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({l.daysCount || 1}d)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {l.fromDate} → {l.toDate}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[8px] border ${statusColor}`}
                  >
                    {l.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
