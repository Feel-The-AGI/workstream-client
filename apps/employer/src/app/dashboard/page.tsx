"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { employerApi, type DashboardResponse, type ProgramsResponse } from "../../lib/api";

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function PipelineBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600 truncate">{label}</span>
        <span className="text-xs font-bold text-gray-900 ml-2 flex-shrink-0">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [programs, setPrograms] = useState<ProgramsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        const [dash, progs] = await Promise.all([
          employerApi.dashboard(token),
          employerApi.programs(token),
        ]);
        setDashboard(dash);
        setPrograms(progs);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-1">Check that the API server is running.</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { stats, recentCandidates } = dashboard;

  // Pipeline counts derived from recentCandidates + stats
  const pipelineTotal = stats.totalCandidates || 1;
  const shortlistedCount = stats.shortlisted;
  const interviewCount = recentCandidates.filter(
    (c) => c.status === "INTERVIEW_SCHEDULED"
  ).length;
  const acceptedCount = stats.hiredCount;

  const statCards = [
    {
      label: "Total Programs",
      value: stats.totalPrograms,
      color: "bg-blue-100",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Total Candidates",
      value: stats.totalCandidates,
      color: "bg-purple-100",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Shortlisted",
      value: stats.shortlisted,
      color: "bg-amber-100",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      label: "Confirmed Hires",
      value: stats.hiredCount,
      color: "bg-green-100",
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Candidates Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Candidates Pipeline</h2>
        <div className="flex gap-6">
          <PipelineBar
            label="Shortlisted"
            count={shortlistedCount}
            total={pipelineTotal}
            color="bg-amber-400"
          />
          <div className="flex items-center text-gray-300 flex-shrink-0 mt-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <PipelineBar
            label="Interview Scheduled"
            count={interviewCount}
            total={pipelineTotal}
            color="bg-blue-400"
          />
          <div className="flex items-center text-gray-300 flex-shrink-0 mt-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <PipelineBar
            label="Accepted"
            count={acceptedCount}
            total={pipelineTotal}
            color="bg-green-400"
          />
        </div>
      </div>

      {/* Recent Shortlisted */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Shortlisted</h2>
          <Link
            href="/dashboard/candidates?status=SHORTLISTED"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View all
          </Link>
        </div>
        {recentCandidates.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No shortlisted candidates yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    AI Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Shortlisted
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentCandidates.slice(0, 8).map((candidate) => {
                  const firstName = candidate.student.user.firstName ?? "";
                  const lastName = candidate.student.user.lastName ?? "";
                  const fullName = `${firstName} ${lastName}`.trim() || candidate.student.user.email;
                  const shortlistedDate = candidate.shortlistedAt
                    ? new Date(candidate.shortlistedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";
                  return (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {candidate.student.user.avatarUrl ? (
                            <img
                              src={candidate.student.user.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-amber-700">
                                {firstName[0] ?? "?"}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600 max-w-[160px] truncate">
                        {candidate.program.title}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {candidate.program.university.shortName ??
                          candidate.program.university.name}
                      </td>
                      <td className="px-6 py-3">
                        {candidate.aiScore != null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              candidate.aiScore >= 80
                                ? "bg-green-100 text-green-700"
                                : candidate.aiScore >= 60
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {candidate.aiScore}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{shortlistedDate}</td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/dashboard/candidates/${candidate.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Programs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">My Programs</h2>
        </div>
        {!programs || programs.programs.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No programs found.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {programs.programs.map((program) => {
              const filled = program.totalSlots - program.availableSlots;
              const pct =
                program.totalSlots > 0
                  ? Math.round((filled / program.totalSlots) * 100)
                  : 0;
              const isActive =
                program.status === "OPEN" || program.status === "IN_PROGRESS";
              return (
                <div
                  key={program.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {program.title}
                      </span>
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {program.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {filled}/{program.totalSlots} slots filled
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/candidates?programId=${program.id}`}
                    className="flex-shrink-0 text-xs text-amber-600 hover:text-amber-700 font-medium"
                  >
                    View Candidates
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
