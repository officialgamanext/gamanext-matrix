"use client";

import { useState } from "react";
import LeavesView from "./LeavesView";
import WfhView from "./WfhView";
import {
  Calendar,
  Laptop,
} from "lucide-react";

export default function ReportsView() {
  const [reportType, setReportType] = useState<"leaves" | "wfh">("leaves");

  return (
    <div className="space-y-4">
      {/* Sub-Switch Bar for Reports */}
      <div className="max-w-md md:max-w-lg mx-auto px-4 pt-4">
        <div className="bg-slate-200/60 p-1 rounded-[8px] flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setReportType("leaves")}
            className={`flex-1 py-2 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center space-x-2 select-none cursor-pointer ${
              reportType === "leaves"
                ? "bg-white text-[#0052cc] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Leaves Management</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType("wfh")}
            className={`flex-1 py-2 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center space-x-2 select-none cursor-pointer ${
              reportType === "wfh"
                ? "bg-white text-[#0052cc] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Work From Home</span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {reportType === "leaves" ? <LeavesView /> : <WfhView />}
    </div>
  );
}
