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

  const fallbackProjects: ProjectAllocation[] = [
    {
      id: "p1",
      employeeId: "emp",
      projectName: "Gamanext Web Application",
      role: "Frontend Engineer",
      startDate: "2026-01-15",
      endDate: "2026-12-31",
      status: "Active",
    },
    {
      id: "p2",
      employeeId: "emp",
      projectName: "Enterprise Matrix Management App",
      role: "Full Stack Developer",
      startDate: "2025-06-01",
      endDate: "2025-12-31",
      status: "Completed",
    },
    {
      id: "p3",
      employeeId: "emp",
      projectName: "Internal Automation & API Suite",
      role: "System Integrator",
      startDate: "2025-01-10",
      endDate: "2025-05-30",
      status: "Completed",
    },
  ];

  const displayList = projects.length > 0 ? projects : fallbackProjects;
  const activeCount = displayList.filter((p) => p.status === "Active").length;

  return (
    <div className="max-w-md md:max-w-lg mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-[8px] bg-[#0052cc] text-white flex items-center justify-center shadow-sm shrink-0">
            <Briefcase className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Project Allocations
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assigned project history (View Only)
            </p>
          </div>
        </div>

        <span className="bg-blue-50 text-[#0052cc] border border-blue-100 px-3 py-1 rounded-[8px] text-xs font-bold font-mono">
          {activeCount} Active
        </span>
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
        ) : (
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
                        <span>{proj.startDate || "2026-01-01"}</span>
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
        )}
      </div>
    </div>
  );
}
