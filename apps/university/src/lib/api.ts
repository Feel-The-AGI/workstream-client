// University Portal API Client

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
  description: string | null;
  website: string | null;
  isVerified: boolean;
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
  field: string;
  jobRole: string;
  totalSlots: number;
  availableSlots: number;
  applicationDeadline: string;
  startDate: string;
  endDate: string;
  status: string;
  isPublished: boolean;
  employer: Employer;
  _count?: { applications: number };
}

export interface Student {
  id: string;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  highestEducation: string | null;
  institution: string | null;
  graduationYear: number | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  meetsRequirements: boolean | null;
  motivationLetter: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  student: Student;
  program: Program;
  documents: Array<{
    document: {
      id: string;
      type: string;
      name: string;
      fileUrl: string;
    };
  }>;
}

export interface DashboardResponse {
  university: University;
  stats: {
    totalPrograms: number;
    activePrograms: number;
    totalApplications: number;
    pendingReview: number;
    shortlisted: number;
  };
  programs: Program[];
}

// API Functions
export const universityApi = {
  // Dashboard
  dashboard: (token: string) =>
    apiRequest<DashboardResponse>("/university/dashboard", { token }),

  // Programs
  programs: {
    list: (token: string) =>
      apiRequest<{ programs: Program[] }>("/university/programs", { token }),
    create: (token: string, data: Partial<Program> & { employerId: string }) =>
      apiRequest<{ program: Program }>("/university/programs", {
        method: "POST",
        token,
        body: data,
      }),
    update: (token: string, id: string, data: Partial<Program>) =>
      apiRequest<{ program: Program }>(`/university/programs/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
    publish: (token: string, id: string) =>
      apiRequest<{ program: Program }>(`/university/programs/${id}/publish`, {
        method: "POST",
        token,
      }),
  },

  // Applications
  applications: {
    list: (token: string, params?: { status?: string; programId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.programId) searchParams.set("programId", params.programId);
      const query = searchParams.toString();
      return apiRequest<{ applications: Application[] }>(
        `/university/applications${query ? `?${query}` : ""}`,
        { token }
      );
    },
    get: (token: string, id: string) =>
      apiRequest<{ application: Application }>(`/university/applications/${id}`, { token }),
    update: (
      token: string,
      id: string,
      data: { status: string; reviewNotes?: string; rejectionReason?: string; interviewDate?: string }
    ) =>
      apiRequest<{ application: Application }>(`/university/applications/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
  },

  // Employers (for program creation)
  employers: (token: string) =>
    apiRequest<{ employers: Employer[] }>("/university/employers", { token }),
};
