"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { getEmployeesFromStorage, EmployeeData } from "@/lib/firebase";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

export default function LoginView() {
  const { login } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeData[]>([]);

  useEffect(() => {
    async function loadQuickList() {
      try {
        const list = await getEmployeesFromStorage();
        setAvailableEmployees(list);
      } catch (e) {}
    }
    loadQuickList();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim()) {
      setErrorMsg("Please enter your work email or username.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const result = await login(emailOrUser, password);

    if (!result.success) {
      setErrorMsg(result.error || "Invalid credentials. Please verify and try again.");
    }
    setLoading(false);
  };

  const handleQuickFill = (emp: EmployeeData) => {
    setEmailOrUser(emp.email || emp.username || emp.employeeId);
    setPassword(emp.password || "");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-[8px] shadow-lg border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Graphic */}
        <div className="bg-gradient-to-r from-[#003680] via-[#0B4FBA] to-[#0A47A4] px-8 pt-8 pb-7 text-white text-center">
          <div className="inline-block bg-white px-4 py-2 rounded-[8px] shadow-sm mb-3">
            <Image
              src="/gama-next-logo-reserved.png"
              alt="GamaNext Software Solutions"
              width={160}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-blue-950/60 border border-blue-400/30 text-blue-100 text-xs px-3 py-1 rounded-[8px] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Employee Portal</span>
          </div>
          <p className="text-xs text-blue-100/90 mt-2">
            Sign in to access your timesheets, reports & profile
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Work Email or Username
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="name@gamanext.com or username"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052cc] text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052cc] text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded-[8px]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-[8px] shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {availableEmployees.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold mb-2">
                <Users className="w-3.5 h-3.5 text-[#0052cc]" />
                <span>Quick Fill Registered Employee:</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {availableEmployees.slice(0, 5).map((emp) => (
                  <button
                    key={emp.id || emp.employeeId}
                    type="button"
                    onClick={() => handleQuickFill(emp)}
                    className="w-full text-left p-2 rounded-[8px] bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800 truncate">
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-[#0052cc] bg-white px-2 py-0.5 rounded-[8px] border border-slate-200 shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center space-x-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Persistent login until explicit logout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
