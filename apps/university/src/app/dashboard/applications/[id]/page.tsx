"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { universityApi, type Application } from "../../../../lib/api";

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  DRAFT: "bg-gray-100 text-gray-700",
  ENROLLED: "bg-teal-100 text-teal-700",
};

const REVIEW_STATUSES = [
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

type Toast = { type: "success" | "error"; message: string };

export default function ApplicationDetailPage() {
  const { getToken } = useAuth();
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        const data = await universityApi.getApplication(token, id);
        setApplication(data.application);
        setReviewStatus(data.application.status);
        setReviewNotes(data.application.reviewNotes ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken, id]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSaveReview() {
    if (!application) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No authentication token");
      const data = await universityApi.reviewApplication(token, application.id, {
        status: reviewStatus,
        reviewNotes: reviewNotes || undefined,
      });
      setApplication(data.application);
      showToast("success", "Review saved successfully.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Application not found</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Link href="/dashboard/applications" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const { student, program } = application;
  const fullName = `${student.user.firstName ?? ""} ${student.user.lastName ?? ""}`.trim();

  return (
    <div className="p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Back button */}
      <Link
        href="/dashboard/applications"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Applications
      </Link>

      {/* Application header */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-purple-700">
                {(student.user.firstName?.[0] ?? "") + (student.user.lastName?.[0] ?? "")}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{fullName || "Unknown Applicant"}</h2>
              <p className="text-sm text-gray-500">{student.user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {application.applicationNumber}
            </span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[application.status] ?? "bg-gray-100 text-gray-700"}`}>
              {application.status.replace(/_/g, " ")}
            </span>
            {application.submittedAt && (
              <span className="text-xs text-gray-500">
                Submitted {new Date(application.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700">
            Program: <span className="text-gray-900">{program.title}</span>
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — applicant details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Education & Profile */}
          <div className="bg-white rounded-xl shadow-sm px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Applicant Profile</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Highest Education</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{student.highestEducation || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Institution</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{student.institution || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Graduation Year</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{student.graduationYear ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">GPA</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{student.gpa || "—"}</dd>
              </div>
              {student.grades && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Grades</dt>
                  <dd className="font-medium text-gray-900 mt-0.5 whitespace-pre-line">{student.grades}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Nationality</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{student.nationality || "—"}</dd>
              </div>
              {application.aiScore != null && (
                <div>
                  <dt className="text-gray-500">AI Score</dt>
                  <dd className={`font-bold mt-0.5 text-base ${application.aiScore >= 70 ? "text-green-600" : application.aiScore >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                    {application.aiScore}%
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Motivation Letter */}
          {application.motivationLetter && (
            <div className="bg-white rounded-xl shadow-sm px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Motivation Letter</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {application.motivationLetter}
              </div>
            </div>
          )}

          {/* Documents */}
          {application.documents.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Documents ({application.documents.length})
              </h3>
              <div className="space-y-2">
                {application.documents.map((doc) => (
                  <a
                    key={doc.document.id}
                    href={doc.document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.document.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{doc.document.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.document.isVerified != null && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${doc.document.isVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {doc.document.isVerified ? "Verified" : "Unverified"}
                        </span>
                      )}
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Review panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm px-6 py-5 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Review Panel</h3>

            {/* Current status */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1.5">Current Status</p>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[application.status] ?? "bg-gray-100 text-gray-700"}`}>
                {application.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Status change */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1.5">Change Status</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {REVIEW_STATUSES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Review notes */}
            <div className="mb-5">
              <label className="block text-xs text-gray-500 mb-1.5">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={5}
                placeholder="Add notes about this application..."
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveReview}
              disabled={saving}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Review"
              )}
            </button>

            {/* Last reviewed */}
            {application.reviewedAt && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Last reviewed {new Date(application.reviewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
