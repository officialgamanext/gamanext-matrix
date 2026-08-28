import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBfeBSE4MUESKvJqbGBE4xOvRPnv2leQ6o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gamanext-matrix-admin.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gamanext-matrix-admin",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gamanext-matrix-admin.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "32000054720",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:32000054720:web:555195a6f11366e053e425",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RDJDS59FS6",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface EmergencyContact {
  name: string;
  relation: string;
  mobileNumber: string;
  occupation: string;
  address: string;
}

export interface EmployeeData {
  id?: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  address: string;
  city: string;
  pincode: string;
  employeeId: string;
  employeeRole: string;
  department: string;
  dateOfJoining: string;
  username: string;
  password?: string;
  aadharNumber: string;
  panCardNumber: string;
  profilePhotoUrl: string;
  aadharFrontUrl: string;
  aadharBackUrl: string;
  panCardUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  emergencyContact1: EmergencyContact;
  emergencyContact2: EmergencyContact;
  jobType?: string;
  salaryStructure?: EmployeeSalaryStructure;
  isLocked?: boolean;
  lockedAt?: string;
  createdAt?: string;
}

export interface DepartmentItem {
  id?: string;
  name: string;
  createdAt?: string;
}

export interface RoleItem {
  id?: string;
  name: string;
  createdAt?: string;
}

export interface MasterProjectItem {
  id?: string;
  name: string;
  createdAt?: string;
}


export interface SalaryAttribute {
  id: string;
  name: string;
  amount: number;
}

export interface EmployeeSalaryStructure {
  id?: string;
  employeeId: string;
  earnings: SalaryAttribute[];
  deductions: SalaryAttribute[];
  grossSalary: number;
  totalDeductions: number;
  netPay: number;
  updatedAt?: string;
}

export interface MonthlyPayslip {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  monthIndex: number;
  paymentDate: string;
  workingDays: number;
  paidDays: number;
  earnings: SalaryAttribute[];
  deductions: SalaryAttribute[];
  grossSalary: number;
  totalDeductions: number;
  netPay: number;
  status: "Generated" | "Paid" | "Processing";
}

export interface HolidayItem {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  dayOfWeek?: string; // e.g. "Monday"
  type: "National Holiday" | "Public Holiday" | "Festival Holiday" | "Company Holiday" | "Optional / Restricted";
  description?: string;
  year?: number | string;
  createdAt?: string;
}

export interface ProjectAllocation {
  id?: string;
  employeeId: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Inactive" | "Completed";
  createdAt?: string;
}

export interface LeaveRequest {
  id?: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  leaveType: "Casual Leave" | "Sick Leave" | "Maternity Leave" | "Paternity Leave";
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  quarter: string; // e.g. Q1, Q2, Q3, Q4
  daysCount: number;
  createdAt?: string;
}

export interface WFHRequest {
  id?: string;
  employeeId: string;
  fromDate: string;
  toDate: string;
  month: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: string;
}

export interface TimesheetEntry {
  id?: string;
  employeeId: string;
  date: string;
  projectName: string;
  billingHours: number;
  tasks: string;
  createdAt?: string;
}

export interface EmployeeRequest {
  id?: string;
  employeeId: string;
  requestType: "Accessories Allowance" | "Monthly Network/WiFi Bill Reimbursement";
  amount: number;
  monthOrDescription: string;
  status: "Pending" | "Approved" | "Rejected" | "Amount Initiated" | "Amount Credited";
  createdAt?: string;
}

export interface YearlyReview {
  id?: string;
  employeeId: string;
  year: string;
  rating: number; // Out of 10
  feedback: string;
  createdAt?: string;
}

export interface PerformanceBandRecord {
  id?: string;
  employeeId: string;
  year: string;
  band: "Band A" | "Band B" | "Band C" | "Band D";
  remarks: string;
  createdAt?: string;
}

const LOCAL_STORAGE_KEY_EMPLOYEES = "gamanext_employees_data";
const LOCAL_STORAGE_KEY_DEPTS = "gamanext_departments_data";
const LOCAL_STORAGE_KEY_ROLES = "gamanext_roles_data";
const LOCAL_STORAGE_KEY_MASTER_PROJECTS = "gamanext_master_projects_data";
const LOCAL_STORAGE_KEY_PROJECTS = "gamanext_projects_data";
const LOCAL_STORAGE_KEY_LEAVES = "gamanext_leaves_data";
const LOCAL_STORAGE_KEY_WFH = "gamanext_wfh_data";
const LOCAL_STORAGE_KEY_TIMESHEETS = "gamanext_timesheets_data";
const LOCAL_STORAGE_KEY_REQUESTS = "gamanext_requests_data";
const LOCAL_STORAGE_KEY_REVIEWS = "gamanext_reviews_data";
const LOCAL_STORAGE_KEY_BANDS = "gamanext_bands_data";

