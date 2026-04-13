"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { employerApi, type Application, type Program } from "../../../lib/api";

type StatusFilter = "ALL" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "ACCEPTED" | "REJECTED";

const STATUS_LABELS: Record<string, string> = {
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  SHORTLISTED: "bg-green-100 text-green-700",
  INTERVIEW_SCHEDULED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

function scoreColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

export default function CandidatesPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [candidates, setCandidates] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusParam = (searchParams.get("status") ?? "ALL") as StatusFilter;
  const programIdParam = searchParams.get("programId") ?? "";

  const fetchData = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      const params: { status?: string; programId?: string } = {};
      if (statusParam !== "ALL") params.status = statusParam;
      if (programIdParam) params.programId = programIdParam;

      const [candidatesRes, programsRes] = await Promise.all([
        employerApi.candidates(token, params),
        employerApi.programs(token),
      ]);
      setCandidates(candidatesRes.candidates);
      setPrograms(programsRes.programs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken, statusParam, programIdParam]);

  useEffect(() => {
    if (isLoaded) fetchData();
  }, [isLoaded, fetchData]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/candidates?${params.toString()}`);
  }

  if (!isLoaded || loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
        {/* Program filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Program
          </label>
          <select
            value={programIdParam}
            onChange={(e) => setFilter("programId", e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter("status", f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusParam === f.value
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-gray-500">
          {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Candidate cards */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-500 font-medium">No candidates found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => {
            const firstName = candidate.student.user.firstName ?? "";
            const lastName = candidate.student.user.lastName ?? "";
            const fullName =
              `${firstName} ${lastName}`.trim() || candidate.student.user.email;
            const statusColor =
              STATUS_COLORS[candidate.status] ?? "bg-gray-100 text-gray-600";
            const statusLabel =
              STATUS_LABELS[candidate.status] ?? candidate.status;
            const verified = candidate.student.documents.some(
              (d) => d.geminiVerified || d.verificationStatus === "VERIFIED"
            );

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {candidate.student.user.avatarUrl ? (
                      <img
                        src={candidate.student.user.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-amber-700">
                          {firstName[0] ?? "?"}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{fullName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {candidate.student.user.email}
                      </p>
                    </div>
                  </div>
                  {candidate.aiScore != null && (
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${scoreColor(
                        candidate.aiScore
                      )}`}
                    >
                      AI {candidate.aiScore}
                    </span>
                  )}
                </div>

                {/* Program & university */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-medium truncate">
                    {candidate.program.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {candidate.program.university.name}
                  </p>
                </div>

                {/* Status + verification */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                  {verified ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Unverified</span>
                  )}
                </div>

                <Link
                  href={`/dashboard/candidates/${candidate.id}`}
                  className="mt-auto block w-full text-center py-2 px-4 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
