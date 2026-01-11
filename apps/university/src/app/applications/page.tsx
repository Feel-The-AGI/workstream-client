"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { universityApi, type Application } from "../../lib/api";

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  DRAFT: "bg-gray-100 text-gray-700",
};

export default function ApplicationsPage() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const programFilter = searchParams.get("programId") || "";

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, programFilter]);

  async function fetchApplications() {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const params: { status?: string; programId?: string } = {};
      if (statusFilter) params.status = statusFilter;
      if (programFilter) params.programId = programFilter;
      
      const data = await universityApi.applications.list(token, params);
      setApplications(data.applications);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateApplicationStatus(id: string, status: string) {
    try {
      setReviewing(true);
      const token = await getToken();
      if (!token) return;

      await universityApi.applications.update(token, id, {
        status,
        reviewNotes: reviewNotes || undefined,
      });

      await fetchApplications();
      setSelectedApp(null);
      setReviewNotes("");
    } catch (err) {
      console.error("Failed to update application:", err);
    } finally {
      setReviewing(false);
    }
  }

  const statusTabs = [
    { value: "", label: "All" },
    { value: "SUBMITTED", label: "Submitted" },
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "SHORTLISTED", label: "Shortlisted" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Applications</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {statusTabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/applications${tab.value ? `?status=${tab.value}` : ""}${programFilter ? `&programId=${programFilter}` : ""}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications found</h3>
            <p className="text-gray-500">
              {statusFilter ? `No ${statusFilter.toLowerCase()} applications` : "No applications yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-amber-700">
                            {app.student.user.firstName?.[0]}{app.student.user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {app.student.user.firstName} {app.student.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{app.student.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.program.title}</div>
                      <div className="text-sm text-gray-500">{app.applicationNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[app.status] || "bg-gray-100 text-gray-700"}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : "Not submitted"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedApp.student.user.firstName} {selectedApp.student.user.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedApp.student.user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Education:</span>
                    <p className="font-medium">{selectedApp.student.highestEducation || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Institution:</span>
                    <p className="font-medium">{selectedApp.student.institution || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Motivation Letter */}
              {selectedApp.motivationLetter && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Motivation Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedApp.motivationLetter}
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedApp.documents.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2">
                    {selectedApp.documents.map((doc) => (
                      <a
                        key={doc.document.id}
                        href={doc.document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{doc.document.name}</span>
                        <span className="text-xs text-gray-500 uppercase">{doc.document.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block font-medium text-gray-900 mb-2">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about this application..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedApp.status === "SUBMITTED" && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, "UNDER_REVIEW")}
                      disabled={reviewing}
                      className="flex-1 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Start Review
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, "SHORTLISTED")}
                      disabled={reviewing}
                      className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                  </>
                )}
                {selectedApp.status === "UNDER_REVIEW" && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, "SHORTLISTED")}
                      disabled={reviewing}
                      className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, "REJECTED")}
                      disabled={reviewing}
                      className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedApp.status === "SHORTLISTED" && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, "ACCEPTED")}
                      disabled={reviewing}
                      className="flex-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, "REJECTED")}
                      disabled={reviewing}
                      className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
