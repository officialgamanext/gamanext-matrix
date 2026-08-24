"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import { Loader2 } from "lucide-react";

export default function RootIndexPage() {
  const { employee, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (employee) {
        router.replace("/timesheet");
      } else {
        router.replace("/login");
      }
    }
  }, [employee, loading, router]);

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
        <span>Loading Gamanext Portal...</span>
      </div>
    </div>
  );
}