/* ---------------- EMPLOYEES STORAGE HELPERS ---------------- */
export async function getEmployeesFromStorage(): Promise<EmployeeData[]> {
  try {
    const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const employees: EmployeeData[] = [];
    snapshot.forEach((docSnap) => {
      employees.push({ id: docSnap.id, ...docSnap.data() } as EmployeeData);
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    }
    return employees;
  } catch (err) {
    console.warn("Firestore fetch notice, using fallback cache:", err);
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error("Local storage parse error:", e);
        }
      }
    }
    return [];
  }
}

export async function getEmployeeByIdFromStorage(id: string): Promise<EmployeeData | null> {
  try {
    if (id) {
      // 1. Direct doc lookup
      const docRef = doc(db, "employees", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EmployeeData;
      }

      // 2. Query by employeeId
      const q = query(collection(db, "employees"), where("employeeId", "==", id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as EmployeeData;
      }
    }
  } catch (err) {
    console.warn("Direct employee fetch failed, falling back to cache:", err);
  }

  const employees = await getEmployeesFromStorage();
  return (
    employees.find((emp) => emp.id === id || emp.employeeId === id) || null
  );
}

function sanitizeFirestoreData<T extends Record<string, any>>(data: T): T {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === "object" && item !== null ? sanitizeFirestoreData(item) : item)) as unknown as T;
  }
  if (typeof data === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (typeof value === "object" && value !== null) {
          cleaned[key] = sanitizeFirestoreData(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }
  return data;
}

export async function updateEmployeeInStorage(
  id: string,
  updatedData: Partial<EmployeeData>
): Promise<boolean> {
  try {
    if (id) {
      const cleanPayload = sanitizeFirestoreData(updatedData);

      let updatedFirestore = false;
      try {
        const docRef = doc(db, "employees", id);
        await updateDoc(docRef, cleanPayload);
        updatedFirestore = true;
      } catch (directErr) {
        // Direct docRef update by ID might fail if ID is employeeId string
      }

      if (!updatedFirestore) {
        const q = query(collection(db, "employees"), where("employeeId", "==", id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          for (const d of snap.docs) {
            await updateDoc(d.ref, cleanPayload);
          }
        }
      }
    }
  } catch (err) {
    console.error("Firestore update error:", err);
  }

  if (typeof window !== "undefined") {
    const existing = await getEmployeesFromStorage();
    const updatedList = existing.map((emp) =>
      emp.id === id || emp.employeeId === id ? { ...emp, ...updatedData } : emp
    );
    localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedList));
  }

  return true;
}

/* ---------------- DEPARTMENTS STORAGE HELPERS ---------------- */
export async function getDepartmentsFromStorage(): Promise<DepartmentItem[]> {
  try {
    const q = query(collection(db, "departments"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const items: DepartmentItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as DepartmentItem);
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_DEPTS, JSON.stringify(items));
    }
    return items;
  } catch (err) {
    console.warn("Firestore departments fetch notice:", err);
  }

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_DEPTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
  }

  return [];
}

/* ---------------- EMPLOYEE ROLES STORAGE HELPERS ---------------- */
export async function getRolesFromStorage(): Promise<RoleItem[]> {
  try {
    const q = query(collection(db, "employee_roles"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    const items: RoleItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as RoleItem);
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_ROLES, JSON.stringify(items));
    }
    return items;
  } catch (err) {
    console.warn("Firestore roles fetch notice:", err);
  }

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_ROLES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
  }

  return [];
}

/* ---------------- MASTER PROJECTS STORAGE HELPERS ---------------- */
export async function getMasterProjectsFromStorage(): Promise<MasterProjectItem[]> {
  try {
    const q = query(collection(db, "master_projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const items: MasterProjectItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as MasterProjectItem);
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY_MASTER_PROJECTS, JSON.stringify(items));
    }
    return items;
  } catch (err) {
    console.warn("Firestore master projects fetch notice:", err);
  }

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_MASTER_PROJECTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
  }

  return [];
}

