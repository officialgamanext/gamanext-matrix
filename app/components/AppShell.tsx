"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import Header from "./Header";
import { Loader2 } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { employee, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to /login if unauthenticated or locked after loading completes
  useEffect(() => {
    if (!loading) {
      if (!employee) {
        if (pathname !== "/login") {
          router.replace("/login");
        }
      } else if (employee.isLocked) {
        logout();
        router.replace("/login?locked=1");
      }
    }
  }, [loading, employee, pathname, router, logout]);

  // Loading Screen while restoring session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-4 rounded-[8px] shadow-sm mb-4 border border-slate-100 animate-pulse">
          <Image
            src="/gama-next-logo-reserved.png"
            alt="Gamanext"
            width={140}
            height={36}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>
        <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#0052cc]" />
          <span>Verifying Employee Session...</span>
        </div>
      </div>
    );
  }

  if (!employee || employee.isLocked) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faff] selection:bg-blue-600 selection:text-white">
      {/* Top Header: Left Back Icon, Center Logo, Right Login Details */}
      <Header />

      {/* Page Content: Clean layout, no bottom bar required */}
      <main className="flex-1 pb-10">{children}</main>
    </div>
  );
}
