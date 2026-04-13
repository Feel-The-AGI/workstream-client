"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { adminApi, type Program } from "../../lib/api";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Open", value: "OPEN" },
  { label: "Closed", value: "CLOSED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-purple-100 text-purple-700",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProgramsPage() {
  const { getToken } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const data = await adminApi.programs.list(token, {
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setPrograms(data.programs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  }, [getToken, page, statusFilter]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      await adminApi.programs.delete(token, deleteTarget.id);
      setDeleteTarget(null);
      fetchPrograms();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete program");
    } finally {
      setDeleting(false);
    }
  }

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
                <h1 className="text-xl font-bold text-gray-900">Program Management</h1>
                <p className="text-sm text-gray-500">Manage internship and placement programs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex gap-2">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Dashboard</Link>
                <Link href="/users" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Users</Link>
                <Link href="/universities" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Universities</Link>
                <Link href="/employers" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600">Employers</Link>
                <Link href="/programs" className="px-3 py-2 text-sm font-medium text-amber-600 border-b-2 border-amber-500">Programs</Link>
              </nav>
              <Link
                href="/programs/new"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Create Program
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 flex overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                statusFilter === tab.value
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-600 hover:text-amber-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Program</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">University</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Employer</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Field</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Applications</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Deadline</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">No programs found</td>
                    </tr>
                  ) : (
                    programs.map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 max-w-xs truncate">{p.title}</p>
                            <p className="text-xs text-gray-500">{p.slug}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <p>{p.university.name}</p>
                            {p.university.shortName && (
                              <p className="text-xs text-gray-400">{p.university.shortName}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{p.employer.name}</td>
                          <td className="px-6 py-4 text-gray-600">{p.field}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {p._count?.applications ?? 0}
                            {p.totalSlots ? ` / ${p.totalSlots}` : ""}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(p.applicationDeadline)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {p.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/programs/${p.id}/edit`}
                                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="text-red-500 hover:text-red-600 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
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
                    Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} programs
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Program</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <span className="font-medium text-gray-700">{deleteTarget.title}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete Program"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
