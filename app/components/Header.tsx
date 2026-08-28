"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import {
  Menu,
  Bell,
  X,
  CheckCircle,
  Sparkles,
  LogOut,
  Clock,
  FileBarChart,
  Briefcase,
  User,
  ChevronRight,
} from "lucide-react";
import { NavTab } from "./BottomNav";

interface HeaderProps {
  onNavigateTab?: (tab: NavTab) => void;
  activeTab?: NavTab;
}

export default function Header({ onNavigateTab, activeTab }: HeaderProps) {
  const { employee, logout } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getInitials = () => {
    if (!employee) return "EMP";
    const f = employee.firstName ? employee.firstName[0].toUpperCase() : "";
    const l = employee.lastName ? employee.lastName[0].toUpperCase() : "";
    return f + l || employee.username?.substring(0, 2).toUpperCase() || "GN";
  };

  const handleNav = (tab: NavTab) => {
    if (onNavigateTab) onNavigateTab(tab);
    setShowDrawer(false);
  };

  return (
    <>
      <header className="bg-white text-slate-800 h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-100/90 shadow-xs sticky top-0 z-40">
        {/* Left: Hamburger Menu Icon */}
        <button
          type="button"
          onClick={() => setShowDrawer(true)}
          className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Center: Gamanext Official Logo */}
        <div
          onClick={() => handleNav("timesheet")}
          className="cursor-pointer flex items-center justify-center transition-transform hover:scale-[1.02]"
        >
          <Image
            src="/gama-next-logo-reserved.png"
            alt="Gamanext Software Solutions"
            width={150}
            height={36}
            className="h-8 md:h-9 w-auto object-contain"
            priority
          />
        </div>

        {/* Right: Notification Bell Icon */}
        <button
          type="button"
          onClick={() => setShowNotifications(true)}
          aria-label="View notifications"
          className="relative p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-[8px] ring-2 ring-white" />
        </button>
      </header>

      {/* Slide-out Sidebar Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setShowDrawer(false)}
          />

          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center space-x-2">
                  <Image
                    src="/gama-next-logo-reserved.png"
                    alt="Gamanext"
                    width={120}
                    height={30}
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Employee Quick Profile Card */}
              {employee && (
                <div className="p-4 mx-4 mt-4 bg-gradient-to-r from-[#003680] to-[#0B4FBA] rounded-[8px] text-white shadow-md">
                  <div className="flex items-center space-x-3">
                    {employee.profilePhotoUrl ? (
                      <img
                        src={employee.profilePhotoUrl}
                        alt={employee.firstName}
                        className="w-11 h-11 rounded-[8px] object-cover border-2 border-white/40 shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-[8px] bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {getInitials()}
                      </div>
                    )}
                    <div className="truncate">
                      <h4 className="font-bold text-sm leading-tight text-white truncate">
                        {employee.firstName} {employee.lastName}
                      </h4>
                      <p className="text-xs text-blue-200 truncate mt-0.5">
                        {employee.employeeRole || employee.department || "Employee"}
                      </p>
                      {employee.employeeId && (
                        <span className="inline-block mt-1 bg-white/20 px-2 py-0.5 rounded-[8px] text-[10px] font-mono">
                          {employee.employeeId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-4 space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav("timesheet")}
                  className={`w-full flex items-center justify-between p-3 rounded-[8px] text-xs font-bold transition-all ${
                    activeTab === "timesheet"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4.5 h-4.5 text-[#0B4FBA]" />
                    <span>Timesheet</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav("reports")}
                  className={`w-full flex items-center justify-between p-3 rounded-[8px] text-xs font-bold transition-all ${
                    activeTab === "reports"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileBarChart className="w-4.5 h-4.5 text-[#0B4FBA]" />
                    <span>Reports (Leaves & WFH)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav("projects")}
                  className={`w-full flex items-center justify-between p-3 rounded-[8px] text-xs font-bold transition-all ${
                    activeTab === "projects"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-4.5 h-4.5 text-[#0B4FBA]" />
                    <span>Project Allocations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav("profile")}
                  className={`w-full flex items-center justify-between p-3 rounded-[8px] text-xs font-bold transition-all ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-[#0B4FBA]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-4.5 h-4.5 text-[#0B4FBA]" />
                    <span>My Profile & KYC</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setShowDrawer(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-[8px] transition-colors border border-rose-200/60 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden">
            <div className="bg-[#0052cc] p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm tracking-wide">Notifications & Alerts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="text-blue-100 hover:text-white p-1 rounded-[8px] hover:bg-blue-800/50"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-[8px] flex items-start space-x-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#0052cc] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Daily Timesheet Active</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Remember to mark your daily project hours and tasks before the end of the day.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Today</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-[8px] flex items-start space-x-3">
                <div className="w-8 h-8 rounded-[8px] bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Gamanext Employee App</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    View your project allocations, submit timesheets, track leaves & WFH anytime.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">System</span>
                </div>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="px-4 py-2 bg-[#0052cc] text-white text-xs font-bold rounded-[8px] hover:bg-[#003680] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-[8px] bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Log out of Gamanext?</h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Are you sure you want to log out of your employee portal?
            </p>
            <div className="flex items-center space-x-3 justify-center">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-[8px] transition-colors shadow-sm"
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
