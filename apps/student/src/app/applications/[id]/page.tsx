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
  Upload,
  Calendar,
  Building2,
  GraduationCap,
  Download
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Progress } from "@workstream/ui/components/progress";
import { Separator } from "@workstream/ui/components/separator";

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  motivationLetter: string | null;
  meetsRequirements: boolean | null;
  eligibilityNotes: string | null;
  aiScore: number | null;
  reviewNotes: string | null;
  interviewDate: string | null;
  createdAt: string;
  submittedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  program: {
    id: string;
    title: string;
    slug: string;
    description: string;
    applicationFee: number;
    startDate: string;
    employer: { name: string; logoUrl: string | null };
    university: { name: string; shortName: string | null };
  };
  documents: Array<{
    id: string;
    document: {
      id: string;
      type: string;
      name: string;
      verificationStatus: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
  }>;
}

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS = [
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "ACCEPTED", label: "Accepted" },
];

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  SHORTLISTED: 3,
  INTERVIEW_SCHEDULED: 3,
  ACCEPTED: 4,
  ENROLLED: 5,
  REJECTED: -1,
  WITHDRAWN: -1,
};

export default function ApplicationDetailPage({ params }: Props) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [applicationId, setApplicationId] = useState<string>("");
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setApplicationId(resolvedParams.id);
    }
    init();
  }, [params]);

  useEffect(() => {
    if (!applicationId || !isLoaded) return;

    async function fetchApplication() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/applications/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch application");
        }

        const data = await response.json();
        setApplication(data.application);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load application");
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [applicationId, isSignedIn, isLoaded, getToken]);

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-page py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || "Application not found"}</p>
            <Button asChild>
              <Link href="/applications">Back to Applications</Link>
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const currentStep = STATUS_ORDER[application.status] ?? 0;
  const isRejected = application.status === "REJECTED" || application.status === "WITHDRAWN";
  const progressPercent = isRejected ? 0 : ((currentStep + 1) / STATUS_STEPS.length) * 100;

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/applications">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold">Application Details</h1>
              <p className="text-sm text-muted-foreground">
                #{application.applicationNumber}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Track your application progress</CardDescription>
              </CardHeader>
              <CardContent>
                {isRejected ? (
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">
                          {application.status === "REJECTED" ? "Not Selected" : "Withdrawn"}
                        </p>
                        {application.rejectionReason && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {application.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Progress value={progressPercent} className="h-2 mb-6" />
                    <div className="flex justify-between">
                      {STATUS_STEPS.map((step, index) => {
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={`
                              h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                              ${isCompleted ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}
                              ${isCurrent ? "ring-2 ring-accent ring-offset-2" : ""}
                            `}>
                              {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <span className={`text-xs mt-2 ${isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Interview Info */}
                {application.interviewDate && (
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="font-medium">Interview Scheduled</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(application.interviewDate).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}

                {/* Accepted Message */}
                {application.status === "ACCEPTED" && (
                  <div className="mt-6 p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-success-600">Congratulations!</p>
                        <p className="text-sm text-muted-foreground">
                          You&apos;ve been accepted to {application.program.title}. 
                          Training starts on {new Date(application.program.startDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Info */}
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{application.program.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {application.program.employer.name}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {application.program.university.shortName || application.program.university.name}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={`/programs/${application.program.slug}`}>
                    View Program
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Motivation Letter */}
            {application.motivationLetter && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Motivation Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {application.motivationLetter}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
                <CardDescription>Required documents for your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.documents.length === 0 ? (
                  <div className="text-center py-4">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link href="/profile/documents">Upload Documents</Link>
                    </Button>
                  </div>
                ) : (
                  application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.document.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.document.type}</p>
                        </div>
                      </div>
                      <Badge variant={
                        doc.document.verificationStatus === "VERIFIED" ? "success" :
                        doc.document.verificationStatus === "REJECTED" ? "destructive" :
                        "secondary"
                      }>
                        {doc.document.verificationStatus}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            {application.program.applicationFee > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.payments.length === 0 ? (
                    <div className="text-center py-4">
                      <AlertCircle className="h-8 w-8 text-warning-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Payment required</p>
                      <p className="font-medium mb-3">GHS {application.program.applicationFee.toFixed(2)}</p>
                      <Button variant="accent" size="sm" asChild>
                        <Link href={`/applications/${application.id}/payment`}>
                          Pay Now
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    application.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">GHS {payment.amount.toFixed(2)}</p>
                          {payment.paidAt && (
                            <p className="text-xs text-muted-foreground">
                              Paid on {new Date(payment.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge variant={payment.status === "COMPLETED" ? "success" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TimelineItem
                    label="Application Created"
                    date={application.createdAt}
                    completed
                  />
                  {application.submittedAt && (
                    <TimelineItem
                      label="Application Submitted"
                      date={application.submittedAt}
                      completed
                    />
                  )}
                  {application.acceptedAt && (
                    <TimelineItem
                      label="Accepted"
                      date={application.acceptedAt}
                      completed
                    />
                  )}
                  {application.rejectedAt && (
                    <TimelineItem
                      label="Decision Made"
                      date={application.rejectedAt}
                      completed
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
    DRAFT: { color: "bg-secondary", icon: FileText },
    SUBMITTED: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30", icon: Clock },
    UNDER_REVIEW: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30", icon: AlertCircle },
    SHORTLISTED: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30", icon: CheckCircle },
    ACCEPTED: { color: "bg-success-100 text-success-700 dark:bg-success-900/30", icon: CheckCircle },
    REJECTED: { color: "bg-destructive/10 text-destructive", icon: XCircle },
  };

  const { color, icon: Icon } = config[status] || config.DRAFT;

  return (
    <Badge className={color}>
      <Icon className="h-3 w-3 mr-1" />
      {status.replace("_", " ")}
    </Badge>
  );
}

function TimelineItem({ label, date, completed }: { label: string; date: string; completed?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`h-2 w-2 rounded-full mt-2 ${completed ? "bg-accent" : "bg-muted"}`} />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
