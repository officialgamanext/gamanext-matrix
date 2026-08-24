"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import {
  getProjectsForEmployee,
  getRequestsForEmployee,
  saveRequestForEmployee,
  getYearlyReviewsForEmployee,
  getPerformanceBandsForEmployee,
  updateEmployeeInStorage,
  EmployeeData,
  ProjectAllocation,
  EmployeeRequest,
  YearlyReview,
  PerformanceBandRecord,
} from "@/lib/firebase";
import CustomDropdown from "./CustomDropdown";
import {
  User,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  FolderKanban,
  Receipt,
  Award,
  DollarSign,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Lock,
  MapPin,
  Eye,
  Mail,
  Star,
  Check,
} from "lucide-react";

type ProfileSubTab =
  | "overview"
  | "kyc"
  | "bank"
  | "emergency"
  | "projects"
  | "requests"
  | "performance"
  | "salary"
  | "edit";

export default function ProfileView() {
  const { employee, updateCurrentEmployee } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>("overview");

  const [projects, setProjects] = useState<ProjectAllocation[]>([]);
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [reviews, setReviews] = useState<YearlyReview[]>([]);
  const [bands, setBands] = useState<PerformanceBandRecord[]>([]);

  // Request Form State
  const [reqType, setReqType] = useState<
    "Accessories Allowance" | "Monthly Network/WiFi Bill Reimbursement"
  >("Monthly Network/WiFi Bill Reimbursement");
  const [reqAmount, setReqAmount] = useState("1000");
  const [reqDesc, setReqDesc] = useState("");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqSuccessMsg, setReqSuccessMsg] = useState("");
  const [reqErrorMsg, setReqErrorMsg] = useState("");

  // Edit Profile Form State
  const [editData, setEditData] = useState<Partial<EmployeeData>>({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // KYC Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setEditData({ ...employee });
      try {
        const [projList, reqList, revList, bandList] = await Promise.all([
          getProjectsForEmployee(empKey),
          getRequestsForEmployee(empKey),
          getYearlyReviewsForEmployee(empKey),
          getPerformanceBandsForEmployee(empKey),
        ]);

        setProjects(projList);
        setRequests(reqList);
        setReviews(revList);
        setBands(bandList);
      } catch (err) {
        console.error("Profile dataset load error:", err);
      }
    }
    loadData();
  }, [employee]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    if (!reqDesc.trim()) {
      setReqErrorMsg("Please enter description / month for the claim.");
      return;
    }

    setSubmittingReq(true);
    setReqErrorMsg("");
    setReqSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;
      const newReq: EmployeeRequest = {
        employeeId: empKey,
        requestType: reqType,
        amount: Number(reqAmount) || 1000,
        monthOrDescription: reqDesc.trim(),
        status: "Pending",
      };

      const saved = await saveRequestForEmployee(newReq);
      setRequests((prev) => [saved, ...prev]);
      setReqDesc("");
      setReqSuccessMsg("Reimbursement claim submitted successfully!");
      setTimeout(() => setReqSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Save request error:", err);
      setReqErrorMsg(err.message || "Failed to submit request.");
    } finally {
      setSubmittingReq(false);
    }
  };

  const handleSaveProfileUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (newPassword && newPassword !== confirmPassword) {
      setProfileErrorMsg("New password and confirm password do not match.");
      return;
    }

    setSavingProfile(true);
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    try {
      const empKey = employee.id || employee.employeeId;
      const updatePayload: Partial<EmployeeData> = {
        mobileNumber: editData.mobileNumber || employee.mobileNumber,
        address: editData.address || employee.address,
        city: editData.city || employee.city,
        pincode: editData.pincode || employee.pincode,
        bankName: editData.bankName || employee.bankName,
        bankAccountNumber: editData.bankAccountNumber || employee.bankAccountNumber,
        bankIfscCode: editData.bankIfscCode || employee.bankIfscCode,
        emergencyContact1: editData.emergencyContact1 || employee.emergencyContact1,
        emergencyContact2: editData.emergencyContact2 || employee.emergencyContact2,
      };

      if (newPassword.trim()) {
        updatePayload.password = newPassword.trim();
      }

      await updateEmployeeInStorage(empKey, updatePayload);
      updateCurrentEmployee(updatePayload);
      setNewPassword("");
      setConfirmPassword("");
      setProfileSuccessMsg("Profile information updated successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Update profile error:", err);
      setProfileErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = () => {
    if (!employee) return "GN";
    const f = employee.firstName ? employee.firstName[0].toUpperCase() : "";
    const l = employee.lastName ? employee.lastName[0].toUpperCase() : "";
    return f + l || "GN";
  };

  const subTabs = [
    { id: "overview" as ProfileSubTab, label: "Overview", icon: User },
    { id: "kyc" as ProfileSubTab, label: "KYC Docs", icon: ShieldCheck },
    { id: "bank" as ProfileSubTab, label: "Bank Info", icon: CreditCard },
    { id: "emergency" as ProfileSubTab, label: "Emergency", icon: PhoneCall },
    { id: "projects" as ProfileSubTab, label: "Projects", icon: FolderKanban },
    { id: "requests" as ProfileSubTab, label: "Reimbursements", icon: Receipt },
    { id: "performance" as ProfileSubTab, label: "Performance", icon: Award },
    { id: "salary" as ProfileSubTab, label: "Compensation", icon: DollarSign },
    { id: "edit" as ProfileSubTab, label: "Settings", icon: Edit3 },
  ];

  return (
    <div className="space-y-5 pb-28 max-w-md md:max-w-lg mx-auto px-4 pt-4 animate-in fade-in">
      {/* 1. Profile Hero Card */}
      <div className="bg-white rounded-[8px] border border-slate-100 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#003680] via-[#0B4FBA] to-[#0A47A4] p-5 text-white">
          <div className="flex items-center space-x-3.5">
            {employee?.profilePhotoUrl ? (
              <img
                src={employee.profilePhotoUrl}
                alt={employee.firstName}
                className="w-14 h-14 rounded-[8px] object-cover border-2 border-white/60 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-[8px] bg-gradient-to-tr from-amber-500 to-pink-500 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white/60 shadow-xs">
                {getInitials()}
              </div>
            )}

            <div className="space-y-0.5 truncate">
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-white truncate">
                  {employee?.firstName} {employee?.lastName}
                </h1>
                <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-[8px]">
                  {employee?.employeeId || "GNA-001"}
                </span>
              </div>
              <p className="text-xs text-blue-100 truncate">
                {employee?.employeeRole || "Software Engineer"} • {employee?.department || "Technology"}
              </p>
              <p className="text-[11px] text-blue-200 truncate font-mono">
                {employee?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Sub-Tabs Bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-2 py-1.5 overflow-x-auto scrollbar-none flex items-center space-x-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-[8px] text-[11px] font-bold transition-all flex items-center space-x-1 shrink-0 select-none cursor-pointer ${
                  isCurrent
                    ? "bg-[#0052cc] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Sub-Tab Content Views */}
        <div className="p-5">
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === "overview" && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Employee ID
                  </span>
                  <span className="font-bold font-mono text-slate-800 mt-0.5 block">
                    {employee?.employeeId || "—"}
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Role / Position
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {employee?.employeeRole || "—"}
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Department
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {employee?.department || "—"}
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Joining Date
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {employee?.dateOfJoining || "—"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Residential Address
                </span>
                <span className="font-semibold text-slate-800 block">
                  {employee?.address || "Address not specified"}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {employee?.city || "—"} {employee?.pincode ? `- ${employee.pincode}` : ""}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: KYC & DOCUMENTS */}
          {activeSubTab === "kyc" && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Aadhar Card
                  </span>
                  <span className="font-bold font-mono text-slate-900 mt-0.5 block">
                    {employee?.aadharNumber || "Not Set"}
                  </span>
                </div>

                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    PAN Card
                  </span>
                  <span className="font-bold font-mono text-slate-900 mt-0.5 block uppercase">
                    {employee?.panCardNumber || "Not Set"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 block">Aadhar Front</span>
                  {employee?.aadharFrontUrl ? (
                    <div
                      onClick={() => {
                        setPreviewImageUrl(employee.aadharFrontUrl);
                        setPreviewImageTitle("Aadhar Front");
                      }}
                      className="cursor-pointer overflow-hidden rounded-[8px] border border-slate-200 h-24 bg-white flex items-center justify-center"
                    >
                      <img src={employee.aadharFrontUrl} alt="Aadhar Front" className="h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 bg-slate-100 rounded-[8px] flex items-center justify-center text-slate-400 text-[11px]">
                      Not Uploaded
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-800 block">PAN Card</span>
                  {employee?.panCardUrl ? (
                    <div
                      onClick={() => {
                        setPreviewImageUrl(employee.panCardUrl);
                        setPreviewImageTitle("PAN Card");
                      }}
                      className="cursor-pointer overflow-hidden rounded-[8px] border border-slate-200 h-24 bg-white flex items-center justify-center"
                    >
                      <img src={employee.panCardUrl} alt="PAN Card" className="h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 bg-slate-100 rounded-[8px] flex items-center justify-center text-slate-400 text-[11px]">
                      Not Uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANK INFO */}
          {activeSubTab === "bank" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-[8px] bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                    Salary Account
                  </span>
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div className="text-sm font-bold">{employee?.bankName || "State Bank of India"}</div>
                <div className="font-mono font-bold tracking-widest text-base">
                  {employee?.bankAccountNumber || "•••• •••• •••• 9821"}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div>
                    <span className="text-blue-300 block text-[9px]">IFSC CODE</span>
                    <span className="font-mono font-bold">{employee?.bankIfscCode || "SBIN0001234"}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-[8px] text-[10px] font-semibold">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY */}
          {activeSubTab === "emergency" && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="font-bold text-slate-900">Primary Contact</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-[8px]">
                    {employee?.emergencyContact1?.relation || "Relation"}
                  </span>
                </div>
                <div className="pt-1 space-y-0.5">
                  <span className="font-bold text-slate-800 block">
                    {employee?.emergencyContact1?.name || "Not Configured"}
                  </span>
                  <span className="font-mono text-slate-600 block">
                    {employee?.emergencyContact1?.mobileNumber || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS (VIEW ONLY) */}
          {activeSubTab === "projects" && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Assigned Project History</span>
                <span className="text-[10px] bg-blue-50 text-[#0052cc] px-2 py-0.5 rounded-[8px] font-bold">
                  View-Only
                </span>
              </div>
              <div className="space-y-2.5">
                {projects.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-[8px] text-center text-slate-400 text-xs">
                    No project allocations currently assigned.
                  </div>
                ) : (
                  projects.map((p, idx) => {
                    const isActive = p.status === "Active";
                    return (
                      <div
                        key={p.id || idx}
                        className={`p-3.5 rounded-[8px] bg-slate-50 border space-y-1.5 ${
                          isActive ? "border-blue-300 bg-blue-50/20" : "border-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{p.projectName}</span>
                            <span className="text-[11px] text-slate-500 font-medium">Role: {p.role || "Developer"}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-[8px] border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isActive ? "● Active" : "Completed / Inactive"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded-[8px] border border-slate-100 flex items-center justify-between">
                          <span>From: {p.startDate || "2026-01-01"}</span>
                          <span>To: {p.endDate || "Ongoing / Active"}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: REIMBURSEMENTS */}
          {activeSubTab === "requests" && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <form onSubmit={handleCreateRequest} className="p-3.5 bg-slate-50 rounded-[8px] border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-900 block">Submit Allowance Claim</span>

                {reqSuccessMsg && (
                  <div className="p-2 rounded-[8px] bg-emerald-50 text-emerald-800 text-[11px]">
                    {reqSuccessMsg}
                  </div>
                )}
                {reqErrorMsg && (
                  <div className="p-2 rounded-[8px] bg-rose-50 text-rose-800 text-[11px]">
                    {reqErrorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Category</label>
                  <CustomDropdown
                    options={[
                      "Monthly Network/WiFi Bill Reimbursement",
                      "Accessories Allowance",
                    ]}
                    value={reqType}
                    onChange={(v) => setReqType(v as any)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 block">Amount (₹)</label>
                    <input
                      type="number"
                      value={reqAmount}
                      onChange={(e) => setReqAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-[8px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 block">Month / Desc</label>
                    <input
                      type="text"
                      value={reqDesc}
                      onChange={(e) => setReqDesc(e.target.value)}
                      placeholder="e.g. May 2026"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-[8px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingReq}
                  className="w-full py-2 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-[8px] transition-all"
                >
                  {submittingReq ? "Submitting..." : "Submit Claim"}
                </button>
              </form>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 block text-[11px]">Recent Claims</span>
                {requests.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="p-2.5 bg-slate-50 rounded-[8px] border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{r.requestType}</span>
                      <span className="text-[11px] text-slate-500">₹{r.amount} • {r.monthOrDescription}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-[8px] bg-amber-50 text-amber-700 border border-amber-200">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PERFORMANCE */}
          {activeSubTab === "performance" && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <span className="font-bold text-slate-900 block">Performance Bands & Feedback</span>
              {bands.length === 0 && reviews.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-[8px] text-center text-slate-400 text-xs">
                  No performance records published yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {bands.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="p-3 bg-purple-50/70 rounded-[8px] border border-purple-100 flex items-center justify-between"
                    >
                      <span className="font-bold text-purple-950">Year {b.year}</span>
                      <span className="bg-purple-600 text-white font-bold px-2 py-0.5 rounded-[8px] text-xs">
                        {b.band}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SALARY */}
          {activeSubTab === "salary" && (
            <div className="space-y-3 animate-in fade-in text-xs">
              <div className="p-4 rounded-[8px] bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold">Compensation Summary</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-[8px]">
                    Direct Deposit
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-slate-800 rounded-[8px]">
                    <span className="text-[9px] text-slate-400 uppercase block">Basic Pay</span>
                    <span className="font-bold text-sm">₹45,000</span>
                  </div>
                  <div className="p-2 bg-blue-950 rounded-[8px] border border-blue-500/40">
                    <span className="text-[9px] text-blue-300 uppercase block">Net Monthly</span>
                    <span className="font-bold text-sm text-amber-300">₹85,500</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS & EDIT */}
          {activeSubTab === "edit" && (
            <form onSubmit={handleSaveProfileUpdates} className="space-y-3 animate-in fade-in text-xs">
              {profileSuccessMsg && (
                <div className="p-2.5 rounded-[8px] bg-emerald-50 text-emerald-800 text-[11px]">
                  {profileSuccessMsg}
                </div>
              )}
              {profileErrorMsg && (
                <div className="p-2.5 rounded-[8px] bg-rose-50 text-rose-800 text-[11px]">
                  {profileErrorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Mobile Number</label>
                <input
                  type="text"
                  value={editData.mobileNumber || ""}
                  onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[8px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Address</label>
                <input
                  type="text"
                  value={editData.address || ""}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[8px]"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-slate-700 block">Change Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[8px]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-[8px] transition-all"
              >
                {savingProfile ? "Saving..." : "Save Profile Changes"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* KYC Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-3 flex items-center justify-between">
              <span className="text-xs font-bold">{previewImageTitle}</span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                Close
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewImageUrl}
                alt={previewImageTitle}
                className="max-h-96 w-auto object-contain rounded-[8px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
