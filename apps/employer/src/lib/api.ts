// Employer Portal API Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token: string;
};

async function apiRequest<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const { method = "GET", body, token } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "ACCEPTED"
  | "REJECTED";

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

export interface Document {
  id: string;
  type: string;
  name: string;
  fileUrl: string;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  geminiVerified?: boolean;
}

export interface Student {
  id: string;
  highestEducation: string | null;
  institution: string | null;
  graduationYear: number | null;
  fieldOfStudy: string | null;
  gpa: number | null;
  mathGrade: string | null;
  englishGrade: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  documents: Document[];
}

export interface Application {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  motivationLetter: string | null;
  interviewDate: string | null;
  interviewScore: number | null;
  interviewNotes: string | null;
  rejectionReason: string | null;
  aiScore: number | null;
  shortlistedAt: string | null;
  createdAt: string;
  student: Student;
  program: Program;
}

export interface DashboardStats {
  totalPrograms: number;
  totalCandidates: number;
  shortlisted: number;
  hiredCount: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentCandidates: Application[];
}

export interface ProgramsResponse {
  programs: Program[];
}

export interface CandidatesResponse {
  candidates: Application[];
}

export interface CandidateResponse {
  candidate: Application;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const employerApi = {
  dashboard: (token: string): Promise<DashboardResponse> =>
    apiRequest<DashboardResponse>("/employer/dashboard", { token }),

  programs: (token: string): Promise<ProgramsResponse> =>
    apiRequest<ProgramsResponse>("/employer/programs", { token }),

  candidates: (
    token: string,
    params?: { status?: string; programId?: string }
  ): Promise<CandidatesResponse> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.programId) qs.set("programId", params.programId);
    const query = qs.toString();
    return apiRequest<CandidatesResponse>(
      `/employer/candidates${query ? `?${query}` : ""}`,
      { token }
    );
  },

  getCandidate: (token: string, id: string): Promise<CandidateResponse> =>
    apiRequest<CandidateResponse>(`/employer/candidates/${id}`, { token }),

  approveCandidate: (token: string, id: string): Promise<CandidateResponse> =>
    apiRequest<CandidateResponse>(`/employer/candidates/${id}`, {
      method: "PATCH",
      token,
      body: { decision: "APPROVE" },
    }),

  rejectCandidate: (
    token: string,
    id: string,
    notes?: string
  ): Promise<CandidateResponse> =>
    apiRequest<CandidateResponse>(`/employer/candidates/${id}`, {
      method: "PATCH",
      token,
      body: { decision: "REJECT", notes },
    }),

  scheduleInterview: (
    token: string,
    id: string,
    data: { interviewDate: string; notes?: string }
  ): Promise<CandidateResponse> =>
    apiRequest<CandidateResponse>(`/employer/candidates/${id}/interview`, {
      method: "POST",
      token,
      body: data,
    }),
};
