"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Download,
  X,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export default function LoginView() {
  const { login, lockedNotice } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [urlLocked, setUrlLocked] = useState(false);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    // Check if redirected with ?locked=1
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("locked") === "1" || params.get("locked") === "true") {
        setUrlLocked(true);
      }
    }

    // Check if running as installed standalone PWA
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true)
    ) {
      setIsInstalled(true);
    }

    // Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPwaPrompt = e;
    };

    if (typeof window !== "undefined") {
      if ((window as any).deferredPwaPrompt) {
        setInstallPrompt((window as any).deferredPwaPrompt);
      }
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("pwa-installable", () => {
        if ((window as any).deferredPwaPrompt) {
          setInstallPrompt((window as any).deferredPwaPrompt);
        }
      });
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = installPrompt || (window as any).deferredPwaPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === "accepted") {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
        (window as any).deferredPwaPrompt = null;
      } catch (err) {
        console.error("PWA install error:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Please enter your username or work email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const result = await login(username.trim(), password);

    if (!result.success) {
      setErrorMsg(result.error || "Invalid username or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-slate-50 flex flex-col justify-between items-center px-4 py-8 relative selection:bg-blue-600 selection:text-white">
      {/* Top Bar with PWA Install Button */}
      <div className="w-full max-w-sm flex justify-end pb-2">
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-[#0052cc] border border-blue-200 rounded-[8px] text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer animate-in fade-in active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col items-center space-y-4 my-auto">
        {/* 1. Brand Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/gama-next-logo-reserved.png"
            alt="Gamanext Software Solutions"
            width={180}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* 2. Circular Graphic Illustration */}
        <div className="relative w-40 h-40 flex items-center justify-center my-1">
          {/* Outer glow circle */}
          <div className="absolute inset-0 bg-blue-100/60 rounded-full blur-xs" />

          {/* Decorative ambient dots */}
          <div className="absolute top-2 left-5 w-2.5 h-2.5 bg-blue-300/60 rounded-full" />
          <div className="absolute top-10 right-4 w-3 h-3 bg-blue-300/50 rounded-full" />
          <div className="absolute bottom-6 left-4 w-2 h-2 bg-blue-400/40 rounded-full" />

          {/* Clock icon badge top-left */}
          <div className="absolute top-3 left-8 w-11 h-11 rounded-full bg-blue-50 border-2 border-white shadow-xs flex items-center justify-center z-10">
            <Clock className="w-5 h-5 text-[#0052cc]" />
          </div>

          {/* Calendar Graphic Card */}
          <div className="relative z-20 w-24 h-28 bg-white rounded-[8px] shadow-md border border-slate-100 overflow-hidden flex flex-col">
            <div className="h-6 bg-[#0052cc] flex items-center justify-center">
              <div className="w-8 h-1 bg-white/40 rounded-full" />
            </div>
            <div className="flex-1 p-2 grid grid-cols-3 gap-1 content-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-2 bg-blue-50 rounded-[2px]" />
              ))}
            </div>

            {/* Checkmark badge on calendar bottom right */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Locked Account Warning Banner */}
        {(urlLocked || lockedNotice) && (
          <div className="w-full p-4 rounded-[10px] bg-red-50 border-2 border-red-200 text-red-800 text-xs shadow-sm flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-red-900 text-sm">Account Locked & Access Blocked</p>
              <p className="text-red-700 leading-relaxed">
                {lockedNotice ||
                  "Your employee account has been locked by the administrator. Portal access and active sessions have been revoked."}
              </p>
              <p className="text-[11px] text-red-600 font-medium pt-1">
                Please contact IT Support or Admin to unlock your account.
              </p>
            </div>
          </div>
        )}

        {/* 3. White Sign In Card */}
        <div className="w-full bg-white rounded-[8px] shadow-lg border border-slate-100 p-6 space-y-4">
          {/* Title & Subtitle */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sign in to continue to your account
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Username or Work Email
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#0052cc] focus:border-[#0052cc] text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[#0052cc] focus:border-[#0052cc] text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-[#0052cc] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-[8px] shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <span className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} GamaNext Software Solutions Pvt Ltd
        </span>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="w-4.5 h-4.5 text-[#0052cc]" />
                <span>Password Assistance</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                To reset or retrieve your employee portal password, please reach out to your
                company administrator or IT support desk:
              </p>
              <div className="p-3 bg-blue-50 rounded-[8px] border border-blue-100 font-mono text-[#0052cc] text-center font-bold">
                admin@gamanext.com
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#0052cc] text-white text-xs font-bold rounded-[8px]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
