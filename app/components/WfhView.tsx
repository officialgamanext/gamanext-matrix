"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getWFHForEmployee,
  saveWFHForEmployee,
  WFHRequest,
} from "@/lib/firebase";
import CustomDatePicker from "./CustomDatePicker";
import CustomDropdown from "./CustomDropdown";
import {
  Laptop,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function WfhView() {
  const { employee } = useAuth();
  const [wfhList, setWfhList] = useState<WFHRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [month, setMonth] = useState(currentMonthName);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const monthsOptions = [
    currentMonthName,
    "January 2026",
    "February 2026",
    "March 2026",
    "April 2026",
    "May 2026",
    "June 2026",
    "July 2026",
    "August 2026",
    "September 2026",
    "October 2026",
    "November 2026",
    "December 2026",
  ];

  useEffect(() => {
    async function loadWFH() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const list = await getWFHForEmployee(empKey);
        setWfhList(list);
      } catch (err) {
        console.error("WFH load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWFH();
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for the Work From Home request.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;
      const newWfh: WFHRequest = {
        employeeId: empKey,
        fromDate,
        toDate,
        month,
        reason: reason.trim(),
        status: "Pending",
      };

      const saved = await saveWFHForEmployee(newWfh);
      setWfhList((prev) => [saved, ...prev]);
      setReason("");
      setSuccessMsg("Work From Home request submitted successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Submit WFH error:", err);
      setErrorMsg(err.message || "Failed to submit WFH request.");
    } finally {
      setSubmitting(false);
    }
  };

  const approvedWfh = wfhList.filter((w) => w.status === "Approved");
  const pendingWfh = wfhList.filter((w) => w.status === "Pending");

  return (
    <div className="max-w-md md:max-w-lg mx-auto px-4 pb-28 space-y-4 animate-in fade-in">
      {/* Summary Card */}
      <div className="bg-white p-4 rounded-[8px] border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Approved WFH
          </span>
          <span className="text-lg font-black text-slate-900">{approvedWfh.length} Approved</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Pending WFH
          </span>
          <span className="text-lg font-black text-[#0052cc]">{pendingWfh.length} Req</span>
        </div>
      </div>

      {/* Apply WFH Form */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0052cc] font-bold text-sm">
            <Laptop className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Request Work From Home</span>
          </div>
          <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-[8px] font-semibold">
            {month}
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
            <label className="text-xs font-bold text-slate-800 block">Month</label>
            <CustomDropdown
              options={monthsOptions}
              value={month}
              onChange={setMonth}
              placeholder="Select Month..."
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
            <label className="text-xs font-bold text-slate-800 block">Reason for Remote Work</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Travel requirements / Internet setup ready"
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
                <span>Submit WFH Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* WFH History */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            WFH History & Status
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">{wfhList.length} Total</span>
        </div>

        {wfhList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-[8px]">
            No WFH requests submitted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {wfhList.map((w, idx) => {
              const statusColor =
                w.status === "Approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : w.status === "Rejected"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200";

              return (
                <div
                  key={w.id || idx}
                  className="p-3 bg-slate-50/80 rounded-[8px] border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900">Work From Home</span>
                      <span className="text-[10px] text-slate-500 font-mono">({w.month})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {w.fromDate} → {w.toDate}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[8px] border ${statusColor}`}
                  >
                    {w.status}
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
