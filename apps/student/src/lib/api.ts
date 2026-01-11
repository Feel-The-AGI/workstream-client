// API Client for Workstream Backend

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
export interface University {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
}

export interface Employer {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string | null;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  field: string;
  specialization: string | null;
  jobRole: string;
  totalSlots: number;
  availableSlots: number;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  minEducation: string | null;
  requiredGrades: Record<string, string> | null;
  additionalRequirements: string[];
  applicationFee: number;
  isFunded: boolean;
  stipendAmount: number | null;
  hasInternship: boolean;
  internshipDuration: number | null;
  status: "DRAFT" | "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  isPublished: boolean;
  tags: string[];
  university: University;
  employer: Employer;
  _count?: {
    applications: number;
  };
}

export interface ProgramsResponse {
  programs: Program[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProgramDetailResponse {
  program: Program & {
    cohorts: unknown[];
  };
}

// API Functions
export const api = {
  // Programs
  programs: {
    list: (params?: { field?: string; status?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.field) searchParams.set("field", params.field);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      const query = searchParams.toString();
      return apiRequest<ProgramsResponse>(`/programs${query ? `?${query}` : ""}`);
    },
    get: (slug: string) => apiRequest<ProgramDetailResponse>(`/programs/${slug}`),
  },

  // Auth (requires token)
  auth: {
    sync: (token: string) =>
      apiRequest<{ user: unknown }>("/auth/sync", {
        method: "POST",
        token,
      }),
    me: (token: string) =>
      apiRequest<{ user: unknown }>("/auth/me", {
        token,
      }),
  },

  // Users (requires token)
  users: {
    getProfile: (token: string) =>
      apiRequest<{ profile: unknown }>("/users/profile", {
        token,
      }),
    updateProfile: (token: string, data: unknown) =>
      apiRequest<{ profile: unknown }>("/users/profile", {
        method: "PUT",
        token,
        body: data,
      }),
  },

  // Applications (requires token)
  applications: {
    list: (token: string) =>
      apiRequest<{ applications: unknown[] }>("/applications", {
        token,
      }),
    get: (token: string, id: string) =>
      apiRequest<{ application: unknown }>(`/applications/${id}`, {
        token,
      }),
    create: (token: string, data: { programId: string; motivationLetter?: string }) =>
      apiRequest<{ application: unknown }>("/applications", {
        method: "POST",
        token,
        body: data,
      }),
    submit: (token: string, id: string) =>
      apiRequest<{ application: unknown }>(`/applications/${id}/submit`, {
        method: "POST",
        token,
      }),
  },

  // Documents (requires token)
  documents: {
    list: (token: string) =>
      apiRequest<{ documents: unknown[] }>("/documents", {
        token,
      }),
    get: (token: string, id: string) =>
      apiRequest<{ document: unknown }>(`/documents/${id}`, {
        token,
      }),
    parse: (token: string, id: string) =>
      apiRequest<{ document: unknown }>(`/documents/${id}/parse`, {
        method: "POST",
        token,
      }),
  },
};
