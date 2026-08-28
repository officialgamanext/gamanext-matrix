"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import {
  getProjectsForEmployee,
  getLeavesForEmployee,
  getWFHForEmployee,
  getTimesheetsForEmployee,
  getRequestsForEmployee,
  getDepartmentsFromStorage,
  getEmployeesFromStorage,
  EmployeeData,
} from "@/lib/firebase";
import {
  Clock,
  Calendar,
  Laptop,
  FolderKanban,
  Award,
  Sparkles,
  MapPin,
  Mail,
  Globe,
  ArrowRight,
  ShieldCheck,
  Users,
  PartyPopper,
  Flame,
} from "lucide-react";
import { NavTab } from "./BottomNav";

interface HomeViewProps {
  onNavigateTab: (tab: NavTab) => void;
}

export default function HomeView({ onNavigateTab }: HomeViewProps) {
  const { employee } = useAuth();

  const [projectsCount, setProjectsCount] = useState(0);
  const [timesheetHoursTotal, setTimesheetHoursTotal] = useState(0);
  const [leavesCount, setLeavesCount] = useState(0);
  const [wfhCount, setWfhCount] = useState(0);

  const [allEmployees, setAllEmployees] = useState<EmployeeData[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      try {
        const [
          projList,
          leaveList,
          wfhList,
          tsList,
          empList,
        ] = await Promise.all([
          getProjectsForEmployee(empKey),
          getLeavesForEmployee(empKey),
          getWFHForEmployee(empKey),
          getTimesheetsForEmployee(empKey),
          getEmployeesFromStorage(),
        ]);

        setProjectsCount(projList.filter((p) => p.status === "Active").length || projList.length);
        const totalHours = tsList.reduce((acc, curr) => acc + (Number(curr.billingHours) || 0), 0);
        setTimesheetHoursTotal(totalHours);
        setLeavesCount(leaveList.length);
        setWfhCount(wfhList.length);
        setAllEmployees(empList);
      } catch (err) {
        console.error("Dashboard stats load error:", err);
      }
    }
    loadDashboardData();
  }, [employee]);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5 pb-28 max-w-md md:max-w-lg mx-auto px-4 pt-4 animate-in fade-in">
      {/* 1. Hero Employee Welcome Banner */}
      <div className="bg-gradient-to-r from-[#003680] via-[#0B4FBA] to-[#0A47A4] rounded-[8px] p-5 text-white shadow-sm relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-blue-950/50 border border-blue-400/30 px-2.5 py-0.5 rounded-[8px] text-[11px] font-medium text-blue-100">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{todayStr}</span>
          </div>

          <h1 className="text-lg font-extrabold text-white">
            Welcome, {employee?.firstName} {employee?.lastName}!
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
            {employee?.employeeId && (
              <span className="bg-white/20 px-2 py-0.5 rounded-[8px] text-[10px] font-mono">
                {employee.employeeId}
              </span>
            )}
            {employee?.employeeRole && (
              <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-[8px] text-[10px] font-semibold">
                {employee.employeeRole}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Employee Metrics Overview Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => onNavigateTab("projects")}
          className="bg-white p-3.5 rounded-[8px] border border-slate-100 shadow-xs cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Projects</span>
            <FolderKanban className="w-4 h-4 text-[#0052cc]" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-black text-slate-900">{projectsCount}</span>
            <span className="text-[10px] text-slate-400">Allocated</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("timesheet")}
          className="bg-white p-3.5 rounded-[8px] border border-slate-100 shadow-xs cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Timesheet</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-black text-slate-900">{timesheetHoursTotal}</span>
            <span className="text-[10px] text-slate-400">Hours</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("reports")}
          className="bg-white p-3.5 rounded-[8px] border border-slate-100 shadow-xs cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Leaves</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-black text-slate-900">{leavesCount}</span>
            <span className="text-[10px] text-slate-400">Requests</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("reports")}
          className="bg-white p-3.5 rounded-[8px] border border-slate-100 shadow-xs cursor-pointer hover:border-blue-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">WFH</span>
            <Laptop className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-black text-slate-900">{wfhCount}</span>
            <span className="text-[10px] text-slate-400">Days</span>
          </div>
        </div>
      </div>

      {/* 3. Company Overview Card */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Image
            src="/gama-next-logo-reserved.png"
            alt="GamaNext"
            width={110}
            height={28}
            className="h-6 w-auto object-contain"
          />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          GamaNext Software Solutions Pvt Ltd provides enterprise matrix management, cloud architectures, and digital transformation solutions.
        </p>
      </div>
    </div>
  );
}
