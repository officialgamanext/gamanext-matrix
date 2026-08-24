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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] px-4 py-2 flex items-center justify-around max-w-lg md:max-w-xl mx-auto md:rounded-t-[8px] md:border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-[8px] transition-all select-none cursor-pointer ${
              isActive
                ? "text-[#0052cc]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {/* Tab Icon */}
            <div
              className={`p-1.5 rounded-[8px] transition-all ${
                isActive ? "bg-blue-50/90 text-[#0052cc]" : ""
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "stroke-[2.5]" : "stroke-[1.75]"
                }`}
              />
            </div>

            {/* Tab Label */}
            <span
              className={`text-[11px] mt-0.5 tracking-tight ${
                isActive ? "font-bold text-[#0052cc]" : "font-medium text-slate-400"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
