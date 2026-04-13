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

export interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

export interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  motivationLetter: string | null;
  submittedAt: string | null;
  createdAt: string;
  program: Program & { university: University; employer: Employer };
  payments: Payment[];
}

export interface Document {
  id: string;
  type: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: string;
  parsedData: unknown | null;
  uploadedAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  role: string;
  student: {
    id: string;
    phone: string | null;
    location: string | null;
    bio: string | null;
    dateOfBirth: string | null;
    institution: string | null;
    degree: string | null;
    fieldOfStudy: string | null;
    currentYear: number | null;
    expectedGraduation: string | null;
    cgpa: number | null;
    profileComplete: boolean;
  } | null;
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
      apiRequest<{ profile: UserProfile }>("/users/profile", {
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
      apiRequest<{ applications: Application[] }>("/applications", {
        token,
      }),
    get: (token: string, id: string) =>
      apiRequest<{ application: Application }>(`/applications/${id}`, {
        token,
      }),
    create: (token: string, data: { programId: string; motivationLetter?: string }) =>
      apiRequest<{ application: Application }>("/applications", {
        method: "POST",
        token,
        body: data,
      }),
    submit: (token: string, id: string) =>
      apiRequest<{ application: Application }>(`/applications/${id}/submit`, {
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
    create: (
      token: string,
      data: {
        type: string;
        name: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
      }
    ) =>
      apiRequest<{ document: unknown }>("/documents", {
        method: "POST",
        token,
        body: data,
      }),
  },

  // Payments (requires token)
  payments: {
    initialize: (
      token: string,
      data: {
        applicationId: string;
        amount: number;
        email: string;
        callbackUrl: string;
      }
    ) =>
      apiRequest<{ authorization_url: string; reference: string }>(
        "/payments/initialize",
        { method: "POST", token, body: data }
      ),
    verify: (token: string, reference: string) =>
      apiRequest<{ payment: unknown; application: unknown }>(
        `/payments/verify/${reference}`,
        { token }
      ),
  },
};
