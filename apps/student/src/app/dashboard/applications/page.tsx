"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Building2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Button } from "@workstream/ui/components/button";
import { Skeleton } from "@workstream/ui/components/skeleton";
import { api, type Application } from "@/lib/api";

const STATUS_COLORS: Record<
  string,
  "accent" | "secondary" | "outline" | "default" | "destructive" | "success" | "warning"
> = {
  DRAFT: "secondary",
  SUBMITTED: "outline",
  UNDER_REVIEW: "warning",
  SHORTLISTED: "accent",
  ACCEPTED: "success",
  REJECTED: "outline",
  ENROLLED: "accent",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  ACCEPTED: "Accepted",
  REJECTED: "Not Selected",
  ENROLLED: "Enrolled",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ApplicationSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-5 w-28 rounded" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
          <Skeleton className="h-5 w-5 rounded shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApplicationsPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    async function fetchApplications() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.applications.list(token);
        const sorted = [...data.applications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApplications(sorted);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [isSignedIn, isLoaded, getToken]);

  return (
    <main className="pb-12">
      <div className="container-page py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-display font-bold tracking-tight">My Applications</h1>
          {!loading && applications.length > 0 && (
            <Badge variant="secondary" className="text-sm font-medium">
              {applications.length}
            </Badge>
          )}
        </div>

        {error && (
          <Card className="p-6 mb-6 border-destructive/50">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            <ApplicationSkeleton />
            <ApplicationSkeleton />
            <ApplicationSkeleton />
          </div>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No applications yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Discover employer-backed training programs and start your career journey.
            </p>
            <Button variant="accent" asChild>
              <Link href="/programs">Browse Programs</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Link key={application.id} href={`/dashboard/applications/${application.id}`}>
                <Card className="hover:border-accent/30 hover:shadow-md transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="text-lg font-semibold leading-snug group-hover:text-accent transition-colors truncate mb-1">
                          {application.program.title}
                        </h3>

                        {/* Employer · University */}
                        <p className="text-sm text-muted-foreground mb-2">
                          {application.program.employer.name}
                          <span className="mx-2">•</span>
                          {application.program.university.name}
                        </p>

                        {/* App number + date row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant={STATUS_COLORS[application.status] ?? "secondary"}>
                            {STATUS_LABELS[application.status] ?? application.status}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            #{application.applicationNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {application.submittedAt
                              ? `Submitted ${formatDate(application.submittedAt)}`
                              : "Draft — not submitted"}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
