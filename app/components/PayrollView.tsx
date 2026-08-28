"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  getSalaryStructureForEmployee,
  getSavedPayslipsForEmployee,
  amountInWords,
  EmployeeSalaryStructure,
  MonthlyPayslip,
} from "@/lib/firebase";
import {
  ArrowLeft,
  DollarSign,
  Receipt,
  Download,
  Printer,
  Eye,
  FileSpreadsheet,
  Building2,
  Calendar,
  Layers,
  MinusCircle,
  X,
  Clock,
  Filter,
} from "lucide-react";

export default function PayrollView() {
  const router = useRouter();
  const { employee } = useAuth();

  const currentYearStr = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);

  const [salaryStructure, setSalaryStructure] = useState<EmployeeSalaryStructure | null>(null);
  const [savedPayslips, setSavedPayslips] = useState<MonthlyPayslip[]>([]);
  const [previewPayslip, setPreviewPayslip] = useState<MonthlyPayslip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayrollData() {
      if (!employee) return;
      const empKey = employee.id || employee.employeeId;
      setLoading(true);
      try {
        const [salaryData, payslipsData] = await Promise.all([
          getSalaryStructureForEmployee(empKey, employee),
          getSavedPayslipsForEmployee(empKey),
        ]);
        setSalaryStructure(salaryData);
        // Deduplicate and sort latest at top
        const uniquePayslipsMap = new Map<string, MonthlyPayslip>();
        payslipsData.forEach((p) => {
          const key = `${p.employeeId}-${p.year}-${p.monthIndex}`;
          if (!uniquePayslipsMap.has(key)) {
            uniquePayslipsMap.set(key, p);
          }
        });
        const uniquePayslips = Array.from(uniquePayslipsMap.values()).sort(
          (a, b) => b.year - a.year || b.monthIndex - a.monthIndex
        );
        setSavedPayslips(uniquePayslips);
      } catch (err) {
        console.error("Failed to load payroll data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayrollData();
  }, [employee]);

  const currentGross = salaryStructure?.grossSalary || 0;
  const currentDeductions = salaryStructure?.totalDeductions || 0;
  const currentNet = salaryStructure?.netPay || 0;

  // Filter payslips by selected year (defaulting to current year)
  const filteredPayslips = savedPayslips.filter((p) => {
    if (selectedYear === "All") return true;
    return String(p.year) === selectedYear;
  });

  // Available year options (e.g. 2026, 2025, 2024, All)
  const currentYearNum = new Date().getFullYear();
  const availableYears = [
    String(currentYearNum),
    String(currentYearNum - 1),
    String(currentYearNum - 2),
    "All",
  ];

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 pt-4 pb-28 space-y-4">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-[8px] border border-slate-100 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Payroll & Payslips</h1>
            <p className="text-[11px] text-slate-500">Official monthly salary statements</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#0052cc] bg-blue-50 px-2.5 py-1 rounded-[8px] border border-blue-100 flex items-center space-x-1">
          <Building2 className="w-3 h-3" />
          <span>Gamaone</span>
        </span>
      </div>

      {/* Salary Overview Metric Cards */}
      {salaryStructure && (salaryStructure.grossSalary > 0 || (salaryStructure.earnings && salaryStructure.earnings.length > 0)) ? (
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white p-3 rounded-[8px] border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span>Gross</span>
              <Layers className="w-3.5 h-3.5 text-[#0052cc]" />
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 truncate">
              ₹ {currentGross.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="bg-white p-3 rounded-[8px] border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span>Deductions</span>
              <MinusCircle className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-xs md:text-sm font-bold text-slate-900 truncate">
              ₹ {currentDeductions.toLocaleString("en-IN")}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#003680] to-[#0B4FBA] text-white p-3 rounded-[8px] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-blue-100 font-semibold">
              <span>Net Credit</span>
              <DollarSign className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs md:text-sm font-bold text-white truncate">
              ₹ {currentNet.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-[8px] border border-slate-100 shadow-xs text-center space-y-1">
          <div className="text-xs font-bold text-slate-700">Salary Structure Pending</div>
          <p className="text-[11px] text-slate-400">
            Your official salary structure has not been configured by HR/Finance yet.
          </p>
        </div>
      )}

      {/* Generated Payslips List with Year Filter */}
      <div className="bg-white rounded-[8px] shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#0052cc]/10 text-[#0052cc] rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-xs">
                Generated Payslips ({filteredPayslips.length})
              </h2>
              <p className="text-[10px] text-slate-500">
                Sorted by most recent pay period first
              </p>
            </div>
          </div>

          {/* Year Filter Selector */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-[8px] px-2 py-1 shadow-2xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              aria-label="Filter payslips by year"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y === "All" ? "All Years" : `${y} ${y === currentYearStr ? "(Current)" : ""}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payslip Items */}
        {filteredPayslips.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredPayslips.map((payslip, idx) => (
              <div
                key={payslip.id ? `${payslip.id}-${idx}` : `payslip-${payslip.year}-${payslip.monthIndex}-${idx}`}
                className="p-3.5 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 text-[#0052cc] rounded-lg shrink-0 mt-0.5">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                      <span>{payslip.month}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {payslip.status || "Generated"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Pay Date: {payslip.paymentDate} &nbsp;•&nbsp; {payslip.paidDays}/{payslip.workingDays} Paid Days
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-slate-400 font-medium">Net Salary to Credit</div>
                    <div className="text-xs md:text-sm font-bold text-slate-900 font-mono">
                      ₹ {payslip.netPay.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewPayslip(payslip)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0052cc] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                      title="View Payslip"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPayslip(payslip);
                        setTimeout(() => window.print(), 300);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">No payslips found for {selectedYear}</p>
            <p className="text-[11px] text-slate-400">
              Payslips for {selectedYear} will appear here once generated by HR/Finance.
            </p>
          </div>
        )}
      </div>

      {/* PRINTABLE PAYSLIP MODAL */}
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
                    <span className="text-slate-800">{employee.department || "—"}</span>
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
                    <span className="text-slate-800">{employee.bankName || "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">A/C No:</span>
                    <span className="font-mono font-bold text-slate-900">{employee.bankAccountNumber || "—"}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 font-medium">IFSC:</span>
                    <span className="font-mono text-slate-800">{employee.bankIfscCode || "—"}</span>
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

              {/* Earnings & Deductions Breakdown */}
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
