"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  ChevronLeft,
  User,
  LogOut,
  Calendar,
  Clock,
  Briefcase,
  FileBarChart,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { employee, logout } = useAuth();

  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isHomePage = pathname === "/";

  const getInitials = () => {
    if (!employee) return "EMP";
    const f = employee.firstName ? employee.firstName[0].toUpperCase() : "";
    const l = employee.lastName ? employee.lastName[0].toUpperCase() : "";
    return f + l || employee.username?.substring(0, 2).toUpperCase() || "GN";
  };

  const handleBack = () => {
    if (!isHomePage) {
      router.push("/");
    } else {
      setShowLogoutConfirm(true);
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md text-slate-800 h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-100/90 shadow-2xs sticky top-0 z-40">
        {/* Left: Back Button Icon (Max 34px height & width, 8px border radius) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="w-[34px] h-[34px] rounded-[8px] bg-[#eff4ff] hover:bg-[#e2ecfe] text-[#0052cc] flex items-center justify-center transition-all cursor-pointer border border-blue-100/60 shadow-2xs active:scale-95"
            aria-label={isHomePage ? "Options" : "Back to Home"}
            title={isHomePage ? "Options" : "Back to Home"}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Center: Gamanext Official Logo */}
        <div
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-98 select-none"
        >
          <Image
            src="/gama-next-logo-reserved.png"
            alt="Gamanext Software Solutions"
            width={140}
            height={34}
            className="h-7 md:h-8 w-auto object-contain"
            priority
          />
        </div>

        {/* Right: Login Details / Employee Avatar (Max 34px height, 8px border radius) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowProfileDrawer(true)}
            className="h-[34px] flex items-center space-x-2 px-1.5 rounded-[8px] hover:bg-slate-100 transition-all cursor-pointer border border-slate-100 shadow-2xs group"
            aria-label="View Logged in Details"
          >
            <div className="relative">
              {employee?.profilePhotoUrl ? (
                <img
                  src={employee.profilePhotoUrl}
                  alt={employee.firstName}
                  className="w-6.5 h-6.5 rounded-[6px] object-cover border border-[#0052cc]/30 shadow-2xs"
                />
              ) : (
                <div className="w-6.5 h-6.5 rounded-[6px] bg-gradient-to-tr from-[#0052cc] to-[#2563eb] text-white font-medium text-[11px] flex items-center justify-center shadow-2xs">
                  {getInitials()}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-[2px] ring-1 ring-white" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-800 leading-tight group-hover:text-[#0052cc] transition-colors truncate max-w-[100px]">
                {employee?.firstName || "Employee"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {employee?.employeeId || "Logged In"}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Slide-out Employee Details Drawer (Max 8px border radius) */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowProfileDrawer(false)}
          />

          <div className="relative w-84 max-w-[88vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
            <div className="overflow-y-auto">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee Session
                </span>
                <button
                  type="button"
                  onClick={() => setShowProfileDrawer(false)}
                  className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Employee Card */}
              {employee && (
                <div className="p-4 m-3 rounded-[8px] bg-gradient-to-br from-[#003680] to-[#0B4FBA] text-white">
                  <div className="flex items-center space-x-3">
                    {employee.profilePhotoUrl ? (
                      <img
                        src={employee.profilePhotoUrl}
                        alt={employee.firstName}
                        className="w-12 h-12 rounded-[8px] object-cover border-2 border-white/60 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-[8px] bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-medium text-base flex items-center justify-center shadow-xs">
                        {getInitials()}
                      </div>
                    )}
                    <div className="truncate">
                      <h4 className="font-medium text-sm leading-tight text-white truncate">
                        {employee.firstName} {employee.lastName}
                      </h4>
                      <p className="text-xs text-blue-200 truncate mt-0.5">
                        {employee.employeeRole || employee.department || "Employee"}
                      </p>
                      {employee.employeeId && (
                        <span className="inline-block mt-1 bg-white/20 px-2 py-0.5 rounded-[8px] text-[10px] font-mono tracking-wider">
                          {employee.employeeId}
                        </span>
                      )}
                    </div>
                  </div>

                  {employee.email && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/15 text-xs text-blue-100 truncate">
                      {employee.email}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Navigation Links (Existing Pages Only) */}
              <div className="p-3 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-[#0052cc]" />
                    <span>My Space (Home)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/timesheet");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/timesheet"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-[#0052cc]" />
                    <span>Timesheet</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/payroll");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/payroll"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-4 h-4 text-[#0052cc]" />
                    <span>Payroll & Payslips</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/projects");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/projects"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Briefcase className="w-4 h-4 text-[#0052cc]" />
                    <span>Project Allocations</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/leaves");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/leaves"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-[#0052cc]" />
                    <span>Leaves Management</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/wfh");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/wfh"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileBarChart className="w-4 h-4 text-[#0052cc]" />
                    <span>Work From Home</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDrawer(false);
                    router.push("/profile");
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    pathname === "/profile"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <User className="w-4 h-4 text-[#0052cc]" />
                    <span>My Profile & KYC</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Logout Option at bottom */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={() => {
                  setShowProfileDrawer(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-[8px] transition-colors border border-rose-200/60 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal (Max 8px border radius) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-100 p-5 text-center animate-in zoom-in-95">
            <div className="w-11 h-11 rounded-[8px] bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-slate-900">Log out of Gamanext?</h3>
            <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
              Are you sure you want to end your current session and log out?
            </p>
            <div className="flex items-center space-x-2.5 justify-center">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                  router.replace("/login");
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-[8px] transition-colors shadow-2xs cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
