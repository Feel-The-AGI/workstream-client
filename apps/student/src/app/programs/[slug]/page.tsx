import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users, MapPin, Building2, GraduationCap, Banknote, Calendar, CheckCircle, FileText, Briefcase } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
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
    <main className="min-h-screen bg-background">
      {/* Header */}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{program.field}</Badge>
                {program.hasInternship && (
                  <Badge variant="outline">Co-op Program</Badge>
                )}
                {program.isFunded && (
                  <Badge className="bg-success-600/10 text-success-600 border-success-600/20">
                    Employer Funded
                  </Badge>
                )}
                <Badge variant={program.status === "OPEN" ? "default" : "secondary"}>
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

            {/* What You'll Get */}
            <Card>
              <CardHeader>
                <CardTitle>Program Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                    <Clock className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{durationMonths} months ({program.durationWeeks} weeks)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                    <Briefcase className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium">Target Role</p>
                      <p className="text-sm text-muted-foreground">{program.jobRole}</p>
                    </div>
                  </div>

                  {program.stipendAmount && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                      <Banknote className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium">Monthly Stipend</p>
                        <p className="text-sm text-muted-foreground">GHS {program.stipendAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {program.hasInternship && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                      <Building2 className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="font-medium">Internship Included</p>
                        <p className="text-sm text-muted-foreground">
                          {program.internshipDuration ? `${program.internshipDuration} weeks at ${program.employer.name}` : 'Yes'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3">Guaranteed Placement</h4>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 shrink-0" />
                    <p className="text-sm">
                      Complete the program successfully and secure a position at {program.employer.name}. 
                      This is a demand-driven program with real job openings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {program.minEducation && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Education</p>
                      <p className="text-sm text-muted-foreground">{program.minEducation}</p>
                    </div>
                  </div>
                )}

                {program.requiredGrades && Object.keys(program.requiredGrades).length > 0 && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Minimum Grades</p>
                      <div className="flex flex-wrap gap-2 mt-1">
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
                    <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Additional Requirements</p>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        {program.additionalRequirements.map((req, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
                <CardDescription>
                  Secure your spot in this program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Application Fee</span>
                    <span className="font-semibold">
                      {program.applicationFee > 0 ? `GHS ${program.applicationFee.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Spots Available</span>
                    <span className={`font-semibold ${isLimitedSpots ? 'text-warning-600' : 'text-success-600'}`}>
                      {program.availableSlots} of {program.totalSlots}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Deadline</span>
                    <span className="font-medium">{formatDate(program.applicationDeadline)}</span>
                  </div>
                </div>

                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isLimitedSpots ? 'bg-warning-600' : 'bg-success-600'}`}
                    style={{ width: `${100 - spotsPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {program.totalSlots - program.availableSlots} applications received
                </p>

                <Button variant="accent" size="lg" className="w-full" asChild>
                  <Link href={`/programs/${slug}/apply`}>
                    Start Application
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By applying, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div>
                      <p className="text-sm font-medium">Applications Close</p>
                      <p className="text-xs text-muted-foreground">{formatDate(program.applicationDeadline)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Training Starts</p>
                      <p className="text-xs text-muted-foreground">{formatDate(program.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Program Ends</p>
                      <p className="text-xs text-muted-foreground">{formatDate(program.endDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {program.tags && program.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Topics</CardTitle>
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
