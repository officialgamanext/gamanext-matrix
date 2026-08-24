"use client";

import { useState, useEffect } from "react";
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
        const [projList, tsList, salaryData, leavesData, wfhData, holidaysData] = await Promise.all([
          getProjectsForEmployee(empKey),
          getTimesheetsForEmployee(empKey),
          getSalaryStructureForEmployee(empKey, employee),
          getLeavesForEmployee(empKey),
          getWFHForEmployee(empKey),
          getHolidaysFromStorage(),
        ]);
        setLeaves(leavesData);
        setWfhList(wfhData);
        setHolidays(holidaysData);
        let savedP = await getSavedPayslipsForEmployee(empKey);
        if (savedP.length === 0 && employee) {
          const initialAug = buildPayslipForMonth(employee, salaryData, 2026, 7, tsList, leavesData, wfhData, holidaysData);
          const savedAug = await saveGeneratedPayslip(initialAug);
          savedP = [savedAug];
        }
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
      : "168:30";

  const daysLoggedCount = timesheets.length > 0 ? timesheets.length : 22;
  const projectsCount = projects.length > 0 ? projects.length : 5;

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
    if (!employee) return "JD";
    const f = employee.firstName ? employee.firstName[0].toUpperCase() : "J";
    const l = employee.lastName ? employee.lastName[0].toUpperCase() : "D";
    return f + l;
  };

  const fullName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "John Doe";
  const employeeRole = employee?.employeeRole || "UI/UX Designer";
  const employeeEmail = employee?.email || "john.doe@gamanext.com";
  const employeeId = employee?.employeeId || "GNX-1025";
  const mobileNumber = employee?.mobileNumber || "+91 98765 43210";
  const dateOfJoining = employee?.dateOfJoining || "15 Jan 2024";
  const locationDisplay = employee?.city
    ? `${employee.city}, ${employee.pincode ? `(${employee.pincode})` : "India"}`
    : "Hyderabad, India";

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
            <span className="font-semibold text-slate-900">{employee?.department || "Technology"}</span>
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
              {employee?.bankName || "State Bank of India"} ({employee?.bankAccountNumber || "•••• 9821"})
            </span>
          </div>

          {/* IFSC Code */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">IFSC Code</span>
            <span className="font-mono font-bold text-slate-800">
              {employee?.bankIfscCode || "SBIN0001234"}
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
          <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Receipt className="w-4.5 h-4.5 text-[#0052cc]" />
                <span>My Payslips ({monthlyPayslips.length})</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[8px] border border-emerald-100">
                Auto-Generated
              </span>
            </div>

            {monthlyPayslips.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No payslips available yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthlyPayslips.map((payslip) => (
                  <div
                    key={payslip.id}
                    className="flex items-center justify-between p-3 bg-slate-50/80 rounded-[8px] border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Receipt className="w-3.5 h-3.5 text-[#0052cc]" />
                        <span className="font-bold text-xs text-slate-900">{payslip.month}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 font-mono pl-5 block">
                        ₹ {payslip.netPay.toLocaleString("en-IN")} Net Salary to Credit
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewPayslip(payslip)}
                        className="px-2.5 py-1 text-xs font-bold text-[#0052cc] bg-blue-50 hover:bg-blue-100 rounded-[6px] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPayslip(payslip);
                          setTimeout(() => window.print(), 200);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    
      {/* PRINTABLE PAYSLIP MODAL FOR EMPLOYEE APP */}
      {previewPayslip && employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 my-6">
            {/* Top Modal Controls */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Receipt className="w-4 h-4 text-[#0052cc]" />
                <span>Salary Payslip - {previewPayslip.month}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#0052cc] hover:bg-[#003882] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPayslip(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-6 md:p-8 space-y-5 bg-white text-slate-900 text-xs" id="printable-payslip">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#0052cc] pb-4">
                <div className="space-y-1.5">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/gama-next-logo-reserved.png"
                      alt="GAMANEXT"
                      className="h-11 w-auto object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    <span className="font-semibold text-slate-900">Branch:</span> Gamaone &nbsp;|&nbsp; <span className="font-semibold text-slate-900">GSTIN:</span> 36AAGCG7123A1Z8
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-base font-black text-slate-900 uppercase tracking-tight">
                    Salary Payslip
                  </div>
                  <div className="text-xs font-bold text-[#0052cc] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                    {previewPayslip.month}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Pay Date: {previewPayslip.paymentDate}
                  </p>
                </div>
              </div>

              {/* Employee Summary 2-Column */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Employee ID:</span>
                    <span className="font-mono font-bold text-slate-900">{employee.employeeId}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Name:</span>
                    <span className="font-bold text-slate-900">{employee.firstName} {employee.lastName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Designation:</span>
                    <span className="text-slate-800">{employee.employeeRole}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Department:</span>
                    <span className="text-slate-800">{employee.department || "Technology"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Branch:</span>
                    <span className="font-bold text-slate-900">Gamaone</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Date of Joining:</span>
                    <span className="text-slate-800">{employee.dateOfJoining || "—"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Bank Name:</span>
                    <span className="text-slate-800">{employee.bankName || "State Bank of India"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">A/C No:</span>
                    <span className="font-mono font-bold text-slate-900">{employee.bankAccountNumber || "•••• 9821"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">IFSC:</span>
                    <span className="font-mono text-slate-800">{employee.bankIfscCode || "SBIN0001234"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">PAN Number:</span>
                    <span className="font-mono text-slate-800">{employee.panCardNumber || "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">Paid Days:</span>
                    <span className="font-bold text-slate-900">{previewPayslip.paidDays} / {previewPayslip.workingDays} Days</span>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown (Black text only) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 divide-x divide-slate-200">
                  <div>
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                      <span>Earnings & Allowances</span>
                      <span>Amount (₹)</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {previewPayslip.earnings.map((e) => (
                        <div key={e.id} className="p-2 flex justify-between text-slate-700">
                          <span>{e.name}</span>
                          <span className="font-mono font-semibold text-slate-900">₹ {Number(e.amount).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                      <span>Deductions</span>
                      <span>Amount (₹)</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {previewPayslip.deductions.map((d) => (
                        <div key={d.id} className="p-2 flex justify-between text-slate-700">
                          <span>{d.name}</span>
                          <span className="font-mono font-semibold text-slate-900">₹ {Number(d.amount).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50 border-t border-slate-200 font-bold p-2">
                  <div className="flex justify-between text-slate-900">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono">₹ {previewPayslip.grossSalary.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-900">
                    <span>Total Deductions</span>
                    <span className="font-mono">- ₹ {previewPayslip.totalDeductions.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900 uppercase">Net Salary to Credit:</span>
                  <span className="text-lg font-black text-[#0052cc] font-mono">
                    ₹ {previewPayslip.netPay.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  In Words: <strong className="text-slate-900">{amountInWords(previewPayslip.netPay)}</strong>
                </div>
              </div>

              {/* Clean Footer Note */}
              <div className="text-[10px] text-slate-400 text-center pt-3 border-t border-slate-100">
                This is a system-generated electronic payslip issued by Gamanext Technologies Pvt. Ltd. and requires no signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
