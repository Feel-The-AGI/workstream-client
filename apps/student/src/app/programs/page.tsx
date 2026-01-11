import Link from "next/link";
import { ArrowLeft, Search, Filter, Clock, Users, MapPin, Building2, GraduationCap, Banknote, Calendar } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Input } from "@workstream/ui/components/input";
import { api, type Program } from "../../lib/api";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProgramCard({ program }: { program: Program }) {
  const spotsPercentage = (program.availableSlots / program.totalSlots) * 100;
  const isLimitedSpots = spotsPercentage <= 40;
  const durationMonths = Math.round(program.durationWeeks / 4.33);
  
  return (
    <Card className="group hover:border-accent/30 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{program.field}</Badge>
              {program.hasInternship && (
                <Badge variant="outline">Co-op</Badge>
              )}
              {program.isFunded && (
                <Badge className="bg-success-600/10 text-success-600 border-success-600/20">Funded</Badge>
              )}
            </div>
            <CardTitle className="text-xl group-hover:text-accent transition-colors">
              {program.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              {program.employer.name}
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-lg font-semibold ${isLimitedSpots ? 'text-warning-600' : 'text-success-600'}`}>
              {program.availableSlots} spots
            </span>
            <p className="text-xs text-muted-foreground">of {program.totalSlots}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {program.shortDescription || program.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {program.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{durationMonths} months</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>{program.university.shortName || program.university.name}</span>
          </div>
        </div>
        
        {program.stipendAmount && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Banknote className="h-4 w-4" />
                Monthly Stipend
              </span>
              <span className="font-medium">GHS {program.stipendAmount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Deadline: <span className="font-medium text-foreground">{formatDate(program.applicationDeadline)}</span>
        </span>
        <Button variant="accent" asChild>
          <Link href={`/programs/${program.slug}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function ProgramsPage() {
  let programs: Program[] = [];
  let error: string | null = null;
  
  try {
    const response = await api.programs.list({ status: "OPEN" });
    programs = response.programs;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load programs";
    console.error("Failed to fetch programs:", e);
  }
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Programs</h1>
              <p className="text-sm text-muted-foreground">
                {programs.length} programs available
              </p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search programs, skills, employers..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Programs Grid */}
      <div className="container-page py-8">
        {error ? (
          <Card className="p-8 text-center">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
          </Card>
        ) : programs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No programs available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for new opportunities!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
