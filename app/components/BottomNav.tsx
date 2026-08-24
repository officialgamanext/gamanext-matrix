"use client";

import {
  Clock,
  FileBarChart2,
  Briefcase,
  User,
} from "lucide-react";

export type NavTab = "timesheet" | "reports" | "projects" | "profile" | "home";

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export default function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  const tabs: { id: NavTab; label: string; icon: any }[] = [
    { id: "timesheet", label: "Timesheet", icon: Clock },
    { id: "reports", label: "Reports", icon: FileBarChart2 },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 md:pb-3 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_35px_-5px_rgba(0,54,128,0.12),0_4px_12px_rgba(0,0,0,0.04)] px-3 py-1.5 rounded-[8px] flex items-center justify-around w-full max-w-md md:max-w-lg transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3.5 rounded-[8px] transition-all duration-200 select-none cursor-pointer group ${
                isActive
                  ? "text-[#0052cc] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {/* Subtle top indicator bar on active */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-[#0052cc] rounded-[8px] shadow-[0_0_8px_rgba(0,82,204,0.6)] animate-in fade-in" />
              )}

              {/* Icon Container with active highlight pill */}
              <div
                className={`p-1.5 rounded-[8px] transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? "bg-blue-50/90 text-[#0052cc] scale-110 shadow-xs border border-blue-100/80"
                    : "group-hover:bg-slate-100/70 text-slate-400 group-hover:text-slate-700"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
              </div>

              {/* Tab Label */}
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none transition-colors duration-150 ${
                  isActive
                    ? "font-bold text-[#0052cc]"
                    : "font-medium text-slate-400 group-hover:text-slate-700"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
