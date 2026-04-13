"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { universityApi, type Program } from "../../../lib/api";

const statusColors: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  CLOSED: "bg-red-100 text-red-700",
  COMPLETED: "bg-teal-100 text-teal-700",
};

type Toast = { type: "success" | "error"; message: string };

export default function ProgramsPage() {
  const { getToken } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        const data = await universityApi.programs(token);
        setPrograms(data.programs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load programs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleTogglePublish(program: Program) {
    setPublishingId(program.id);
    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      const data = await universityApi.publishProgram(token, program.id);
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? data.program : p))
      );
      showToast("success", `Program ${data.program.isPublished ? "published" : "unpublished"} successfully.`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to toggle publish");
    } finally {
      setPublishingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{programs.length} program{programs.length !== 1 ? "s" : ""}</p>
        <Link
          href="/dashboard/programs/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No programs yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first programme to start accepting student applications.</p>
          <Link
            href="/dashboard/programs/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Program
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {programs.map((program) => (
            <div key={program.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{program.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[program.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {program.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${program.isPublished ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                      {program.isPublished ? "Published" : "Unpublished"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>Partner: <span className="font-medium text-gray-700">{program.employer.name}</span></span>
                    <span>{program._count?.applications ?? 0} applications</span>
                    <span>{program.availableSlots} / {program.totalSlots} slots available</span>
                    {program.applicationDeadline && (
                      <span>Deadline: {new Date(program.applicationDeadline).toLocaleDateString()}</span>
                    )}
                  </div>
                  {program.description && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{program.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/applications?programId=${program.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(program)}
                    disabled={publishingId === program.id}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                      program.isPublished
                        ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                        : "border-purple-300 bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {publishingId === program.id
                      ? "..."
                      : program.isPublished
                      ? "Unpublish"
                      : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
