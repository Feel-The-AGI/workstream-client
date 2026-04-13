"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  FileText,
  AlertCircle,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { api, type Application } from "../../lib/api";

const STATUS_COLORS: Record<
  string,
  "accent" | "secondary" | "outline" | "default" | "destructive" | "success" | "warning"
> = {
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

  if (!isLoaded || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="pb-12">
      <div className="container-page py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-display font-bold tracking-tight">My Applications</h1>
          {applications.length > 0 && (
            <Badge variant="secondary" className="text-sm font-medium">
              {applications.length}
            </Badge>
          )}
        </div>

        {error && (
          <Card className="p-6 mb-6 border-destructive/50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-destructive">{error}</p>
            </div>
          </Card>
        )}

        {applications.length === 0 ? (
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
              <Link key={application.id} href={`/applications/${application.id}`}>
                <Card className="hover:border-accent/30 hover:shadow-md transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Status + app number row */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge variant={STATUS_COLORS[application.status] ?? "secondary"}>
                            {STATUS_LABELS[application.status] ?? application.status}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            #{application.applicationNumber}
                          </span>
                        </div>

                        {/* Program title */}
                        <h3 className="font-semibold text-lg leading-snug group-hover:text-accent transition-colors truncate">
                          {application.program.title}
                        </h3>

                        {/* Employer + university */}
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {application.program.employer.name}
                          <span className="mx-2 text-border">·</span>
                          {application.program.university.name}
                        </p>

                        {/* Date */}
                        <p className="text-xs text-muted-foreground mt-2">
                          {application.submittedAt
                            ? `Submitted ${formatDate(application.submittedAt)}`
                            : <span className="text-warning-600 font-medium">Draft — not submitted</span>
                          }
                        </p>
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
