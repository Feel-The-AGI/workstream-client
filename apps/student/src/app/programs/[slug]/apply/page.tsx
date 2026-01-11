"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileText,
  Upload,
  AlertCircle
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Textarea } from "@workstream/ui/components/textarea";
import { Label } from "@workstream/ui/components/label";
import { Progress } from "@workstream/ui/components/progress";

interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  employer: { name: string };
  university: { name: string };
  applicationFee: number;
  minEducation: string | null;
  requiredGrades: Record<string, string> | null;
  additionalRequirements: string[];
  totalSlots: number;
  availableSlots: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ApplicationPage({ params }: Props) {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const [slug, setSlug] = useState<string>("");
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [motivationLetter, setMotivationLetter] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Eligibility check result
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [eligibilityIssues, setEligibilityIssues] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    }
    init();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchProgram() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/programs/${slug}`
        );
        if (!response.ok) throw new Error("Program not found");
        const data = await response.json();
        setProgram(data.program);
        
        // Simulate eligibility check (in real app, this would check against user profile)
        setTimeout(() => {
          setEligibilityChecked(true);
          // For demo, assume eligible
          setIsEligible(true);
          setEligibilityIssues([]);
        }, 1000);
      } catch (e) {
        setError("Failed to load program");
      } finally {
        setLoading(false);
      }
    }

    fetchProgram();
  }, [slug]);

  const handleSubmit = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/programs/${slug}/apply`);
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            programId: program?.id,
            motivationLetter,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit application");
      }

      const data = await response.json();
      
      // If payment is required, redirect to payment
      if (program && program.applicationFee > 0) {
        router.push(`/applications/${data.application.id}/payment`);
      } else {
        router.push(`/applications/${data.application.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (error || !program) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-page py-8">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || "Program not found"}</p>
            <Button asChild>
              <Link href="/programs">Back to Programs</Link>
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const totalSteps = 3;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/programs/${slug}`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-display font-bold">Apply to Program</h1>
                <p className="text-sm text-muted-foreground">{program.title}</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <Badge variant="outline">Step {step} of {totalSteps}</Badge>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-4 h-1" />
        </div>
      </div>

      <div className="container-page py-8 max-w-2xl">
        {/* Step 1: Eligibility Check */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Check</CardTitle>
              <CardDescription>
                We&apos;re checking if you meet the requirements for this program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Program Summary */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">{program.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {program.employer.name} • {program.university.name}
                </p>
              </div>

              {/* Requirements List */}
              <div>
                <h4 className="font-medium mb-3">Program Requirements</h4>
                <div className="space-y-3">
                  {program.minEducation && (
                    <div className="flex items-start gap-3">
                      {eligibilityChecked ? (
                        isEligible ? (
                          <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">Education: {program.minEducation}</p>
                      </div>
                    </div>
                  )}

                  {program.requiredGrades && Object.entries(program.requiredGrades).map(([subject, grade]) => (
                    <div key={subject} className="flex items-start gap-3">
                      {eligibilityChecked ? (
                        isEligible ? (
                          <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}: Minimum grade {grade as string}
                        </p>
                      </div>
                    </div>
                  ))}

                  {program.additionalRequirements?.map((req, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {eligibilityChecked ? (
                        <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{req}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Result */}
              {eligibilityChecked && (
                <div className={`rounded-lg p-4 ${isEligible ? "bg-success-50 dark:bg-success-900/20" : "bg-destructive/10"}`}>
                  {isEligible ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                      <div>
                        <p className="font-medium text-success-600">You&apos;re eligible!</p>
                        <p className="text-sm text-muted-foreground">
                          You meet all the requirements for this program.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Not Eligible</p>
                        <p className="text-sm text-muted-foreground">
                          You don&apos;t meet some requirements. Please update your profile.
                        </p>
                        {eligibilityIssues.length > 0 && (
                          <ul className="mt-2 text-sm">
                            {eligibilityIssues.map((issue, i) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/programs/${slug}`}>Cancel</Link>
                </Button>
                <Button 
                  variant="accent" 
                  onClick={() => setStep(2)}
                  disabled={!eligibilityChecked || !isEligible}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Motivation Letter */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Application</CardTitle>
              <CardDescription>
                Tell us why you&apos;re interested in this program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="motivation">Motivation Letter *</Label>
                <Textarea
                  id="motivation"
                  placeholder="Explain why you want to join this program, what you hope to learn, and how it aligns with your career goals..."
                  className="min-h-50"
                  value={motivationLetter}
                  onChange={(e) => setMotivationLetter(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {motivationLetter.length} / 2000 characters (minimum 100)
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tips for your letter
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explain your interest in {program.employer.name}</li>
                  <li>• Highlight relevant skills or experiences</li>
                  <li>• Describe your career goals</li>
                  <li>• Be specific and authentic</li>
                </ul>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="accent" 
                  onClick={() => setStep(3)}
                  disabled={motivationLetter.length < 100}
                >
                  Review Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>
                Please review your application before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Program Info */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Program</h4>
                <p className="text-sm">{program.title}</p>
                <p className="text-sm text-muted-foreground">
                  {program.employer.name} • {program.university.name}
                </p>
              </div>

              {/* Application Fee */}
              {program.applicationFee > 0 && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Application Fee</h4>
                      <p className="text-sm text-muted-foreground">
                        Required to process your application
                      </p>
                    </div>
                    <span className="text-xl font-bold">
                      GHS {program.applicationFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Motivation Preview */}
              <div>
                <h4 className="font-medium mb-2">Your Motivation Letter</h4>
                <div className="bg-secondary/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{motivationLetter}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setStep(2)}
                >
                  Edit
                </Button>
              </div>

              {/* Documents Notice */}
              <div className="flex items-start gap-3 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-600">Documents Required</p>
                  <p className="text-sm text-muted-foreground">
                    After submitting, you&apos;ll need to upload your transcript and other required documents.
                  </p>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-muted-foreground">
                  I confirm that the information provided is accurate and I agree to the{" "}
                  <Link href="/terms" className="text-accent underline">terms and conditions</Link>.
                  I understand that providing false information may result in disqualification.
                </span>
              </label>

              {error && (
                <div className="p-4 bg-destructive/10 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
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
