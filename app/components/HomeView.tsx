"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  Clock,
  Wallet,
  Briefcase,
  Calendar,
  Laptop,
  User,
} from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: any;
  gradient: string;
  shadowColor: string;
  blobColor: string;
}

export default function HomeView() {
  const router = useRouter();
  const { employee } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: "timesheet",
      title: "Timesheet",
      path: "/timesheet",
      icon: Clock,
      gradient: "from-[#FF633E] to-[#E54820]",
      shadowColor: "shadow-orange-500/20",
      blobColor: "#fff0eb",
    },
    {
      id: "payroll",
      title: "Payroll & Payslips",
      path: "/payroll",
      icon: Wallet,
      gradient: "from-[#0084FF] to-[#005AD8]",
      shadowColor: "shadow-blue-500/20",
      blobColor: "#eaf2ff",
    },
    {
      id: "projects",
      title: "Project Allocations",
      path: "/projects",
      icon: Briefcase,
      gradient: "from-[#1E88E5] to-[#1565C0]",
      shadowColor: "shadow-blue-500/20",
      blobColor: "#eaf4fe",
    },
    {
      id: "leaves",
      title: "Leaves Management",
      path: "/leaves",
      icon: Calendar,
      gradient: "from-[#9E3BF7] to-[#7B20DA]",
      shadowColor: "shadow-purple-500/20",
      blobColor: "#f6ecff",
    },
    {
      id: "wfh",
      title: "Work From Home",
      path: "/wfh",
      icon: Laptop,
      gradient: "from-[#00B97D] to-[#009462]",
      shadowColor: "shadow-emerald-500/20",
      blobColor: "#e6f8f1",
    },
    {
      id: "profile",
      title: "My Profile & KYC",
      path: "/profile",
      icon: User,
      gradient: "from-[#0052cc] to-[#0B4FBA]",
      shadowColor: "shadow-blue-500/20",
      blobColor: "#edf4ff",
    },
  ];

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Title matching screenshot: My Space */}
      <div className="text-center pt-1 pb-1">
        <h1 className="text-xl font-medium text-slate-900 tracking-tight">
          My Space
        </h1>
      </div>

      {/* 2-Column Options Grid (Maximum 8px border radius) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => router.push(item.path)}
              className="relative overflow-hidden bg-white rounded-[8px] p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] group flex flex-col justify-between min-h-[140px]"
            >
              {/* Decorative subtle pastel curved blob in top-right corner */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-[8px] pointer-events-none transition-transform duration-300 group-hover:scale-110 opacity-70"
                style={{ backgroundColor: item.blobColor, borderRadius: "120px" }}
              />

              {/* Icon badge (8px border radius) */}
              <div
                className={`w-12 h-12 rounded-[8px] bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-xs ${item.shadowColor} relative z-10 transition-transform duration-200 group-hover:scale-105`}
              >
                <IconComponent className="w-6 h-6 text-white stroke-[2]" />
              </div>

              {/* Option Title */}
              <div className="relative z-10 mt-3.5">
                <h3 className="text-[14px] sm:text-[15px] font-medium text-slate-800 leading-snug group-hover:text-[#0052cc] transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
