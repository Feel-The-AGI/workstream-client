// Employer Portal API Client

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
export interface Employer {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  industry: string | null;
  isVerified: boolean;
}

export interface University {
  id: string;
  name: string;
  shortName: string | null;
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
  status: string;
  university: University;
  _count?: { applications: number };
}

export interface Student {
  id: string;
  highestEducation: string | null;
  institution: string | null;
  graduationYear: number | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  documents: Array<{
    id: string;
    type: string;
    name: string;
    fileUrl: string;
  }>;
}

export interface Candidate {
  id: string;
  applicationNumber: string;
  status: string;
  motivationLetter: string | null;
  interviewDate: string | null;
  interviewScore: number | null;
  interviewNotes: string | null;
  student: Student;
  program: Program;
}

export interface DashboardResponse {
  employer: Employer;
  stats: {
    totalPrograms: number;
    activePrograms: number;
    totalCandidates: number;
    pendingReview: number;
    hired: number;
  };
  programs: Program[];
}

// API Functions
export const employerApi = {
  // Dashboard
  dashboard: (token: string) =>
    apiRequest<DashboardResponse>("/employer/dashboard", { token }),

  // Programs
  programs: {
    list: (token: string) =>
      apiRequest<{ programs: Program[] }>("/employer/programs", { token }),
  },

  // Candidates
  candidates: {
    list: (token: string, params?: { status?: string; programId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.programId) searchParams.set("programId", params.programId);
      const query = searchParams.toString();
      return apiRequest<{ candidates: Candidate[] }>(
        `/employer/candidates${query ? `?${query}` : ""}`,
        { token }
      );
    },
    get: (token: string, id: string) =>
      apiRequest<{ candidate: Candidate }>(`/employer/candidates/${id}`, { token }),
    update: (token: string, id: string, data: { decision: "APPROVE" | "REJECT"; notes?: string; interviewScore?: number }) =>
      apiRequest<{ candidate: Candidate }>(`/employer/candidates/${id}`, {
        method: "PATCH",
        token,
        body: data,
      }),
    scheduleInterview: (token: string, id: string, data: { interviewDate: string; notes?: string }) =>
      apiRequest<{ candidate: Candidate }>(`/employer/candidates/${id}/interview`, {
        method: "POST",
        token,
        body: data,
      }),
  },

  // Universities
  universities: (token: string) =>
    apiRequest<{ universities: University[] }>("/employer/universities", { token }),
};
