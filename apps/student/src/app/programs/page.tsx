import { Suspense } from "react";
import Link from "next/link";
import { Clock, Users, Building2, GraduationCap, Banknote, Calendar } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { api, type Program } from "../../lib/api";
import { FieldFilterTabs } from "./field-filter-tabs";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProgramCard({ program }: { program: Program }) {
  const durationMonths = Math.round(program.durationWeeks / 4.33);
  const isLimitedSpots = (program.availableSlots / program.totalSlots) * 100 <= 40;

  return (
    <Card className="group hover:border-accent/30 hover:shadow-xl transition-all duration-300 flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">{program.field}</Badge>
          {program.isFunded && (
            <Badge className="bg-success-600/10 text-success-600 border-success-600/20 text-xs">Funded</Badge>
          )}
          {program.hasInternship && (
            <Badge variant="outline" className="text-xs">Co-op</Badge>
          )}
        </div>
        <CardTitle className="text-xl group-hover:text-accent transition-colors line-clamp-2">
          {program.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-1">
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{program.employer.name}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {program.shortDescription || program.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{durationMonths} months</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 shrink-0" />
            <span className={`font-medium ${isLimitedSpots ? "text-warning-600" : "text-success-600"}`}>
              {program.availableSlots} spots left
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">
              {program.applicationFee > 0 ? `GHS ${program.applicationFee.toLocaleString()}` : "Free"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{program.university.shortName || program.university.name}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Apply by <span className="font-medium text-foreground">{formatDate(program.applicationDeadline)}</span></span>
        </div>
        <Button variant="accent" size="sm" asChild>
          <Link href={`/programs/${program.slug}`}>View Program</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface PageProps {
  searchParams: Promise<{ field?: string }>;
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  const { field } = await searchParams;

  let programs: Program[] = [];
  let error: string | null = null;

  try {
    const response = await api.programs.list({ status: "OPEN", limit: 20 });
    programs = response.programs;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load programs";
    console.error("Failed to fetch programs:", e);
  }

  // Filter client-side by field (tabs drive URL, filter here)
  const filtered =
    field && field !== "ALL"
      ? programs.filter((p) => p.field.toUpperCase() === field.toUpperCase())
      : programs;

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container-page py-6">
          <div className="mb-4">
            <h1 className="text-3xl font-display font-bold tracking-tight">Training Programs</h1>
            <p className="text-muted-foreground mt-1">
              Employer-backed programs with guaranteed placements
            </p>
          </div>
          {/* Client island for filter tabs */}
          <Suspense fallback={<div className="h-10" />}>
            <FieldFilterTabs activeField={field || "ALL"} />
          </Suspense>
        </div>
      </div>

      <div className="container-page py-8">
        {error ? (
          <Card className="p-8 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No programs found</h2>
            <p className="text-muted-foreground mb-4">
              {field && field !== "ALL"
                ? `No open programs in the ${field} field right now.`
                : "No programs are currently open. Check back soon!"}
            </p>
            {field && field !== "ALL" && (
              <Button variant="outline" asChild>
                <Link href="/programs">View All Programs</Link>
              </Button>
            )}
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} program{filtered.length !== 1 ? "s" : ""} available
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
