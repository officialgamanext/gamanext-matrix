"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getProjectsForEmployee,
  ProjectAllocation,
} from "@/lib/firebase";
import {
  Briefcase,
  Calendar,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  History,
} from "lucide-react";

export default function ProjectsView() {
  const { employee } = useAuth();
  const [projects, setProjects] = useState<ProjectAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const list = await getProjectsForEmployee(empKey);
        setProjects(list);
      } catch (err) {
        console.error("Projects load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [employee]);

  const displayList = projects;
  const activeCount = displayList.filter((p) => p.status === "Active").length;

  return (
    <div className="max-w-md md:max-w-lg mx-auto px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0052cc] via-[#0046b0] to-[#003688] text-white rounded-[8px] p-5 shadow-xs">
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-[8px] bg-white/20 text-[11px] font-medium text-blue-100 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>Assigned Projects</span>
            </span>
            <h2 className="text-xl font-medium text-white tracking-tight pt-1">
              Project Allocations
            </h2>
            <p className="text-xs text-blue-200 font-medium">
              Official client and internal project assignments
            </p>
          </div>

          <div className="w-11 h-11 rounded-[8px] bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
            <Briefcase className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-white/20 flex items-center justify-between text-xs">
          <span className="text-blue-200">
            Active Allocations: <strong className="text-white font-medium">{activeCount}</strong>
          </span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-[8px] text-[10px] font-mono">
            {employee?.employeeId}
          </span>
        </div>
      </div>

      {/* 2. Notice Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-[8px] flex items-center space-x-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4.5 h-4.5 text-[#0052cc] shrink-0" />
        <span>
          Only one project is active at a time. View your full project assignment history from start date to end date below.
        </span>
      </div>

      {/* 3. Project Assignment History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
            <History className="w-4 h-4 text-[#0052cc]" />
            <span>Assignment History</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            {displayList.length} Total Allocations
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0052cc]" />
            <span className="text-xs">Loading assignment history...</span>
          </div>
        ) : displayList.length > 0 ? (
          <div className="space-y-3">
            {displayList.map((proj, idx) => {
              const isActive = proj.status === "Active";

              return (
                <div
                  key={proj.id || idx}
                  className={`bg-white rounded-[8px] border shadow-xs p-4 space-y-3 transition-all ${
                    isActive ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-100"
                  }`}
                >
                  {/* Top Row: Title & Active/Completed Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#0052cc]" />
                        <h3 className="text-sm font-bold text-slate-900">{proj.projectName}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-medium pl-5 block">
                        Role: <strong className="text-slate-800">{proj.role || "Developer"}</strong>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[8px] shrink-0 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isActive ? "● Active Project" : "Completed / Inactive"}
                    </span>
                  </div>

                  {/* Dates Box (From Date & To Date) */}
                  <div className="bg-slate-50 rounded-[8px] p-2.5 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        From Date
                      </span>
                      <div className="flex items-center space-x-1 mt-0.5 font-mono text-slate-800 font-semibold">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{proj.startDate || "—"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        To Date
                      </span>
                      <div className="flex items-center space-x-1 mt-0.5 font-mono text-slate-800 font-semibold">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{proj.endDate || "Ongoing / Active"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-800">No Project Allocations</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              You have not been assigned to any project yet. Once assigned by your manager or administrator, your project details will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
