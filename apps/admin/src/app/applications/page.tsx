"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { adminApi, type Application } from "../../lib/api";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function studentName(app: Application): string {
  const { firstName, lastName } = app.student.user;
  if (firstName || lastName) return `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return app.student.user.email;
}

export default function ApplicationsPage() {
  const { getToken } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const data = await adminApi.applications.list(token, {
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [getToken, page, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  // Client-side search filter (search against already-fetched data)
  const filtered = search.trim()
    ? applications.filter((a) => {
        const q = search.toLowerCase();
        return (
          a.applicationNumber.toLowerCase().includes(q) ||
          studentName(a).toLowerCase().includes(q) ||
          a.student.user.email.toLowerCase().includes(q) ||
          a.program.title.toLowerCase().includes(q) ||
          a.program.university.name.toLowerCase().includes(q) ||
          a.program.employer.name.toLowerCase().includes(q)
        );
      })
    : applications;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Applications</h1>
                <p className="text-sm text-gray-500">Review and manage all applications</p>
              </div>
            </div>
            <nav className="flex gap-2">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Dashboard</Link>
              <Link href="/users" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Users</Link>
              <Link href="/universities" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Universities</Link>
              <Link href="/employers" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Employers</Link>
              <Link href="/programs" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Programs</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by app number, student, program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error && <div className="p-6 text-center text-red-600">{error}</div>}
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">App #</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Student</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">University</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Employer</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Submitted</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No applications found</td>
                    </tr>
                  ) : (
                    filtered.map((a) => {
                      return (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {a.applicationNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{studentName(a)}</p>
                            <p className="text-xs text-gray-500">{a.student.user.email}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-700 max-w-[180px] truncate">
                            {a.program.title}
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {a.program.university.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            {a.program.employer.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {a.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {formatDate(a.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/applications/${a.id}`}
                              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} applications
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:border-amber-500 hover:text-amber-600"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:border-amber-500 hover:text-amber-600"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