/* ---------------- PROJECT ALLOCATIONS STORAGE ---------------- */
export async function getProjectsForEmployee(employeeId: string): Promise<ProjectAllocation[]> {
  try {
    const q = query(
      collection(db, "project_allocations"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const projects: ProjectAllocation[] = [];
    snapshot.forEach((docSnap) => {
      projects.push({ id: docSnap.id, ...docSnap.data() } as ProjectAllocation);
    });
    return projects;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
    if (data) {
      try {
        const all: ProjectAllocation[] = JSON.parse(data);
        return all.filter((p) => p.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

export async function saveProjectForEmployee(project: ProjectAllocation): Promise<ProjectAllocation> {
  const item: ProjectAllocation = {
    ...project,
    status: project.status || "Active",
    createdAt: new Date().toISOString(),
  };

  // If newly added project is Active, mark all other existing projects for this employee as Inactive
  if (item.status === "Active") {
    try {
      const existingProjects = await getProjectsForEmployee(project.employeeId);
      for (const p of existingProjects) {
        if (p.id && p.status === "Active") {
          const docRef = doc(db, "project_allocations", p.id);
          await updateDoc(docRef, { status: "Inactive" });
        }
      }
    } catch (e) {}

    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (existingStr) {
        const allProjects: ProjectAllocation[] = JSON.parse(existingStr);
        const updated = allProjects.map((p) =>
          p.employeeId === project.employeeId && p.status === "Active"
            ? { ...p, status: "Inactive" as const }
            : p
        );
        localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(updated));
      }
    }
  }

  try {
    const docRef = await addDoc(collection(db, "project_allocations"), item);
    const created = { ...item, id: docRef.id };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      const existing: ProjectAllocation[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify([created, ...existing]));
    }
    return created;
  } catch (e) {
    const created = { ...item, id: `proj-${Date.now()}` };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      const existing: ProjectAllocation[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify([created, ...existing]));
    }
    return created;
  }
}

export async function setProjectAllocationStatus(
  employeeId: string,
  targetProjectId: string,
  newStatus: "Active" | "Inactive"
): Promise<boolean> {
  try {
    const existingProjects = await getProjectsForEmployee(employeeId);
    for (const p of existingProjects) {
      if (p.id) {
        if (p.id === targetProjectId) {
          const docRef = doc(db, "project_allocations", p.id);
          await updateDoc(docRef, { status: newStatus });
        } else if (newStatus === "Active" && p.status === "Active") {
          const docRef = doc(db, "project_allocations", p.id);
          await updateDoc(docRef, { status: "Inactive" });
        }
      }
    }
  } catch (e) {}

  if (typeof window !== "undefined") {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
    if (existingStr) {
      const allProjects: ProjectAllocation[] = JSON.parse(existingStr);
      const updated = allProjects.map((p) => {
        if (p.employeeId === employeeId) {
          if (p.id === targetProjectId) {
            return { ...p, status: newStatus };
          }
          if (newStatus === "Active" && p.status === "Active") {
            return { ...p, status: "Inactive" as const };
          }
        }
        return p;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(updated));
    }
  }
  return true;
}

export async function setActiveProjectForEmployee(
  employeeId: string,
  targetProjectId: string
): Promise<boolean> {
  return setProjectAllocationStatus(employeeId, targetProjectId, "Active");
}

export async function deleteProjectAllocation(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "project_allocations", id));
  } catch (e) {}

  if (typeof window !== "undefined") {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
    if (existingStr) {
      const allProjects: ProjectAllocation[] = JSON.parse(existingStr);
      const updated = allProjects.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(updated));
    }
  }
  return true;
}

/* ---------------- LEAVES STORAGE ---------------- */
export async function getLeavesForEmployee(employeeId: string): Promise<LeaveRequest[]> {
  try {
    const q = query(
      collection(db, "leave_requests"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const leaves: LeaveRequest[] = [];
    snapshot.forEach((docSnap) => {
      leaves.push({ id: docSnap.id, ...docSnap.data() } as LeaveRequest);
    });
    return leaves;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_LEAVES);
    if (data) {
      try {
        const all: LeaveRequest[] = JSON.parse(data);
        return all.filter((l) => l.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

export async function saveLeaveForEmployee(leave: LeaveRequest): Promise<LeaveRequest> {
  const item: LeaveRequest = {
    ...leave,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, "leave_requests"), item);
    const created = { ...item, id: docRef.id };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_LEAVES);
      const existing: LeaveRequest[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_LEAVES, JSON.stringify([created, ...existing]));
    }
    return created;
  } catch (e) {
    const created = { ...item, id: `leave-${Date.now()}` };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_LEAVES);
      const existing: LeaveRequest[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_LEAVES, JSON.stringify([created, ...existing]));
    }
    return created;
  }
}

/* ---------------- WFH STORAGE ---------------- */
export async function getWFHForEmployee(employeeId: string): Promise<WFHRequest[]> {
  try {
    const q = query(
      collection(db, "wfh_requests"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const wfh: WFHRequest[] = [];
    snapshot.forEach((docSnap) => {
      wfh.push({ id: docSnap.id, ...docSnap.data() } as WFHRequest);
    });
    return wfh;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_WFH);
    if (data) {
      try {
        const all: WFHRequest[] = JSON.parse(data);
        return all.filter((w) => w.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

export async function saveWFHForEmployee(wfh: WFHRequest): Promise<WFHRequest> {
  const item: WFHRequest = {
    ...wfh,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, "wfh_requests"), item);
    const created = { ...item, id: docRef.id };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_WFH);
      const existing: WFHRequest[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_WFH, JSON.stringify([created, ...existing]));
    }
    return created;
  } catch (e) {
    const created = { ...item, id: `wfh-${Date.now()}` };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_WFH);
      const existing: WFHRequest[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_WFH, JSON.stringify([created, ...existing]));
    }
    return created;
  }
}

