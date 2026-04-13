"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import { employerApi, type Application } from "../../../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  SHORTLISTED: "bg-amber-100 text-amber-700",
  INTERVIEW_SCHEDULED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

type ActionState = "idle" | "loading";

export default function CandidateDetailPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const params = useParams();
  const id = params.id as string;

  const [candidate, setCandidate] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  // Interview modal state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchCandidate = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const res = await employerApi.getCandidate(token, id);
      setCandidate(res.candidate);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load candidate");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken, id]);

  useEffect(() => {
    if (isLoaded) fetchCandidate();
  }, [isLoaded, fetchCandidate]);

  async function handleConfirmHire() {
    if (!candidate) return;
    setActionState("loading");
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const res = await employerApi.approveCandidate(token, candidate.id);
      setCandidate(res.candidate);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionState("idle");
    }
  }

  async function handleRejectSubmit() {
    if (!candidate) return;
    setActionState("loading");
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const res = await employerApi.rejectCandidate(
        token,
        candidate.id,
        rejectNotes || undefined
      );
      setCandidate(res.candidate);
      setShowRejectModal(false);
      setRejectNotes("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionState("idle");
    }
  }

  async function handleInterviewSubmit() {
    if (!candidate || !interviewDate) return;
    setActionState("loading");
    setActionError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const res = await employerApi.scheduleInterview(token, candidate.id, {
        interviewDate,
        notes: interviewNotes || undefined,
      });
      setCandidate(res.candidate);
      setShowInterviewModal(false);
      setInterviewDate("");
      setInterviewNotes("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionState("idle");
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-5xl">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-28 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
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
            onClick={fetchCandidate}
            className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  const firstName = candidate.student.user.firstName ?? "";
  const lastName = candidate.student.user.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || candidate.student.user.email;
  const statusColor = STATUS_COLORS[candidate.status] ?? "bg-gray-100 text-gray-600";
  const statusLabel = STATUS_LABELS[candidate.status] ?? candidate.status;
  const verified = candidate.student.documents.some(
    (d) => d.geminiVerified || d.verificationStatus === "VERIFIED"
  );

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/candidates"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Candidates
      </Link>

      {/* Candidate header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {candidate.student.user.avatarUrl ? (
            <img
              src={candidate.student.user.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-amber-700">
                {firstName[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{fullName}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                {statusLabel}
              </span>
              {verified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Docs Verified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{candidate.student.user.email}</p>
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Program:</span>{" "}
              <span className="font-medium">{candidate.program.title}</span>
              {" · "}
              <span className="text-gray-500">{candidate.program.university.name}</span>
            </p>
          </div>

          {candidate.aiScore != null && (
            <div className="flex-shrink-0 text-center">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${
                  candidate.aiScore >= 80
                    ? "bg-green-100 text-green-700"
                    : candidate.aiScore >= 60
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {candidate.aiScore}
              </div>
              <p className="text-xs text-gray-400 mt-1">AI Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Education */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Education</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {candidate.student.institution && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Institution</p>
                  <p className="text-gray-900 font-medium">{candidate.student.institution}</p>
                </div>
              )}
              {candidate.student.highestEducation && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Level</p>
                  <p className="text-gray-900">{candidate.student.highestEducation}</p>
                </div>
              )}
              {candidate.student.fieldOfStudy && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Field of Study</p>
                  <p className="text-gray-900">{candidate.student.fieldOfStudy}</p>
                </div>
              )}
              {candidate.student.graduationYear && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Graduation Year</p>
                  <p className="text-gray-900">{candidate.student.graduationYear}</p>
                </div>
              )}
              {candidate.student.gpa != null && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">GPA</p>
                  <p className="text-gray-900 font-medium">{candidate.student.gpa.toFixed(2)}</p>
                </div>
              )}
              {candidate.student.mathGrade && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Math Grade</p>
                  <p className="text-gray-900">{candidate.student.mathGrade}</p>
                </div>
              )}
              {candidate.student.englishGrade && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">English Grade</p>
                  <p className="text-gray-900">{candidate.student.englishGrade}</p>
                </div>
              )}
              {!candidate.student.institution &&
                !candidate.student.highestEducation &&
                !candidate.student.gpa &&
                !candidate.student.mathGrade &&
                !candidate.student.englishGrade && (
                  <p className="text-gray-400 text-sm col-span-2">No education details provided.</p>
                )}
            </div>
          </div>

          {/* Motivation letter */}
          {candidate.motivationLetter ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Motivation Letter</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {candidate.motivationLetter}
              </p>
            </div>
          ) : null}

          {/* Documents */}
          {candidate.student.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {candidate.student.documents.map((doc) => {
                  const isVerified =
                    doc.geminiVerified || doc.verificationStatus === "VERIFIED";
                  const isRejected = doc.verificationStatus === "REJECTED";
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-400">{doc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-700"
                              : isRejected
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isVerified ? "Verified" : isRejected ? "Rejected" : "Pending"}
                        </span>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: Action Panel ── */}
        <div className="space-y-4">
          {/* ACCEPTED banner */}
          {candidate.status === "ACCEPTED" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-emerald-800 font-bold text-base">Candidate Hired</p>
              <p className="text-emerald-600 text-sm mt-1">
                This candidate has been successfully hired.
              </p>
            </div>
          )}

          {/* REJECTED banner */}
          {candidate.status === "REJECTED" && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-gray-700 font-semibold text-sm">Candidate Rejected</p>
              </div>
              {candidate.rejectionReason && (
                <p className="text-gray-500 text-sm leading-relaxed">{candidate.rejectionReason}</p>
              )}
            </div>
          )}

          {/* INTERVIEW_SCHEDULED: show date + Confirm Hire + Reject */}
          {candidate.status === "INTERVIEW_SCHEDULED" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Action Panel</h2>

              {candidate.interviewDate && (
                <div className="bg-blue-50 rounded-lg border border-blue-100 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs font-semibold text-blue-700">Interview Scheduled</p>
                  </div>
                  <p className="text-xs text-blue-600">
                    {new Date(candidate.interviewDate).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {candidate.interviewNotes && (
                    <p className="mt-1 text-xs text-blue-500">{candidate.interviewNotes}</p>
                  )}
                </div>
              )}

              {actionError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {actionError}
                </p>
              )}

              <button
                onClick={handleConfirmHire}
                disabled={actionState === "loading"}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionState === "loading" ? "Processing..." : "Confirm Hire"}
              </button>

              <button
                onClick={() => setShowInterviewModal(true)}
                disabled={actionState === "loading"}
                className="w-full py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reschedule Interview
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionState === "loading"}
                className="w-full py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          )}

          {/* SHORTLISTED: Schedule Interview + Reject */}
          {candidate.status === "SHORTLISTED" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Action Panel</h2>

              {actionError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {actionError}
                </p>
              )}

              <button
                onClick={() => setShowInterviewModal(true)}
                disabled={actionState === "loading"}
                className="w-full py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Interview
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionState === "loading"}
                className="w-full py-2.5 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          )}

          {/* Application meta */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
            <h2 className="text-sm font-semibold text-gray-900">Application Details</h2>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Application #</p>
              <p className="font-mono text-xs text-gray-700">{candidate.applicationNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Applied On</p>
              <p className="text-gray-700">
                {new Date(candidate.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Job Role</p>
              <p className="text-gray-700">{candidate.program.jobRole}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Field</p>
              <p className="text-gray-700">{candidate.program.field}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interview modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Schedule Interview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any instructions or context..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleInterviewSubmit}
                disabled={!interviewDate || actionState === "loading"}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionState === "loading" ? "Scheduling..." : "Confirm"}
              </button>
              <button
                onClick={() => {
                  setShowInterviewModal(false);
                  setInterviewDate("");
                  setInterviewNotes("");
                }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Reject Candidate</h2>
            <p className="text-sm text-gray-500 mb-5">
              This will mark{" "}
              <span className="font-semibold text-gray-700">{fullName}</span> as rejected.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason / Notes (optional)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={3}
                placeholder="Provide feedback or reason for rejection..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRejectSubmit}
                disabled={actionState === "loading"}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionState === "loading" ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectNotes("");
                }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
