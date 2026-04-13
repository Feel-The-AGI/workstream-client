"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  Loader2,
  Building2,
  GraduationCap,
  CheckCircle2,
  Circle,
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Separator } from "@workstream/ui/components/separator";
import { api, type Application } from "../../../lib/api";

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

const TIMELINE_STEPS = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "ACCEPTED"] as const;

const STEP_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  ACCEPTED: "Accepted",
};

const STATUS_ORDER: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  UNDER_REVIEW: 2,
  SHORTLISTED: 3,
  ACCEPTED: 4,
  ENROLLED: 4,
  REJECTED: -1,
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ExtendedApplication extends Application {
  rejectionReason?: string | null;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: Props) {
  const { id } = use(params);
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [application, setApplication] = useState<ExtendedApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !id) return;

    async function fetchApplication() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.applications.get(token, id);
        setApplication(data.application as ExtendedApplication);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load application");
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id, isSignedIn, isLoaded, getToken]);

  async function handlePay() {
    if (!application) return;
    setPaymentLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      // We need user email — get from profile
      const profileData = await api.users.getProfile(token);
      const email = profileData.profile.email;
      const result = await api.payments.initialize(token, {
        applicationId: application.id,
        amount: application.program.applicationFee,
        email,
        callbackUrl: `${window.location.origin}/payments/callback`,
      });
      window.location.href = result.authorization_url;
    } catch (e) {
      console.error("Payment init failed:", e);
      setPaymentLoading(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (error || !application) {
    return (
      <main className="pb-12">
        <div className="container-page py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Application not found</h2>
            <p className="text-muted-foreground mb-6">{error ?? "This application could not be loaded."}</p>
            <Button asChild>
              <Link href="/applications">Back to Applications</Link>
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const currentStepIndex = STATUS_ORDER[application.status] ?? 0;
  const isRejected = application.status === "REJECTED";
  const hasPendingPayment =
    application.program.applicationFee > 0 && application.payments.length === 0;
  const completedPayment = application.payments.find((p) => p.status === "COMPLETED");

  return (
    <main className="pb-12">
      <div className="container-page py-8">
        {/* Back + header */}
        <div className="flex items-start gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
            <Link href="/applications">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-display font-bold tracking-tight truncate">
                {application.program.title}
              </h1>
              <Badge variant={STATUS_COLORS[application.status] ?? "secondary"}>
                {STATUS_LABELS[application.status] ?? application.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="font-mono bg-secondary px-2 py-0.5 rounded text-xs">
                #{application.applicationNumber}
              </span>
              {application.submittedAt && (
                <span>Submitted {formatDate(application.submittedAt)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rejection banner */}
            {isRejected && (
              <Card className="border-destructive/40">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <XCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold text-destructive">Not Selected</p>
                      {(application as ExtendedApplication).rejectionReason ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          {(application as ExtendedApplication).rejectionReason}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          Thank you for applying. Unfortunately you were not selected for this program.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accepted banner */}
            {(application.status === "ACCEPTED" || application.status === "ENROLLED") && (
              <Card className="border-success-500/40">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-success-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-success-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-success-600">Congratulations! You have been accepted.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Training starts on {formatDate(application.program.startDate)}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Program Info */}
            <Card>
              <CardHeader>
                <CardTitle>Program Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{application.program.title}</h3>
                    <p className="text-muted-foreground text-sm">{application.program.employer.name}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">University</p>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{application.program.university.name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Field</p>
                    <span className="font-medium">{application.program.field}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Job Role</p>
                    <span className="font-medium">{application.program.jobRole}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Duration</p>
                    <span className="font-medium">
                      {Math.round(application.program.durationWeeks / 4.33)} months ({application.program.durationWeeks} weeks)
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Start Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(application.program.startDate)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Application Fee</p>
                    <span className="font-medium">
                      {application.program.applicationFee > 0
                        ? `GHS ${application.program.applicationFee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/programs/${application.program.slug}`}>
                      View Program Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Motivation Letter */}
            {application.motivationLetter && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Motivation Letter</CardTitle>
                  <CardDescription>
                    Submitted {application.submittedAt ? formatDate(application.submittedAt) : "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {application.motivationLetter}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payment Status */}
            {application.program.applicationFee > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasPendingPayment ? (
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5 text-warning-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Payment required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          A fee of <strong>GHS {application.program.applicationFee.toLocaleString()}</strong> is required to complete your application.
                        </p>
                        <Button
                          variant="accent"
                          size="sm"
                          className="mt-3 gap-2"
                          onClick={handlePay}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          Pay GHS {application.program.applicationFee.toLocaleString()}
                        </Button>
                      </div>
                    </div>
                  ) : completedPayment ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-success-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-success-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            GHS {completedPayment.amount.toLocaleString()} paid
                          </p>
                          {completedPayment.paidAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(completedPayment.paidAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="success">Paid</Badge>
                    </div>
                  ) : (
                    application.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">GHS {payment.amount.toLocaleString()}</p>
                          {payment.paidAt && (
                            <p className="text-xs text-muted-foreground">{formatDate(payment.paidAt)}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{payment.status}</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {TIMELINE_STEPS.map((step, index) => {
                    const isPast = !isRejected && index < currentStepIndex;
                    const isCurrent = !isRejected && index === currentStepIndex;
                    const isFuture = isRejected || index > currentStepIndex;
                    const isLast = index === TIMELINE_STEPS.length - 1;

                    return (
                      <div key={step} className="flex gap-3">
                        {/* Icon + connector line */}
                        <div className="flex flex-col items-center">
                          <div className={`
                            h-7 w-7 rounded-full flex items-center justify-center shrink-0
                            ${isPast ? "bg-success-500/20" : ""}
                            ${isCurrent ? "bg-accent/20 ring-2 ring-accent ring-offset-2" : ""}
                            ${isFuture ? "bg-secondary" : ""}
                          `}>
                            {isPast ? (
                              <CheckCircle2 className="h-4 w-4 text-success-600" />
                            ) : isCurrent ? (
                              <Circle className="h-4 w-4 text-accent fill-accent" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/30" />
                            )}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-6 mt-1 ${isPast ? "bg-success-500/40" : "bg-border"}`} />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pb-2 pt-0.5">
                          <span className={`text-sm ${isCurrent ? "font-semibold text-foreground" : isPast ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                            {STEP_LABELS[step]}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {isRejected && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      <span className="text-sm font-medium text-destructive">Not Selected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                  <p className="text-sm font-medium mt-0.5">{formatDateTime(application.createdAt)}</p>
                </div>
                {application.submittedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted</p>
                    <p className="text-sm font-medium mt-0.5">{formatDateTime(application.submittedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Program Start</p>
                  <p className="text-sm font-medium mt-0.5">{formatDate(application.program.startDate)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