/* ---------------- TIMESHEET STORAGE ---------------- */
export async function getTimesheetsForEmployee(employeeId: string): Promise<TimesheetEntry[]> {
  try {
    const q = query(
      collection(db, "timesheets"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const entries: TimesheetEntry[] = [];
    snapshot.forEach((docSnap) => {
      entries.push({ id: docSnap.id, ...docSnap.data() } as TimesheetEntry);
    });
    return entries;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_TIMESHEETS);
    if (data) {
      try {
        const all: TimesheetEntry[] = JSON.parse(data);
        return all.filter((t) => t.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

export async function saveTimesheetForEmployee(entry: TimesheetEntry): Promise<TimesheetEntry> {
  const item: TimesheetEntry = {
    ...entry,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, "timesheets"), item);
    const created = { ...item, id: docRef.id };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_TIMESHEETS);
      const existing: TimesheetEntry[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_TIMESHEETS, JSON.stringify([created, ...existing]));
    }
    return created;
  } catch (e) {
    const created = { ...item, id: `ts-${Date.now()}` };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_TIMESHEETS);
      const existing: TimesheetEntry[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_TIMESHEETS, JSON.stringify([created, ...existing]));
    }
    return created;
  }
}

/* ---------------- EMPLOYEE REQUESTS (ALLOWANCES / REIMBURSEMENTS) ---------------- */
export async function getRequestsForEmployee(employeeId: string): Promise<EmployeeRequest[]> {
  try {
    const q = query(
      collection(db, "employee_requests"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const requests: EmployeeRequest[] = [];
    snapshot.forEach((docSnap) => {
      requests.push({ id: docSnap.id, ...docSnap.data() } as EmployeeRequest);
    });
    return requests;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_REQUESTS);
    if (data) {
      try {
        const all: EmployeeRequest[] = JSON.parse(data);
        return all.filter((r) => r.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

export async function saveRequestForEmployee(req: EmployeeRequest): Promise<EmployeeRequest> {
  const item: EmployeeRequest = {
    ...req,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, "employee_requests"), item);
    const created = { ...item, id: docRef.id };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_REQUESTS);
      const existing: EmployeeRequest[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_REQUESTS, JSON.stringify([created, ...existing]));
    }
    return created;
  } catch (e) {
    const created = { ...item, id: `req-${Date.now()}` };
    if (typeof window !== "undefined") {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_REQUESTS);
      const existing: EmployeeRequest[] = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem(LOCAL_STORAGE_KEY_REQUESTS, JSON.stringify([created, ...existing]));
    }
    return created;
  }
}

/* ---------------- YEARLY REVIEWS & BANDS ---------------- */
export async function getYearlyReviewsForEmployee(employeeId: string): Promise<YearlyReview[]> {
  try {
    const q = query(
      collection(db, "yearly_reviews"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const reviews: YearlyReview[] = [];
    snapshot.forEach((docSnap) => {
      reviews.push({ id: docSnap.id, ...docSnap.data() } as YearlyReview);
    });
    return reviews;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_REVIEWS);
    if (data) {
      try {
        const all: YearlyReview[] = JSON.parse(data);
        return all.filter((r) => r.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

export async function getPerformanceBandsForEmployee(employeeId: string): Promise<PerformanceBandRecord[]> {
  try {
    const q = query(
      collection(db, "performance_bands"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    const bands: PerformanceBandRecord[] = [];
    snapshot.forEach((docSnap) => {
      bands.push({ id: docSnap.id, ...docSnap.data() } as PerformanceBandRecord);
    });
    return bands;
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_BANDS);
    if (data) {
      try {
        const all: PerformanceBandRecord[] = JSON.parse(data);
        return all.filter((b) => b.employeeId === employeeId);
      } catch (e) {}
    }
  }
  return [];
}

/* ---------------- HOLIDAYS STORAGE ---------------- */
export const LOCAL_STORAGE_KEY_HOLIDAYS = "gamanext_holidays";

export const DEFAULT_HOLIDAYS_2026: Omit<HolidayItem, "id">[] = [
  { title: "New Year's Day", date: "2026-01-01", dayOfWeek: "Thursday", type: "Public Holiday", description: "First day of the new year", year: 2026 },
  { title: "Makar Sankranti / Pongal", date: "2026-01-14", dayOfWeek: "Wednesday", type: "Festival Holiday", description: "Harvest Festival", year: 2026 },
  { title: "Republic Day", date: "2026-01-26", dayOfWeek: "Monday", type: "National Holiday", description: "Commemorates the adoption of Constitution of India", year: 2026 },
  { title: "Maha Shivaratri", date: "2026-02-15", dayOfWeek: "Sunday", type: "Festival Holiday", description: "Great Night of Lord Shiva", year: 2026 },
  { title: "Holi", date: "2026-03-04", dayOfWeek: "Wednesday", type: "Festival Holiday", description: "Festival of Colours", year: 2026 },
  { title: "Ugadi / Gudi Padwa", date: "2026-03-19", dayOfWeek: "Thursday", type: "Festival Holiday", description: "Traditional New Year Festival", year: 2026 },
  { title: "Eid-ul-Fitr (Ramzan)", date: "2026-03-21", dayOfWeek: "Saturday", type: "Festival Holiday", description: "Islamic celebration marking the end of Ramadan", year: 2026 },
  { title: "Good Friday", date: "2026-04-03", dayOfWeek: "Friday", type: "Public Holiday", description: "Christian holiday commemorating the crucifixion", year: 2026 },
  { title: "Dr. B.R. Ambedkar Jayanti", date: "2026-04-14", dayOfWeek: "Tuesday", type: "Public Holiday", description: "Birth anniversary of Dr. B.R. Ambedkar", year: 2026 },
  { title: "May Day / Labour Day", date: "2026-05-01", dayOfWeek: "Friday", type: "Public Holiday", description: "International Workers' Day", year: 2026 },
  { title: "Bakrid / Eid al-Adha", date: "2026-05-27", dayOfWeek: "Wednesday", type: "Festival Holiday", description: "Feast of the Sacrifice", year: 2026 },
  { title: "Independence Day", date: "2026-08-15", dayOfWeek: "Saturday", type: "National Holiday", description: "Indian Independence Day celebration", year: 2026 },
  { title: "Ganesh Chaturthi", date: "2026-09-14", dayOfWeek: "Monday", type: "Festival Holiday", description: "Celebrates the birth of Lord Ganesha", year: 2026 },
  { title: "Gandhi Jayanti", date: "2026-10-02", dayOfWeek: "Friday", type: "National Holiday", description: "Birth anniversary of Mahatma Gandhi", year: 2026 },
  { title: "Dussehra / Vijaya Dashami", date: "2026-10-20", dayOfWeek: "Tuesday", type: "Festival Holiday", description: "Victory of good over evil", year: 2026 },
  { title: "Diwali / Deepavali", date: "2026-11-08", dayOfWeek: "Sunday", type: "Festival Holiday", description: "Festival of Lights", year: 2026 },
  { title: "Christmas Day", date: "2026-12-25", dayOfWeek: "Friday", type: "Public Holiday", description: "Celebration of the birth of Jesus Christ", year: 2026 },
];

export async function getHolidaysFromStorage(filterYear?: string | number): Promise<HolidayItem[]> {
  try {
    const q = query(collection(db, "holidays"), orderBy("date", "asc"));
    const snapshot = await getDocs(q);
    const holidays: HolidayItem[] = [];
    snapshot.forEach((docSnap) => {
      holidays.push({ id: docSnap.id, ...docSnap.data() } as HolidayItem);
    });
    if (holidays.length > 0) {
      if (filterYear && filterYear !== "All") {
        return holidays.filter((h) => String(h.year || new Date(h.date).getFullYear()) === String(filterYear));
      }
      return holidays;
    }
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_HOLIDAYS);
    if (data) {
      try {
        const parsed: HolidayItem[] = JSON.parse(data);
        if (parsed.length > 0) {
          if (filterYear && filterYear !== "All") {
            return parsed.filter((h) => String(h.year || new Date(h.date).getFullYear()) === String(filterYear));
          }
          return parsed;
        }
      } catch (e) {}
    }

    // Seed default holidays if empty
    const seeded: HolidayItem[] = DEFAULT_HOLIDAYS_2026.map((h, i) => ({
      ...h,
      id: `hol-${Date.now()}-${i}`,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY_HOLIDAYS, JSON.stringify(seeded));
    if (filterYear && filterYear !== "All") {
      return seeded.filter((h) => String(h.year || new Date(h.date).getFullYear()) === String(filterYear));
    }
    return seeded;
  }
  return [];
}


/* ---------------- SALARY & PAYROLL STORAGE HELPERS ---------------- */
export const LOCAL_STORAGE_KEY_SALARY_STRUCTURES = "gamanext_salary_structures";

export const DEFAULT_SALARY_STRUCTURE = (employeeId: string): EmployeeSalaryStructure => ({
  employeeId,
  earnings: [
    { id: "earn-1", name: "Basic Salary", amount: 25000 },
    { id: "earn-2", name: "House Rent Allowance (HRA)", amount: 12500 },
    { id: "earn-3", name: "Special Allowance", amount: 10000 },
    { id: "earn-4", name: "Conveyance Allowance", amount: 2500 },
  ],
  deductions: [
    { id: "ded-1", name: "Provident Fund (PF)", amount: 1800 },
    { id: "ded-2", name: "Professional Tax (PT)", amount: 200 },
    { id: "ded-3", name: "Health Insurance", amount: 1000 },
  ],
  grossSalary: 50000,
  totalDeductions: 3000,
  netPay: 47000,
});

export async function getSalaryStructureForEmployee(
  employeeId: string,
  employeeObj?: EmployeeData | null
): Promise<EmployeeSalaryStructure | null> {
  // 1. Check direct salaryStructure property on employee object
  if (employeeObj && employeeObj.salaryStructure && employeeObj.salaryStructure.earnings && employeeObj.salaryStructure.earnings.length > 0) {
    const s = employeeObj.salaryStructure;
    const gross = (s.earnings || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalDed = (s.deductions || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return {
      ...s,
      grossSalary: gross,
      totalDeductions: totalDed,
      netPay: gross - totalDed,
    };
  }

  // 2. Check Firestore collection "salary_structures"
  try {
    const q = query(
      collection(db, "salary_structures"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const earnings: SalaryAttribute[] = data.earnings || [];
      const deductions: SalaryAttribute[] = data.deductions || [];
      const gross = earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const totalDed = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const net = gross - totalDed;
      return {
        id: docSnap.id,
        employeeId,
        earnings,
        deductions,
        grossSalary: gross,
        totalDeductions: totalDed,
        netPay: net,
        updatedAt: data.updatedAt,
      };
    }
  } catch (e) {}

  // 3. Check LocalStorage salary structures
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_SALARY_STRUCTURES);
    if (data) {
      try {
        const list: EmployeeSalaryStructure[] = JSON.parse(data);
        const found = list.find(
          (s) => s.employeeId === employeeId || (employeeObj && s.employeeId === employeeObj.employeeId) || (employeeObj && s.employeeId === employeeObj.id)
        );
        if (found && found.earnings && found.earnings.length > 0) {
          const gross = (found.earnings || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          const totalDed = (found.deductions || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          return {
            ...found,
            grossSalary: gross,
            totalDeductions: totalDed,
            netPay: gross - totalDed,
          };
        }
      } catch (e) {}
    }

    // 4. Check LocalStorage employee data
    const empDataStr = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
    if (empDataStr) {
      try {
        const employees: EmployeeData[] = JSON.parse(empDataStr);
        const foundEmp = employees.find(
          (e) => e.id === employeeId || e.employeeId === employeeId
        );
        if (foundEmp && foundEmp.salaryStructure && foundEmp.salaryStructure.earnings && foundEmp.salaryStructure.earnings.length > 0) {
          const s = foundEmp.salaryStructure;
          const gross = (s.earnings || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          const totalDed = (s.deductions || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
          return {
            ...s,
            grossSalary: gross,
            totalDeductions: totalDed,
            netPay: gross - totalDed,
          };
        }
      } catch (e) {}
    }
  }

  return null;
}

export async function saveSalaryStructureForEmployee(
  structure: EmployeeSalaryStructure,
  employeeDocId?: string
): Promise<EmployeeSalaryStructure> {
  const gross = structure.earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalDed = structure.deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const net = gross - totalDed;

  const itemToSave: EmployeeSalaryStructure = {
    ...structure,
    grossSalary: gross,
    totalDeductions: totalDed,
    netPay: net,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (itemToSave.id && !itemToSave.id.startsWith("sal-")) {
      const { id, ...data } = itemToSave;
      await updateDoc(doc(db, "salary_structures", itemToSave.id), data);
    } else {
      const docRef = await addDoc(collection(db, "salary_structures"), itemToSave);
      itemToSave.id = docRef.id;
    }
  } catch (e) {
    if (!itemToSave.id) {
      itemToSave.id = `sal-${Date.now()}`;
    }
  }

  const targetDocId = employeeDocId || structure.employeeId;
  if (targetDocId && !targetDocId.startsWith("emp-")) {
    try {
      await updateDoc(doc(db, "employees", targetDocId), {
        salaryStructure: itemToSave,
      });
    } catch (e) {}
  }

  if (typeof window !== "undefined") {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_SALARY_STRUCTURES);
    const existing: EmployeeSalaryStructure[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = existing.filter((s) => s.employeeId !== structure.employeeId);
    updated.unshift(itemToSave);
    localStorage.setItem(LOCAL_STORAGE_KEY_SALARY_STRUCTURES, JSON.stringify(updated));

    const empDataStr = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
    if (empDataStr) {
      try {
        const employees: EmployeeData[] = JSON.parse(empDataStr);
        const updatedEmployees = employees.map((emp) => {
          if (emp.id === targetDocId || emp.id === structure.employeeId || emp.employeeId === structure.employeeId) {
            return { ...emp, salaryStructure: itemToSave };
          }
          return emp;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedEmployees));
      } catch (e) {}
    }
  }

  return itemToSave;
}

export interface MonthlyAbsenceBreakdown {
  totalDaysInMonth: number;
  weekendDays: number;
  holidayDays: number;
  approvedLeaveDays: number;
  workingDaysExpected: number;
  timesheetSubmittedDays: number;
  unappliedDays: number;
  perDaySalary: number;
  lopDeductionAmount: number;
  paidDays: number;
}

export function calculateMonthlyTimesheetAbsences(
  employee: EmployeeData,
  year: number,
  monthIndex: number, // 0 to 11
  grossSalary: number,
  timesheets: TimesheetEntry[] = [],
  leaves: LeaveRequest[] = [],
  wfhList: WFHRequest[] = [],
  holidays: HolidayItem[] = []
): MonthlyAbsenceBreakdown {
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const currentDay = now.getDate();

  const maxDayToCheck =
    year === currentYear && monthIndex === currentMonthIdx
      ? currentDay
      : year < currentYear || (year === currentYear && monthIndex < currentMonthIdx)
      ? totalDays
      : 0;

  const joiningDateStr = employee.dateOfJoining;
  const joiningDate = joiningDateStr ? new Date(joiningDateStr) : null;

  const timesheetDates = new Set<string>();
  (timesheets || []).forEach((ts) => {
    if (ts && ts.date) timesheetDates.add(ts.date);
  });

  const isApprovedLeave = (dateStr: string) => {
    return (leaves || []).some((l) => {
      if (l.status !== "Approved") return false;
      return dateStr >= l.fromDate && dateStr <= l.toDate;
    });
  };

  const isApprovedWFH = (dateStr: string) => {
    return (wfhList || []).some((w) => {
      if (w.status !== "Approved") return false;
      return dateStr >= w.fromDate && dateStr <= w.toDate;
    });
  };

  const holidayDateSet = new Set<string>();
  (holidays || []).forEach((h) => {
    if (h && h.date) holidayDateSet.add(h.date);
  });

  let weekendDays = 0;
  let holidayDays = 0;
  let approvedLeaveDays = 0;
  let timesheetSubmittedDays = 0;
  let unappliedDays = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
      continue;
    }

    if (holidayDateSet.has(dStr)) {
      holidayDays++;
      continue;
    }

    if (isApprovedLeave(dStr)) {
      approvedLeaveDays++;
      continue;
    }

    const isPastOrToday = d <= maxDayToCheck;
    const isAfterJoining =
      !joiningDate ||
      isNaN(joiningDate.getTime()) ||
      dateObj >= new Date(joiningDate.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());

    if (timesheetDates.has(dStr) || isApprovedWFH(dStr)) {
      timesheetSubmittedDays++;
    } else if (isPastOrToday && isAfterJoining) {
      unappliedDays++;
    }
  }

  const perDaySalary = totalDays > 0 ? grossSalary / totalDays : 0;
  const lopDeductionAmount = Math.round(unappliedDays * perDaySalary);
  const paidDays = Math.max(0, totalDays - unappliedDays);
  const workingDaysExpected = totalDays - weekendDays - holidayDays;

  return {
    totalDaysInMonth: totalDays,
    weekendDays,
    holidayDays,
    approvedLeaveDays,
    workingDaysExpected,
    timesheetSubmittedDays,
    unappliedDays,
    perDaySalary,
    lopDeductionAmount,
    paidDays,
  };
}

export function generateMonthlyPayslips(
  employee: EmployeeData,
  structure: EmployeeSalaryStructure,
  year = 2026,
  timesheets: TimesheetEntry[] = [],
  leaves: LeaveRequest[] = [],
  wfhList: WFHRequest[] = [],
  holidays: HolidayItem[] = []
): MonthlyPayslip[] {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const empKey = employee.id || employee.employeeId;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  const payslips: MonthlyPayslip[] = [];

  const joiningDate = employee.dateOfJoining ? new Date(employee.dateOfJoining) : new Date(2025, 0, 1);
  const joiningYear = isNaN(joiningDate.getTime()) ? 2025 : joiningDate.getFullYear();
  const joiningMonthIdx = isNaN(joiningDate.getTime()) ? 0 : joiningDate.getMonth();

  for (let m = 0; m < 12; m++) {
    const isPastOrCurrent =
      year < currentYear || (year === currentYear && m <= currentMonthIdx);

    const isAfterJoining =
      year > joiningYear || (year === joiningYear && m >= joiningMonthIdx);

    if (!isAfterJoining) continue;

    const monthName = monthNames[m];
    const displayMonth = `${monthName} ${year}`;
    const paymentDate = `01 ${monthName.slice(0, 3)} ${year}`;

    const absence = calculateMonthlyTimesheetAbsences(
      employee,
      year,
      m,
      structure.grossSalary,
      timesheets,
      leaves,
      wfhList,
      holidays
    );

    let deductions = [...structure.deductions];
    if (absence.unappliedDays > 0) {
      deductions = [
        ...deductions,
        {
          id: `ded-lop-${year}-${m + 1}`,
          name: "Leaves",
          amount: absence.lopDeductionAmount,
        },
      ];
    }

    const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const netPay = Math.max(0, structure.grossSalary - totalDeductions);

    payslips.push({
      id: `payslip-${empKey}-${year}-${m + 1}`,
      employeeId: empKey,
      month: displayMonth,
      year,
      monthIndex: m,
      paymentDate,
      workingDays: absence.totalDaysInMonth,
      paidDays: absence.paidDays,
      earnings: structure.earnings,
      deductions,
      grossSalary: structure.grossSalary,
      totalDeductions,
      netPay,
      status: isPastOrCurrent ? "Generated" : "Processing",
    });
  }

  return payslips.sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);
}

export const LOCAL_STORAGE_KEY_SAVED_PAYSLIPS = "gamanext_saved_payslips";

export function buildPayslipForMonth(
  employee: EmployeeData,
  structure: EmployeeSalaryStructure,
  year: number,
  monthIndex: number, // 0 to 11
  timesheets: TimesheetEntry[] = [],
  leaves: LeaveRequest[] = [],
  wfhList: WFHRequest[] = [],
  holidays: HolidayItem[] = []
): MonthlyPayslip {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const empKey = employee.id || employee.employeeId;
  const monthName = monthNames[monthIndex];
  const displayMonth = `${monthName} ${year}`;
  const paymentDate = `01 ${monthName.slice(0, 3)} ${year}`;

  const absence = calculateMonthlyTimesheetAbsences(
    employee,
    year,
    monthIndex,
    structure.grossSalary,
    timesheets,
    leaves,
    wfhList,
    holidays
  );

  let deductions = [...structure.deductions];
  if (absence.unappliedDays > 0) {
    deductions = [
      ...deductions,
      {
        id: `ded-lop-${year}-${monthIndex + 1}`,
        name: "Leaves",
        amount: absence.lopDeductionAmount,
      },
    ];
  }

  const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netPay = Math.max(0, structure.grossSalary - totalDeductions);

  return {
    id: `payslip-${empKey}-${year}-${monthIndex + 1}`,
    employeeId: empKey,
    month: displayMonth,
    year,
    monthIndex,
    paymentDate,
    workingDays: absence.totalDaysInMonth,
    paidDays: absence.paidDays,
    earnings: structure.earnings,
    deductions,
    grossSalary: structure.grossSalary,
    totalDeductions,
    netPay,
    status: "Generated",
  };
}

export async function getSavedPayslipsForEmployee(
  employeeId: string,
  year?: number | string
): Promise<MonthlyPayslip[]> {
  const payslipMap = new Map<string, MonthlyPayslip>();

  try {
    const q = query(
      collection(db, "payslips"),
      where("employeeId", "==", employeeId)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() } as MonthlyPayslip;
      const key = `${data.employeeId}-${data.year}-${data.monthIndex}`;
      payslipMap.set(key, data);
    });
  } catch (e) {}

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED_PAYSLIPS);
    if (data) {
      try {
        const list: MonthlyPayslip[] = JSON.parse(data);
        list.forEach((p) => {
          if (p.employeeId === employeeId) {
            const key = `${p.employeeId}-${p.year}-${p.monthIndex}`;
            if (!payslipMap.has(key)) {
              payslipMap.set(key, p);
            }
          }
        });
      } catch (e) {}
    }
  }

  const list = Array.from(payslipMap.values());
  const filtered = year && year !== "All"
    ? list.filter((p) => String(p.year) === String(year))
    : list;
  return filtered.sort((a, b) => (b.year - a.year) || (b.monthIndex - a.monthIndex));
}

export async function saveGeneratedPayslip(payslip: MonthlyPayslip): Promise<MonthlyPayslip> {
  const itemToSave = {
    ...payslip,
  };

  try {
    if (itemToSave.id && !itemToSave.id.startsWith("payslip-")) {
      const { id, ...data } = itemToSave;
      await updateDoc(doc(db, "payslips", itemToSave.id), data);
    } else {
      const docRef = await addDoc(collection(db, "payslips"), itemToSave);
      itemToSave.id = docRef.id;
    }
  } catch (e) {
    if (!itemToSave.id) {
      itemToSave.id = `payslip-${payslip.employeeId}-${payslip.year}-${payslip.monthIndex + 1}-${Date.now()}`;
    }
  }

  if (typeof window !== "undefined") {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED_PAYSLIPS);
    const existing: MonthlyPayslip[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = existing.filter(
      (p) => !(p.employeeId === payslip.employeeId && p.year === payslip.year && p.monthIndex === payslip.monthIndex)
    );
    updated.unshift(itemToSave);
    localStorage.setItem(LOCAL_STORAGE_KEY_SAVED_PAYSLIPS, JSON.stringify(updated));
  }

  return itemToSave;
}

export async function deleteSavedPayslip(id: string): Promise<boolean> {
  try {
    if (id && !id.startsWith("payslip-")) {
      await deleteDoc(doc(db, "payslips", id));
    }
  } catch (e) {}

  if (typeof window !== "undefined") {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED_PAYSLIPS);
    if (existingStr) {
      try {
        const existing: MonthlyPayslip[] = JSON.parse(existingStr);
        const filtered = existing.filter((p) => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_SAVED_PAYSLIPS, JSON.stringify(filtered));
      } catch (e) {}
    }
  }
  return true;
}

export function amountInWords(num: number): string {
  if (num <= 0) return "Rupees Zero Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if (n === 0) return "";
    let str = "";
    if (Math.floor(n / 10000000) > 0) {
      str += inWords(Math.floor(n / 10000000)) + "Crore ";
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      str += inWords(Math.floor(n / 100000)) + "Lakh ";
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      str += inWords(Math.floor(n / 1000)) + "Thousand ";
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      str += inWords(Math.floor(n / 100)) + "Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (str !== "") str += "and ";
      if (n < 20) {
        str += a[n];
      } else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
      }
    }
    return str;
  }

  const result = inWords(Math.round(num)).trim();
  return `Rupees ${result} Only`;
}
