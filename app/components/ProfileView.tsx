"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  getProjectsForEmployee,
  getSalaryStructureForEmployee,
  getSavedPayslipsForEmployee,
  buildPayslipForMonth,
  saveGeneratedPayslip,
  generateMonthlyPayslips,
  amountInWords,
  EmployeeSalaryStructure,
  MonthlyPayslip,
  getTimesheetsForEmployee,
  getLeavesForEmployee,
  getWFHForEmployee,
  getHolidaysFromStorage,
  LeaveRequest,
  WFHRequest,
  HolidayItem,
  updateEmployeeInStorage,
  EmployeeData,
  ProjectAllocation,
  TimesheetEntry,
} from "@/lib/firebase";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  CreditCard,
  Clock,
  CalendarCheck,
  FolderKanban,
  Settings,
  Lock,
  Bell,
  FileText,
  LogOut,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  Eye,
  DollarSign,
} from "lucide-react";

export default function ProfileView() {
  const { employee, logout, updateCurrentEmployee } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectAllocation[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [wfhList, setWfhList] = useState<WFHRequest[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [salaryStructure, setSalaryStructure] = useState<EmployeeSalaryStructure | null>(null);
  const [savedPayslips, setSavedPayslips] = useState<MonthlyPayslip[]>([]);
  const [previewPayslip, setPreviewPayslip] = useState<MonthlyPayslip | null>(null);
  const [loading, setLoading] = useState(true);

  // Change Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  // Generic Policy / Terms Modal
  const [policyModalType, setPolicyModalType] = useState<"privacy" | "terms" | "notifications" | null>(null);

  // Logout Confirm Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadProfileMetrics() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const [projList, tsList, salaryData, leavesData, wfhData, holidaysData, savedP] = await Promise.all([
          getProjectsForEmployee(empKey),
          getTimesheetsForEmployee(empKey),
          getSalaryStructureForEmployee(empKey, employee),
          getLeavesForEmployee(empKey),
          getWFHForEmployee(empKey),
          getHolidaysFromStorage(),
          getSavedPayslipsForEmployee(empKey),
        ]);
        setLeaves(leavesData);
        setWfhList(wfhData);
        setHolidays(holidaysData);
        setSavedPayslips(savedP);
        setProjects(projList);
        setTimesheets(tsList);
        setSalaryStructure(salaryData);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileMetrics();
  }, [employee]);

  // Calculate stats
  const totalHoursNum = timesheets.reduce(
    (acc, curr) => acc + (Number(curr.billingHours) || 0),
    0
  );
  const totalHoursDisplay =
    totalHoursNum > 0
      ? `${Math.floor(totalHoursNum)}:${Math.round((totalHoursNum % 1) * 60)
          .toString()
          .padStart(2, "0")}`
      : "0:00";

  const daysLoggedCount = timesheets.length;
  const projectsCount = projects.length;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!newPassword.trim()) {
      setPasswordErrorMsg("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordErrorMsg("");
    setPasswordSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;
      await updateEmployeeInStorage(empKey, { password: newPassword.trim() });
      updateCurrentEmployee({ password: newPassword.trim() });
      setPasswordSuccessMsg("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccessMsg("");
        setIsPasswordModalOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error("Password change error:", err);
      setPasswordErrorMsg(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = () => {
    if (!employee) return "EMP";
    const f = employee.firstName ? employee.firstName[0].toUpperCase() : "";
    const l = employee.lastName ? employee.lastName[0].toUpperCase() : "";
    return (f + l) || "E";
  };

  const fullName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "—";
  const employeeRole = employee?.employeeRole || "—";
  const employeeEmail = employee?.email || "—";
  const employeeId = employee?.employeeId || "—";
  const mobileNumber = employee?.mobileNumber || "—";
  const dateOfJoining = employee?.dateOfJoining || "—";
  const locationDisplay = employee?.city
    ? `${employee.city}${employee.pincode ? ` (${employee.pincode})` : ""}`
    : "—";

  return (
    <div className="max-w-md md:max-w-lg mx-auto pb-28 px-4 pt-3 space-y-4 animate-in fade-in">
      {/* 1. Header Profile Banner matching reference image */}
      <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-r from-[#003680] via-[#0B4FBA] to-[#0A47A4] text-white p-6 shadow-sm">
        {/* Background ambient light */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-3 relative z-10">
          {/* Avatar Container */}
          <div className="relative">
            {employee?.profilePhotoUrl ? (
              <img
                src={employee.profilePhotoUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-3 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 text-white font-extrabold text-3xl flex items-center justify-center border-3 border-white shadow-md">
                {getInitials()}
              </div>
            )}
          </div>

          {/* Name & Role */}
          <div className="space-y-0.5">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{fullName}</h1>
            <p className="text-xs text-blue-100 font-medium">{employeeRole}</p>
          </div>

          {/* Email Badge Pill */}
          <div className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-xs border border-white/20 px-3.5 py-1 rounded-full text-xs text-white">
            <Mail className="w-3.5 h-3.5 text-blue-200" />
            <span className="font-medium">{employeeEmail}</span>
          </div>
        </div>
      </div>

      {/* Profile Page Navigation Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-[8px] text-xs font-semibold">
        <button
          type="button"
          className="py-2 px-3 bg-white text-[#0052cc] rounded-[6px] shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer font-bold"
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Info</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/payroll")}
          className="py-2 px-3 text-slate-600 hover:text-slate-900 rounded-[6px] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer hover:bg-white/60"
        >
          <DollarSign className="w-3.5 h-3.5 text-[#0052cc]" />
          <span>Payroll & Payslips</span>
        </button>
      </div>

      {/* 2. Personal Information Card (View Only) */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <User className="w-4.5 h-4.5 text-[#0052cc]" />
            <span>Personal Information</span>
          </div>

          <span className="text-[10px] font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded-[8px] border border-blue-100">
            View Only
          </span>
        </div>

        {/* Info Rows */}
        <div className="space-y-3.5 text-xs">
          {/* Employee ID */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-500">
              <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-600">Employee ID</span>
            </div>
            <span className="font-bold text-slate-900 font-mono">{employeeId}</span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-500">
              <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-600">Email</span>
            </div>
            <span className="font-semibold text-slate-900 truncate max-w-[180px]">
              {employeeEmail}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-500">
              <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-600">Phone</span>
            </div>
            <span className="font-semibold text-slate-900 font-mono">{mobileNumber}</span>
          </div>

          {/* Date of Joining */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-500">
              <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-600">Date of Joining</span>
            </div>
            <span className="font-semibold text-slate-900">{dateOfJoining}</span>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-slate-500">
              <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-600">Location</span>
            </div>
            <span className="font-semibold text-slate-900">{locationDisplay}</span>
          </div>

          {/* Department */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-50">
            <div className="flex items-center space-x-2.5 text-slate-500">
              <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-600">Department</span>
            </div>
            <span className="font-semibold text-slate-900">{employee?.department || "—"}</span>
          </div>

          {/* Date of Birth */}
          {employee?.dateOfBirth && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-500">
                <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-600">Date of Birth</span>
              </div>
              <span className="font-semibold text-slate-900">{employee.dateOfBirth}</span>
            </div>
          )}

          {/* Residential Address */}
          {employee?.address && (
            <div className="flex items-start justify-between pt-1 border-t border-slate-50">
              <div className="flex items-center space-x-2.5 text-slate-500">
                <div className="w-6 h-6 rounded-[8px] bg-blue-50 text-[#0052cc] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-slate-600">Full Address</span>
              </div>
              <span className="font-medium text-slate-800 text-right max-w-[190px] leading-tight">
                {employee.address}, {employee.city || ""} {employee.pincode ? `- ${employee.pincode}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Banking & Emergency Details Card (View Only) */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <CreditCard className="w-4.5 h-4.5 text-[#0052cc]" />
            <span>Banking & Emergency Details</span>
          </div>

          <span className="text-[10px] font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded-[8px] border border-blue-100">
            View Only
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Bank Account */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Bank Account</span>
            <span className="font-bold text-slate-900">
              {employee?.bankName ? `${employee.bankName} (${employee?.bankAccountNumber || "—"})` : (employee?.bankAccountNumber || "—")}
            </span>
          </div>

          {/* IFSC Code */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">IFSC Code</span>
            <span className="font-mono font-bold text-slate-800">
              {employee?.bankIfscCode || "—"}
            </span>
          </div>

          {/* Emergency Contact */}
          {employee?.emergencyContact1?.name && (
            <div className="flex items-start justify-between pt-1 border-t border-slate-50">
              <span className="text-slate-500 font-medium">Emergency Contact</span>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">
                  {employee.emergencyContact1.name} ({employee.emergencyContact1.relation || "Contact"})
                </span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {employee.emergencyContact1.mobileNumber || "—"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Work Summary Card (3 Stat Columns) */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-3">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
          <TrendingUp className="w-4.5 h-4.5 text-[#0052cc]" />
          <span>Work Summary</span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center pt-1">
          {/* Stat 1: Total Hours */}
          <div className="px-2 space-y-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center mx-auto">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-slate-900 block font-mono">
              {totalHoursDisplay}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-tight">
              Total Hours
            </span>
          </div>

          {/* Stat 2: Days Logged */}
          <div className="px-2 space-y-1">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-slate-900 block font-mono">
              {daysLoggedCount}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-tight">
              Days Logged
            </span>
          </div>

          {/* Stat 3: Projects */}
          <div className="px-2 space-y-1">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-slate-900 block font-mono">
              {projectsCount}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-tight">
              Projects
            </span>
          </div>
        </div>
      </div>


      {/* 4.5. My Payslips Section */}
      {(() => {
        const monthlyPayslips = employee && salaryStructure
          ? generateMonthlyPayslips(employee, salaryStructure, 2026, timesheets, leaves, wfhList, holidays)
          : [];

        return (
          <></>
        );
      })()}

      {/* 5. Account Settings List */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-2">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5 mb-1">
          <Settings className="w-4.5 h-4.5 text-[#0052cc]" />
          <span>Account</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Change Password */}
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full py-3 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <Lock className="w-4 h-4 text-slate-400 group-hover:text-[#0052cc] transition-colors" />
              <span className="font-medium">Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>

          {/* Notification Settings */}
          <button
            type="button"
            onClick={() => setPolicyModalType("notifications")}
            className="w-full py-3 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-4 h-4 text-slate-400 group-hover:text-[#0052cc] transition-colors" />
              <span className="font-medium">Notification Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>

          {/* Privacy Policy */}
          <button
            type="button"
            onClick={() => setPolicyModalType("privacy")}
            className="w-full py-3 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#0052cc] transition-colors" />
              <span className="font-medium">Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>

          {/* Terms & Conditions */}
          <button
            type="button"
            onClick={() => setPolicyModalType("terms")}
            className="w-full py-3 flex items-center justify-between text-slate-700 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#0052cc] transition-colors" />
              <span className="font-medium">Terms & Conditions</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full py-3 flex items-center justify-between text-rose-600 hover:text-rose-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span className="font-bold">Logout</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* App Version Footer */}
      <div className="text-center pt-2 pb-6">
        <span className="text-[11px] font-medium text-slate-400">App Version 1.0.0</span>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0052cc] text-white p-4 flex items-center justify-between">
              <span className="text-sm font-bold">Change Password</span>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-white hover:bg-blue-800/60 p-1 rounded-[8px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-3 text-xs">
              {passwordSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-[8px] border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}
              {passwordErrorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded-[8px] border border-rose-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[8px] text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[8px] text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-[8px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-4 py-2 bg-[#0052cc] hover:bg-[#0041a8] text-white rounded-[8px] font-bold shadow-xs"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications / Privacy Policy / Terms Modal */}
      {policyModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0052cc] text-white p-4 flex items-center justify-between">
              <span className="text-sm font-bold">
                {policyModalType === "privacy" && "Privacy Policy"}
                {policyModalType === "terms" && "Terms & Conditions"}
                {policyModalType === "notifications" && "Notification Preferences"}
              </span>
              <button
                type="button"
                onClick={() => setPolicyModalType(null)}
                className="text-white hover:bg-blue-800/60 p-1 rounded-[8px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-3 max-h-72 overflow-y-auto leading-relaxed">
              {policyModalType === "privacy" && (
                <p>
                  Gamanext Software Solutions Pvt Ltd ensures complete confidentiality of your employee data, personal records, and credentials. All data is encrypted and securely stored.
                </p>
              )}
              {policyModalType === "terms" && (
                <p>
                  By accessing the Gamanext Matrix Portal, employees agree to adhere to company policies, internal compliance standards, accurate daily timesheet reporting, and timely leave submissions.
                </p>
              )}
              {policyModalType === "notifications" && (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-[#0052cc]" />
                    <span>Timesheet reminder alerts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-[#0052cc]" />
                    <span>Leave approval notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-[#0052cc]" />
                    <span>Holiday & company announcements</span>
                  </label>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPolicyModalType(null)}
                className="px-4 py-1.5 bg-[#0052cc] text-white text-xs font-bold rounded-[8px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-2.5 rounded-full bg-rose-50">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Confirm Logout</h3>
                <p className="text-xs text-slate-500">Are you sure you want to sign out?</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[8px] text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[8px] text-xs font-bold transition-colors shadow-xs"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
