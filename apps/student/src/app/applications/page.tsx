"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
  program: {
    id: string;
    title: string;
    slug: string;
    employer: { name: string };
    university: { name: string };
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT: { label: "Draft", color: "bg-secondary text-secondary-foreground", icon: FileText },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: AlertCircle },
  SHORTLISTED: { label: "Shortlisted", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: CheckCircle },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Clock },
  ACCEPTED: { label: "Accepted", color: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400", icon: CheckCircle },
  REJECTED: { label: "Not Selected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  ENROLLED: { label: "Enrolled", color: "bg-success-100 text-success-700", icon: CheckCircle },
  WITHDRAWN: { label: "Withdrawn", color: "bg-secondary text-muted-foreground", icon: XCircle },
};

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        const data = await response.json();
        setApplications(data.applications);
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-page py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your applications.
            </p>
            <Button variant="accent" asChild>
              <Link href="/sign-in?redirect_url=/applications">Sign In</Link>
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">My Applications</h1>
              <p className="text-sm text-muted-foreground">
                Track and manage your program applications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {error && (
          <Card className="p-6 mb-6 border-destructive/50">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {applications.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Applications Yet</h2>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t applied to any programs yet. Browse available programs to get started.
            </p>
            <Button variant="accent" asChild>
              <Link href="/programs">Browse Programs</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.DRAFT;
              const StatusIcon = statusConfig.icon;

              return (
                <Link key={application.id} href={`/applications/${application.id}`}>
                  <Card className="hover:border-accent/30 hover:shadow-md transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              #{application.applicationNumber}
                            </span>
                          </div>
                          <h3 className="font-medium group-hover:text-accent transition-colors">
                            {application.program.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {application.program.employer.name} • {application.program.university.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied {new Date(application.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
