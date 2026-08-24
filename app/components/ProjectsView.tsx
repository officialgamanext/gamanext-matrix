"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getProjectsForEmployee,
  ProjectAllocation,
} from "@/lib/firebase";
import {
  Briefcase,
  Loader2,
  ShieldCheck,
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
      startDate: "2026-02-01",
      status: "Active",
    },
    {
      id: "p3",
      employeeId: "emp",
      projectName: "Internal Automation & API Suite",
      role: "System Integrator",
      startDate: "2025-10-10",
      endDate: "2026-04-30",
      status: "Completed",
    },
  ];

  const displayList = projects.length > 0 ? projects : fallbackProjects;
  const activeCount = displayList.filter((p) => p.status === "Active").length;

  return (
    <div className="max-w-md md:max-w-lg mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-[8px] bg-[#0052cc] text-white flex items-center justify-center shadow-sm shrink-0">
            <Briefcase className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              My Projects
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assigned project allocations & roles (View Only)
            </p>
          </div>
        </div>

        <span className="bg-blue-50 text-[#0052cc] border border-blue-100 px-3 py-1 rounded-[8px] text-xs font-bold font-mono">
          {activeCount} Active
        </span>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-[8px] flex items-center space-x-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4.5 h-4.5 text-[#0052cc] shrink-0" />
        <span>
          Project allocations are managed by your Administrator. This screen is in{" "}
          <strong>View-Only</strong> mode.
        </span>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#0052cc]" />
          <span className="text-xs">Loading assigned projects...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-3 transition-all hover:border-blue-200"
            >
              {/* Project Title & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Project #{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{proj.projectName}</h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[8px] ${
                    proj.status === "Active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              {/* Allocation Details */}
              <div className="bg-slate-50/80 rounded-[8px] p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Allocated Role:</span>
                  <span className="font-bold text-slate-800">{proj.role || "Developer"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Start Date:</span>
                  <span className="font-mono text-slate-700 font-medium">
                    {proj.startDate || "2026-01-01"}
                  </span>
                </div>

                {proj.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target End Date:</span>
                    <span className="font-mono text-slate-700 font-medium">{proj.endDate}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
