// Admin Portal API Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string | null;
  isVerified: boolean;
  _count?: { programs: number; admins: number };
}

export interface Employer {
  id: string;
  name: string;
  industry: string | null;
  isVerified: boolean;
  _count?: { programs: number; admins: number };
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  field: string;
  status: string;
  university: { name: string; shortName: string | null };
  employer: { name: string };
  _count?: { applications: number };
}

export interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  student: {
    user: { firstName: string | null; lastName: string | null; email: string }
  };
  program: {
    title: string;
    university: { name: string };
    employer: { name: string };
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalUniversities: number;
  totalEmployers: number;
  totalPrograms: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentApplications: Application[];
}

// API Functions
export const adminApi = {
  // Dashboard
  dashboard: (token: string) =>
    apiRequest<DashboardResponse>("/admin/dashboard", { token }),

  // Users
  users: {
    list: (token: string, params?: { page?: number; limit?: number; role?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.role) searchParams.set("role", params.role);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return apiRequest<{ users: User[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
        `/admin/users${query ? `?${query}` : ""}`,
        { token }
      );
    },
    get: (token: string, id: string) =>
      apiRequest<{ user: User }>(`/admin/users/${id}`, { token }),
    update: (token: string, id: string, data: { role?: string; isActive?: boolean }) =>
      apiRequest<{ user: User }>(`/admin/users/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
  },

  // Universities
  universities: {
    list: (token: string) =>
      apiRequest<{ universities: University[] }>("/admin/universities", { token }),
    create: (token: string, data: Partial<University>) =>
      apiRequest<{ university: University }>("/admin/universities", {
        method: "POST",
        token,
        body: data,
      }),
    update: (token: string, id: string, data: Partial<University>) =>
      apiRequest<{ university: University }>(`/admin/universities/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
  },

  // Employers
  employers: {
    list: (token: string) =>
      apiRequest<{ employers: Employer[] }>("/admin/employers", { token }),
    create: (token: string, data: Partial<Employer>) =>
      apiRequest<{ employer: Employer }>("/admin/employers", {
        method: "POST",
        token,
        body: data,
      }),
    update: (token: string, id: string, data: Partial<Employer>) =>
      apiRequest<{ employer: Employer }>(`/admin/employers/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
  },

  // Programs
  programs: {
    list: (token: string, params?: { page?: number; limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.status) searchParams.set("status", params.status);
      const query = searchParams.toString();
      return apiRequest<{ programs: Program[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
        `/admin/programs${query ? `?${query}` : ""}`,
        { token }
      );
    },
    create: (token: string, data: Record<string, unknown>) =>
      apiRequest<{ program: Program }>("/admin/programs", {
        method: "POST",
        token,
        body: data,
      }),
    update: (token: string, id: string, data: Record<string, unknown>) =>
      apiRequest<{ program: Program }>(`/admin/programs/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
    delete: (token: string, id: string) =>
      apiRequest<{ success: boolean }>(`/admin/programs/${id}`, {
        method: "DELETE",
        token,
      }),
  },

  // Admin Assignment
  assign: {
    universityAdmin: (token: string, data: { userId: string; universityId: string; title?: string; department?: string }) =>
      apiRequest<{ universityAdmin: unknown }>("/admin/assign/university-admin", {
        method: "POST",
        token,
        body: data,
      }),
    employerAdmin: (token: string, data: { userId: string; employerId: string; title?: string; department?: string }) =>
      apiRequest<{ employerAdmin: unknown }>("/admin/assign/employer-admin", {
        method: "POST",
        token,
        body: data,
      }),
  },

  // Applications
  applications: {
    list: (token: string, params?: { page?: number; limit?: number; status?: string; programId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.status) searchParams.set("status", params.status);
      if (params?.programId) searchParams.set("programId", params.programId);
      const query = searchParams.toString();
      return apiRequest<{ applications: Application[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
        `/admin/applications${query ? `?${query}` : ""}`,
        { token }
      );
    },
  },
};
