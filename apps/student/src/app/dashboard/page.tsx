"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  FileText,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workstream/ui/components/avatar";
import { api, type Application, type UserProfile } from "../../lib/api";

const STATUS_COLORS: Record<string, "accent" | "secondary" | "outline" | "default" | "destructive" | "success" | "warning"> = {
  DRAFT: "secondary",
  SUBMITTED: "outline",
  UNDER_REVIEW: "warning",
  SHORTLISTED: "accent",
  ACCEPTED: "success",
  REJECTED: "destructive",
  ENROLLED: "success",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  ENROLLED: "Enrolled",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isSignedIn, isLoaded: authLoaded } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoaded || !userLoaded) return;

    async function fetchData() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;

        const [profileRes, appsRes] = await Promise.all([
          api.users.getProfile(token),
          api.applications.list(token),
        ]);

        setProfile(profileRes.profile);
        setApplications(appsRes.applications);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [authLoaded, userLoaded, isSignedIn, getToken]);

  if (!authLoaded || !userLoaded || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  const firstName = profile?.firstName || user?.firstName || "there";
  const initials =
    (profile?.firstName?.[0] || user?.firstName?.[0] || "").toUpperCase() +
    (profile?.lastName?.[0] || user?.lastName?.[0] || "").toUpperCase() ||
    "U";

  const totalApplications = applications.length;
  const underReview = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED").length;
  const accepted = applications.filter((a) => a.status === "ACCEPTED" || a.status === "ENROLLED").length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const profileIncomplete = profile?.student?.profileComplete === false;

  return (
    <main className="pb-12">
      <div className="container-page py-8">
        {/* Welcome Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={user?.imageUrl || ""} />
            <AvatarFallback className="font-display text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your applications
            </p>
          </div>
        </div>

        {/* Profile completion banner */}
        {profileIncomplete && (
          <Card variant="accent" className="mb-8 border-amber-500/40">
            <CardContent className="py-4 px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Complete your profile</p>
                    <p className="text-sm text-muted-foreground">
                      A complete profile improves your chances of being shortlisted
                    </p>
                  </div>
                </div>
                <Button variant="accent" size="sm" asChild className="shrink-0">
                  <Link href="/dashboard/profile">Complete Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-display font-bold mt-1">{totalApplications}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-3xl font-display font-bold mt-1">{underReview}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shortlisted</p>
                  <p className="text-3xl font-display font-bold mt-1">{shortlisted}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-3xl font-display font-bold mt-1">{accepted}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your last {Math.min(5, totalApplications)} applications</CardDescription>
            </div>
            {totalApplications > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/applications">View All</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Discover employer-backed training programs and start your career journey
                </p>
                <Button variant="accent" asChild>
                  <Link href="/programs" className="gap-2">
                    Browse Programs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-muted-foreground pb-3 pr-4">Program</th>
                      <th className="text-left font-medium text-muted-foreground pb-3 pr-4">Employer</th>
                      <th className="text-left font-medium text-muted-foreground pb-3 pr-4">Status</th>
                      <th className="text-left font-medium text-muted-foreground pb-3 pr-4">Submitted</th>
                      <th className="text-left font-medium text-muted-foreground pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentApplications.map((app) => (
                      <tr key={app.id} className="group">
                        <td className="py-3 pr-4">
                          <span className="font-medium group-hover:text-accent transition-colors">
                            {app.program.title}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {app.program.employer.name}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_COLORS[app.status] || "secondary"}>
                            {STATUS_LABELS[app.status] || app.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {app.submittedAt ? formatDate(app.submittedAt) : formatDate(app.createdAt)}
                        </td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/applications/${app.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
