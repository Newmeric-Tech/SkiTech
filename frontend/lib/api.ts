import axios from "axios";

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_BASE = `${API_ROOT}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skitech_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("skitech_refresh_token");
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
          localStorage.setItem("skitech_access_token", data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          localStorage.removeItem("skitech_access_token");
          localStorage.removeItem("skitech_refresh_token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserPayload {
  user_id: string;
  tenant_id: string;
  role: string;
}

export const authApi = {
  login: (email: string, password: string, expectedRole?: string) =>
    api.post<LoginResponse>("/auth/login", { email, password, expected_role: expectedRole }),

  superadminLogin: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/superadmin-login", { email, password }),

  register: (email: string, password: string, role: string, tenant_id: string) =>
    api.post("/auth/register", { email, password, role, tenant_id }),

  refresh: (refreshToken: string) =>
    api.post<{ access_token: string }>("/auth/refresh", { refresh_token: refreshToken }),

  verifyOtp: (email: string, otp: string) =>
    api.post("/auth/verify-otp", { email, otp }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, otp, new_password: newPassword }),

  logout: () => api.post("/auth/logout"),
};

// ─────────────────────────────────────────────────────────────
// Backend response shapes (mirrors app/schemas/schemas.py)
// ─────────────────────────────────────────────────────────────
export interface UserRecord {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  role_id: string;
  tenant_id: string;
  property_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
}

export interface PropertyRecord {
  id: string;
  tenant_id: string;
  name: string;
  property_type?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status?: string | null;
  total_rooms?: number | null;
  created_at?: string;
}

export interface RevenueDay { day: string; revenue: number }
export interface WeeklyTaskDay { day: string; done: number; total: number }
export interface AlertItem {
  type: string; title: string; property_name: string; time_ago: string; severity: string;
}
export interface TaskItem {
  id: string; task: string; assignee: string; due: string; status: string;
}
export interface StaffAttendanceItem {
  name: string; dept: string; check_in: string | null; status: string; initials: string;
}

export interface OwnerStats {
  total_properties: number;
  total_staff: number;
  daily_revenue: number;
  pending_tasks: number;
  overdue_tasks: number;
  revenue_trend: RevenueDay[];
  recent_alerts: AlertItem[];
}

export interface ManagerStats {
  staff_present: number;
  staff_total: number;
  tasks_pending: number;
  tasks_overdue: number;
  checkins_today: number;
  daily_revenue: number;
  todays_tasks: TaskItem[];
  staff_attendance: StaffAttendanceItem[];
  weekly_tasks: WeeklyTaskDay[];
}

export interface StaffStats {
  shift_hours: number;
  my_tasks_today: number;
  my_tasks_overdue: number;
  completed_this_week: number;
  pending_sops: number;
  todays_tasks: TaskItem[];
  weekly_performance: WeeklyTaskDay[];
}

export interface AuditLogEntry {
  id?: string;
  action?: string;
  actor?: string;
  actor_email?: string;
  resource?: string;
  resource_type?: string;
  ip?: string;
  created_at?: string;
  [k: string]: unknown;
}

export interface AuditLogResponse {
  total: number;
  page: number;
  limit: number;
  logs: AuditLogEntry[];
}

// ─────────────────────────────────────────────────────────────
// Dashboard / data helpers
// ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  getMe: () => api.get<UserRecord>("/users/me"),
  getOwnerStats: () => api.get<OwnerStats>("/stats/owner"),
  getManagerStats: (propertyId: string) => api.get<ManagerStats>(`/stats/manager/${propertyId}`),
  getStaffStats: () => api.get<StaffStats>("/stats/staff/me"),

  listProperties: () => api.get<PropertyRecord[]>("/properties/"),
  getProperty: (id: string) => api.get<PropertyRecord>(`/properties/${id}`),
  listPropertyOwners: (propertyId: string) => api.get(`/properties/${propertyId}/owner`),
  listUsers: () => api.get<UserRecord[]>("/users/"),
  listAuditLog: (limit = 50) => api.get<AuditLogResponse>(`/reports/audit?limit=${limit}`),
  getOccupancyReport: () => api.get("/reports/occupancy"),
  listDepartments: (propertyId: string) => api.get(`/departments/${propertyId}`),
  listEmployees: (propertyId: string) => api.get(`/employees/${propertyId}`),
  listVendors: (propertyId: string) => api.get(`/vendors/${propertyId}`),
  listInventory: (propertyId: string) => api.get(`/inventory/${propertyId}`),
  listSopCategories: (propertyId: string) => api.get(`/sop/categories/${propertyId}`),
  listSops: (propertyId: string) => api.get(`/sop/items/${propertyId}`),
  listWorkflows: () => api.get("/governance/workflows"),
  listWorkflowInstances: () => api.get("/governance/instances"),
  listRooms: (propertyId: string) => api.get(`/rooms/${propertyId}`),
  listBookings: (propertyId: string) => api.get(`/rooms/${propertyId}/bookings`),
  // Health is mounted at the app root, not under /api/v1
  getHealth: () => axios.get(`${API_ROOT}/health`),
};
