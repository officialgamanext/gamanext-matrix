"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { EmployeeData, getEmployeesFromStorage, getEmployeeByIdFromStorage } from "./firebase";

interface AuthContextType {
  employee: EmployeeData | null;
  loading: boolean;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshEmployee: () => Promise<void>;
  updateCurrentEmployee: (data: Partial<EmployeeData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "gamanext_logged_in_employee";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        if (typeof window !== "undefined") {
          const savedStr = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedStr) {
            const parsed: EmployeeData = JSON.parse(savedStr);
            // Verify and refresh latest data from database
            const empKey = parsed.id || parsed.employeeId;
            if (empKey) {
              const fresh = await getEmployeeByIdFromStorage(empKey);
              if (fresh) {
                setEmployee(fresh);
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fresh));
              } else {
                setEmployee(parsed);
              }
            } else {
              setEmployee(parsed);
            }
          }
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (emailOrUser: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanInput = emailOrUser.trim().toLowerCase();
      const cleanPass = pass.trim();

      const allEmployees = await getEmployeesFromStorage();

      if (!allEmployees || allEmployees.length === 0) {
        return {
          success: false,
          error: "No employee records found. Please ensure employee accounts are registered in GamaNext Matrix Admin.",
        };
      }

      // Match against email or username
      const matched = allEmployees.find((emp) => {
        const empEmail = (emp.email || "").trim().toLowerCase();
        const empUser = (emp.username || "").trim().toLowerCase();
        const empCode = (emp.employeeId || "").trim().toLowerCase();
        return empEmail === cleanInput || empUser === cleanInput || empCode === cleanInput;
      });

      if (!matched) {
        return {
          success: false,
          error: "No employee found with this email or username. Please check your credentials.",
        };
      }

      // Check password
      const storedPass = (matched.password || "").trim();
      
      // If employee has a password set, compare it. If empty or match:
      if (storedPass && storedPass !== cleanPass) {
        return {
          success: false,
          error: "Incorrect password. Please verify your password and try again.",
        };
      }

      // Successful login
      setEmployee(matched);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
      }

      return { success: true };
    } catch (err: any) {
      console.error("Login verification error:", err);
      return {
        success: false,
        error: err.message || "An unexpected error occurred during login. Please try again.",
      };
    }
  };

  const logout = () => {
    setEmployee(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const refreshEmployee = async () => {
    if (!employee) return;
    const empKey = employee.id || employee.employeeId;
    if (empKey) {
      const fresh = await getEmployeeByIdFromStorage(empKey);
      if (fresh) {
        setEmployee(fresh);
        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fresh));
        }
      }
    }
  };

  const updateCurrentEmployee = (data: Partial<EmployeeData>) => {
    if (!employee) return;
    const updated = { ...employee, ...data };
    setEmployee(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        loading,
        login,
        logout,
        refreshEmployee,
        updateCurrentEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
