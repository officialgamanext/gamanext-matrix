"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  EmployeeData,
  getEmployeesFromStorage,
  getEmployeeByIdFromStorage,
  db,
} from "./firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";

interface AuthContextType {
  employee: EmployeeData | null;
  loading: boolean;
  isAccountLocked: boolean;
  lockedNotice: string | null;
  login: (
    emailOrUser: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; isLocked?: boolean }>;
  logout: () => void;
  refreshEmployee: () => Promise<void>;
  updateCurrentEmployee: (data: Partial<EmployeeData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "gamanext_logged_in_employee";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // Restore authenticated session from localStorage on mount & verify against database
  useEffect(() => {
    async function restoreSession() {
      try {
        if (typeof window !== "undefined") {
          const savedStr = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedStr) {
            const parsed: EmployeeData = JSON.parse(savedStr);
            const empKey = parsed.id || parsed.employeeId;

            if (empKey) {
              const fresh = await getEmployeeByIdFromStorage(empKey);
              if (fresh) {
                if (fresh.isLocked) {
                  // If locked in database, block access and revoke session
                  localStorage.removeItem(AUTH_STORAGE_KEY);
                  setEmployee(null);
                  setIsAccountLocked(true);
                  setLockedNotice(
                    "Your account has been locked and access is blocked by the administrator."
                  );
                } else {
                  setEmployee(fresh);
                  setIsAccountLocked(false);
                  setLockedNotice(null);
                  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fresh));
                }
              } else {
                // EMPLOYEE RECORD DOES NOT EXIST (deleted from database) -> revoke session immediately!
                console.warn("[Matrix App] Employee record no longer exists in database. Clearing session.");
                localStorage.removeItem(AUTH_STORAGE_KEY);
                setEmployee(null);
              }
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              setEmployee(null);
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

  // Real-time Firestore listener for lock & deletion status on active employee
  useEffect(() => {
    if (!employee) return;
    const docId = employee.id;
    const empId = employee.employeeId;

    let unsub: (() => void) | undefined;

    try {
      if (docId) {
        const docRef = doc(db, "employees", docId);
        unsub = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const freshData = { id: docSnap.id, ...docSnap.data() } as EmployeeData;
              if (freshData.isLocked) {
                console.warn("[Matrix App] Account lock detected in real-time. Revoking session.");
                setEmployee(null);
                setIsAccountLocked(true);
                setLockedNotice(
                  "Your account was locked by the administrator. Your active session has been revoked."
                );
                if (typeof window !== "undefined") {
                  localStorage.removeItem(AUTH_STORAGE_KEY);
                  window.location.href = "/login?locked=1";
                }
              } else {
                setEmployee(freshData);
                if (typeof window !== "undefined") {
                  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshData));
                }
              }
            } else {
              // Document was deleted from database -> revoke session immediately!
              console.warn("[Matrix App] Employee document deleted from Firestore in real-time. Revoking session.");
              setEmployee(null);
              if (typeof window !== "undefined") {
                localStorage.removeItem(AUTH_STORAGE_KEY);
                window.location.href = "/login";
              }
            }
          },
          (err) => {
            console.warn("[Matrix App] Real-time lock listener notice:", err);
          }
        );
      } else if (empId) {
        const q = query(collection(db, "employees"), where("employeeId", "==", empId));
        unsub = onSnapshot(
          q,
          (querySnap) => {
            if (!querySnap.empty) {
              const freshData = { id: querySnap.docs[0].id, ...querySnap.docs[0].data() } as EmployeeData;
              if (freshData.isLocked) {
                console.warn("[Matrix App] Account lock detected in real-time query. Revoking session.");
                setEmployee(null);
                setIsAccountLocked(true);
                setLockedNotice(
                  "Your account was locked by the administrator. Your active session has been revoked."
                );
                if (typeof window !== "undefined") {
                  localStorage.removeItem(AUTH_STORAGE_KEY);
                  window.location.href = "/login?locked=1";
                }
              } else {
                setEmployee(freshData);
                if (typeof window !== "undefined") {
                  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshData));
                }
              }
            } else {
              // Employee deleted from Firestore
              console.warn("[Matrix App] Employee record deleted from Firestore in real-time query. Revoking session.");
              setEmployee(null);
              if (typeof window !== "undefined") {
                localStorage.removeItem(AUTH_STORAGE_KEY);
                window.location.href = "/login";
              }
            }
          },
          (err) => {
            console.warn("[Matrix App] Real-time query listener notice:", err);
          }
        );
      }
    } catch (e) {
      console.warn("Failed to attach lock listener:", e);
    }

    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [employee?.id, employee?.employeeId]);

  const login = async (
    emailOrUser: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; isLocked?: boolean }> => {
    try {
      const cleanInput = emailOrUser.trim().toLowerCase();
      const cleanPass = pass.trim();

      const allEmployees = await getEmployeesFromStorage();

      if (!allEmployees || allEmployees.length === 0) {
        return {
          success: false,
          error:
            "No employee records found in database. Please ensure employee accounts are registered in GamaNext Matrix Admin.",
        };
      }

      // Match against email or username or employeeId
      const matched = allEmployees.find((emp) => {
        const empEmail = (emp.email || "").trim().toLowerCase();
        const empUser = (emp.username || "").trim().toLowerCase();
        const empCode = (emp.employeeId || "").trim().toLowerCase();
        return (
          empEmail === cleanInput ||
          empUser === cleanInput ||
          empCode === cleanInput
        );
      });

      if (!matched) {
        return {
          success: false,
          error:
            "No employee found with this email or username. Please check your credentials.",
        };
      }

      // Check password
      const storedPass = (matched.password || "").trim();
      if (storedPass && storedPass !== cleanPass) {
        return {
          success: false,
          error:
            "Incorrect password. Please verify your password and try again.",
        };
      }

      // Check if account is locked by admin
      if (matched.isLocked) {
        setIsAccountLocked(true);
        setLockedNotice(
          "Access Blocked: Your account has been locked by the administrator. Login and portal access are currently suspended."
        );
        return {
          success: false,
          isLocked: true,
          error:
            "Access Blocked: Your account has been locked by the administrator. All login and portal access is suspended. Please contact HR or IT Support.",
        };
      }

      // Successful login
      setEmployee(matched);
      setIsAccountLocked(false);
      setLockedNotice(null);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
      }

      return { success: true };
    } catch (err: any) {
      console.error("Login verification error:", err);
      return {
        success: false,
        error:
          err.message ||
          "An unexpected error occurred during login. Please try again.",
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
        if (fresh.isLocked) {
          logout();
          setIsAccountLocked(true);
          setLockedNotice("Your account has been locked by the administrator.");
          if (typeof window !== "undefined") {
            window.location.href = "/login?locked=1";
          }
        } else {
          setEmployee(fresh);
          if (typeof window !== "undefined") {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fresh));
          }
        }
      } else {
        // Record deleted
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
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
        isAccountLocked,
        lockedNotice,
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
