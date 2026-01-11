"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { universityApi, type DashboardResponse } from "../lib/api";

export default function UniversityDashboard() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!isSignedIn) return;
      
      try {
        const token = await getToken();
        if (!token) throw new Error("No authentication token");
        
        const data = await universityApi.dashboard(token);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      fetchDashboard();
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">University Portal</h1>
          <p className="text-gray-600 mb-6">Sign in to manage your programs and review applications</p>
          <SignInButton mode="modal">
            <button className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Contact support if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const statCards = [
    { label: "Total Programs", value: dashboard.stats.totalPrograms, color: "bg-blue-500", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Active Programs", value: dashboard.stats.activePrograms, color: "bg-green-500", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Total Applications", value: dashboard.stats.totalApplications, color: "bg-purple-500", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Pending Review", value: dashboard.stats.pendingReview, color: "bg-amber-500", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {dashboard.university.logoUrl ? (
                <img src={dashboard.university.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-600">
                    {dashboard.university.shortName?.[0] || dashboard.university.name[0]}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{dashboard.university.name}</h1>
                <p className="text-sm text-gray-500">University Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.firstName || "Admin"}</span>
              <Link
                href="/applications"
                className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Applications
              </Link>
              <Link
                href="/programs"
                className="px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Programs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <svg className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/applications?status=SUBMITTED"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-amber-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Review Applications</h3>
            <p className="text-sm text-gray-500">{dashboard.stats.pendingReview} applications pending review</p>
          </Link>
          <Link
            href="/applications?status=SHORTLISTED"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Shortlisted Candidates</h3>
            <p className="text-sm text-gray-500">{dashboard.stats.shortlisted} candidates shortlisted</p>
          </Link>
          <Link
            href="/programs/new"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Create New Program</h3>
            <p className="text-sm text-gray-500">Partner with employers for training</p>
          </Link>
        </div>

        {/* Programs List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Programs</h2>
              <Link
                href="/programs/new"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Program
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboard.programs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No programs yet. Create your first program to start accepting applications.
              </div>
            ) : (
              dashboard.programs.map((program) => (
                <div key={program.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{program.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            program.status === "OPEN"
                              ? "bg-green-100 text-green-700"
                              : program.status === "DRAFT"
                              ? "bg-gray-100 text-gray-700"
                              : program.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {program.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span>Partner: {program.employer.name}</span>
                        <span>•</span>
                        <span>{program._count?.applications || 0} applications</span>
                        <span>•</span>
                        <span>{program.availableSlots} slots available</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/applications?programId=${program.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        View Applications
                      </Link>
                      <Link
                        href={`/programs/${program.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-amber-600 hover:text-amber-700"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
