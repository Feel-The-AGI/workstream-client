import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Building2,
  GraduationCap,
  Banknote,
  Calendar,
  CheckCircle,
  FileText,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Separator } from "@workstream/ui/components/separator";
import { api } from "../../../lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;

  let program;
  try {
    const response = await api.programs.get(slug);
    program = response.program;
  } catch (e) {
    console.error("Failed to fetch program:", e);
    notFound();
  }

  const durationMonths = Math.round(program.durationWeeks / 4.33);
  const spotsPercentage = (program.availableSlots / program.totalSlots) * 100;
  const isLimitedSpots = spotsPercentage <= 40;

  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Sticky top bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container-page py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/programs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Programs
            </Link>
          </Button>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left column (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{program.field}</Badge>
                {program.isFunded && (
                  <Badge className="bg-success-600/10 text-success-600 border-success-600/20">
                    Employer Funded
                  </Badge>
                )}
                {program.hasInternship && (
                  <Badge variant="outline">Co-op Program</Badge>
                )}
                <Badge variant={program.status === "OPEN" ? "success" : "secondary"}>
                  {program.status}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
                {program.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="font-medium text-foreground">{program.employer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>{program.university.name}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {program.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>Eligibility criteria for this program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {program.minEducation && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Minimum Education</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{program.minEducation}</p>
                    </div>
                  </div>
                )}

                {program.requiredGrades && Object.keys(program.requiredGrades).length > 0 && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Required Grades</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(program.requiredGrades).map(([subject, grade]) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}: {grade as string}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {program.additionalRequirements && program.additionalRequirements.length > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Additional Requirements</p>
                      <ul className="mt-2 space-y-1.5">
                        {program.additionalRequirements.map((req, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {!program.minEducation &&
                  (!program.requiredGrades || Object.keys(program.requiredGrades).length === 0) &&
                  program.additionalRequirements.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No specific requirements listed. All qualified applicants are welcome.
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Program Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Application Deadline</p>
                      <p className="font-medium">{formatDate(program.applicationDeadline)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Training Starts</p>
                      <p className="font-medium">{formatDate(program.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Program Ends</p>
                      <p className="font-medium">{formatDate(program.endDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{durationMonths} months ({program.durationWeeks} weeks)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right column (1/3) sticky card ── */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
                <CardDescription>Secure your spot in this program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Spots bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Available Spots
                    </span>
                    <span className={`font-semibold ${isLimitedSpots ? "text-warning-600" : "text-success-600"}`}>
                      {program.availableSlots} of {program.totalSlots}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isLimitedSpots ? "bg-warning-600" : "bg-success-600"}`}
                      style={{ width: `${100 - spotsPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {program.totalSlots - program.availableSlots} applications received
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Application Fee</span>
                    <span className="font-semibold">
                      {program.applicationFee > 0
                        ? `GHS ${program.applicationFee.toLocaleString()}`
                        : <span className="text-success-600">Free</span>}
                    </span>
                  </div>

                  {program.isFunded && program.stipendAmount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        Monthly Stipend
                      </span>
                      <span className="font-semibold text-success-600">
                        GHS {program.stipendAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {program.hasInternship && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Co-op Internship</span>
                      <span className="font-medium">
                        {program.internshipDuration
                          ? `${program.internshipDuration} weeks`
                          : "Included"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="font-medium">{formatDate(program.applicationDeadline)}</span>
                  </div>
                </div>

                <Button variant="accent" size="lg" className="w-full" asChild>
                  <Link href={`/programs/${slug}/apply`}>
                    Start Application
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By applying you agree to our terms and conditions
                </p>

                <Separator />

                {/* University info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">University Partner</p>
                      <p className="text-sm font-medium">{program.university.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Employer Partner</p>
                      <p className="text-sm font-medium">{program.employer.name}</p>
                      {program.employer.industry && (
                        <p className="text-xs text-muted-foreground">{program.employer.industry}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags card */}
            {program.tags && program.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Related Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
