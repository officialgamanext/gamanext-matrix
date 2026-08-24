"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import Header from "./Header";
import BottomNav, { NavTab } from "./BottomNav";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { employee, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab from pathname
  let activeTab: NavTab = "timesheet";
  if (pathname.startsWith("/reports")) {
    activeTab = "reports";
  } else if (pathname.startsWith("/projects")) {
    activeTab = "projects";
  } else if (pathname.startsWith("/profile")) {
    activeTab = "profile";
  } else if (pathname.startsWith("/timesheet")) {
    activeTab = "timesheet";
  }

  // Redirect to /login if unauthenticated after loading completes
  useEffect(() => {
    if (!loading && !employee && pathname !== "/login") {
      router.replace("/login");
    }
  }, [loading, employee, pathname, router]);

  // Loading Screen while restoring session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-4 rounded-[8px] shadow-md mb-4 border border-slate-100 animate-pulse">
          <Image
            src="/gama-next-logo-reserved.png"
            alt="Gamanext"
            width={140}
            height={36}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-[#0052cc]" />
          <span>Verifying Employee Session...</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const handleNavigateTab = (tab: NavTab) => {
    if (tab === "timesheet") router.push("/timesheet");
    else if (tab === "reports") router.push("/reports");
    else if (tab === "projects") router.push("/projects");
    else if (tab === "profile") router.push("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onNavigateTab={handleNavigateTab} activeTab={activeTab} />

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom App Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={handleNavigateTab} />
    </div>
  );
}
