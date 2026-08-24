"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/authContext";
import Header from "./components/Header";
import BottomNav, { NavTab } from "./components/BottomNav";
import LoginView from "./components/LoginView";
import TimesheetView from "./components/TimesheetView";
import ReportsView from "./components/ReportsView";
import ProjectsView from "./components/ProjectsView";
import ProfileView from "./components/ProfileView";
import HomeView from "./components/HomeView";
import { Loader2 } from "lucide-react";

export default function AppMain() {
  const { employee, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("timesheet");

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
          <span>Loading Gamanext Portal...</span>
        </div>
      </div>
    );
  }

  // If not logged in, display the Login Screen
  if (!employee) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* Top White Header with Gamanext Logo, Hamburger Menu & Notification Bell */}
      <Header onNavigateTab={setActiveTab} activeTab={activeTab} />

      {/* Main View Screen */}
      <main className="flex-1">
        {activeTab === "timesheet" && <TimesheetView />}
        {activeTab === "reports" && <ReportsView />}
        {activeTab === "projects" && <ProjectsView />}
        {activeTab === "profile" && <ProfileView />}
        {activeTab === "home" && <HomeView onNavigateTab={setActiveTab} />}
      </main>

      {/* Bottom App Navigation Bar (Timesheet, Reports, Projects, Profile) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
