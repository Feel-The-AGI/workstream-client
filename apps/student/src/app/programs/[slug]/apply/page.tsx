"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  AlertCircle,
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
import { Textarea } from "@workstream/ui/components/textarea";
import { Label } from "@workstream/ui/components/label";
import { Progress } from "@workstream/ui/components/progress";
import { Separator } from "@workstream/ui/components/separator";
import { api, type UserProfile, type Program } from "../../../../lib/api";

const TOTAL_STEPS = 3;
const MIN_LETTER_LENGTH = 100;

interface EligibilityItem {
  label: string;
  passed: boolean;
  detail: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

function computeEligibility(prog: Program, prof: UserProfile | null): EligibilityItem[] {
  const items: EligibilityItem[] = [];

  if (prog.minEducation) {
    const hasEducation = !!prof?.student?.degree;
    items.push({
      label: `Education: ${prog.minEducation}`,
      passed: hasEducation,
      detail: hasEducation
        ? `Your degree: ${prof?.student?.degree}`
        : "Please update your education details in your profile",
    });
  }

  if (prog.requiredGrades) {
    for (const [subject, requiredGrade] of Object.entries(prog.requiredGrades)) {
      const label = subject.charAt(0).toUpperCase() + subject.slice(1);
      items.push({
        label: `${label}: Minimum grade ${requiredGrade as string}`,
        passed: true,
        detail: "Ensure you meet this grade requirement before applying",
      });
    }
  }

  if (prog.additionalRequirements && prog.additionalRequirements.length > 0) {
    for (const req of prog.additionalRequirements) {
      items.push({
        label: req,
        passed: true,
        detail: "Confirm you meet this requirement before applying",
      });
    }
  }

  if (items.length === 0) {
    items.push({
      label: "Open to all qualified applicants",
      passed: true,
      detail: "No specific restrictions for this program",
    });
  }

  return items;
}

export default function ApplyPage({ params }: Props) {
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [slug, setSlug] = useState("");
  const [program, setProgram] = useState<Program | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [motivationLetter, setMotivationLetter] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug || !isLoaded) return;

    async function load() {
      try {
        const programRes = await api.programs.get(slug);
        setProgram(programRes.program);

        if (isSignedIn) {
          const token = await getToken();
          if (token) {
            const profileRes = await api.users.getProfile(token);
            setProfile(profileRes.profile);
          }
        }
      } catch (e) {
        setError("Failed to load program details");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug, isLoaded, isSignedIn, getToken]);

  async function handleSubmit() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/programs/${slug}/apply`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const createRes = await api.applications.create(token, {
        programId: program!.id,
        motivationLetter,
      });
      const application = createRes.application;

      if (program!.applicationFee > 0) {
        const userEmail = profile?.email || "student@workstream.gh";
        const payRes = await api.payments.initialize(token, {
          applicationId: application.id,
          amount: program!.applicationFee,
          email: userEmail,
          callbackUrl: `${window.location.origin}/payments/callback`,
        });
        window.location.href = payRes.authorization_url;
      } else {
        await api.applications.submit(token, application.id);
        router.push(`/applications/${application.id}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to submit application";
      setError(msg);
      setSubmitting(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (error && !program) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-page py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/programs">Back to Programs</Link>
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  if (!program) return null;

  const eligibilityItems = computeEligibility(program, profile);
  const hasBlockingFail = eligibilityItems.some((i) => !i.passed);
  const progressPercent = (step / TOTAL_STEPS) * 100;

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/programs/${slug}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">Apply to Program</h1>
                <p className="text-sm text-muted-foreground line-clamp-1">{program.title}</p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 hidden sm:flex">
              Step {step} of {TOTAL_STEPS}
            </Badge>
          </div>
          <Progress value={progressPercent} className="mt-3 h-1" />
        </div>
      </div>

      <div className="container-page py-8 max-w-2xl">
        {/* ── STEP 1: Eligibility Check ── */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Check</CardTitle>
              <CardDescription>
                Review the requirements for this program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-medium">{program.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {program.employer.name} · {program.university.name}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{program.field}</Badge>
                  {program.isFunded && (
                    <Badge className="bg-success-600/10 text-success-600 border-success-600/20 text-xs">
                      Funded
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-sm">Program Requirements</h4>
                <div className="space-y-3">
                  {eligibilityItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      {item.passed ? (
                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {hasBlockingFail ? (
                <div className="rounded-lg p-4 bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Requirements not fully met</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please update your profile to meet the requirements.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" asChild>
                        <Link href="/profile">Update Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg p-4 bg-success-50 dark:bg-success-900/20 border border-success-600/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-success-600">You meet the requirements</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You can proceed with your application.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!hasBlockingFail && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Grade requirements are self-certified. Providing false information may result in disqualification.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" asChild>
                  <Link href={`/programs/${slug}`}>Cancel</Link>
                </Button>
                <Button
                  variant="accent"
                  onClick={() => setStep(2)}
                  disabled={hasBlockingFail}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 2: Motivation Letter ── */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Motivation Letter</CardTitle>
              <CardDescription>
                Why do you want to join this program?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="motivation">
                  Why do you want to join this program? (min {MIN_LETTER_LENGTH} characters)
                </Label>
                <Textarea
                  id="motivation"
                  placeholder={`Explain why you want to join the ${program.title} program, what you hope to learn, and how it aligns with your career goals...`}
                  className="min-h-[220px] resize-y"
                  value={motivationLetter}
                  onChange={(e) => setMotivationLetter(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      motivationLetter.length >= MIN_LETTER_LENGTH
                        ? "text-success-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {motivationLetter.length} / 2000 characters
                  </p>
                  {motivationLetter.length < MIN_LETTER_LENGTH && (
                    <p className="text-xs text-muted-foreground">
                      {MIN_LETTER_LENGTH - motivationLetter.length} more characters needed
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tips for a strong letter
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explain your interest in {program.employer.name}</li>
                  <li>• Highlight relevant skills or experiences</li>
                  <li>• Describe your career goals after the program</li>
                  <li>• Be specific and authentic — stand out from the crowd</li>
                </ul>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="accent"
                  onClick={() => setStep(3)}
                  disabled={motivationLetter.length < MIN_LETTER_LENGTH}
                >
                  Review Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 3: Review & Submit ── */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Review your application before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Program
                </h4>
                <p className="font-medium">{program.title}</p>
                <p className="text-sm text-muted-foreground">
                  {program.employer.name} · {program.university.name}
                </p>
              </div>

              {program.applicationFee > 0 ? (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Application Fee</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        You will be redirected to Paystack to complete payment
                      </p>
                    </div>
                    <span className="text-2xl font-display font-bold">
                      GHS {program.applicationFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-600/20">
                  <CheckCircle className="h-5 w-5 text-success-600 shrink-0" />
                  <p className="text-sm font-medium text-success-600">
                    No application fee — this program is free to apply
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Your Motivation Letter</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setStep(2)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4 max-h-44 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {motivationLetter}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Documents Required
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    After submitting, upload your transcript and other required documents on the Documents page.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 accent-amber-500"
                />
                <span className="text-sm text-muted-foreground">
                  I confirm the information provided is accurate and I agree to the{" "}
                  <Link href="/terms" className="text-accent underline underline-offset-2">
                    terms and conditions
                  </Link>
                  . I understand that providing false information may result in disqualification.
                </span>
              </label>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="accent"
                  onClick={handleSubmit}
                  disabled={!agreedToTerms || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : program.applicationFee > 0 ? (
                    <>
                      Proceed to Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
