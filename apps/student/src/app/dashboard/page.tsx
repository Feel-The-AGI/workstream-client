"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, useAuth } from "@clerk/nextjs";
import { 
  ArrowRight, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Briefcase,
  User,
  Loader2,
  ChevronRight,
  Building2
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Progress } from "@workstream/ui/components/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@workstream/ui/components/avatar";
import { Separator } from "@workstream/ui/components/separator";
import { api, type Program } from "../../lib/api";

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  createdAt: string;
  program: {
    title: string;
    slug: string;
    employer: { name: string };
  };
}

function DashboardNav() {
  const { user } = useUser();
  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <span className="font-display text-lg font-bold text-accent-foreground">W</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Workstream</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.imageUrl || ""} />
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}

function ProfileCompletionCard() {
  const completionPercentage = 65;
  const pendingItems = [
    { label: "Upload Transcript", icon: FileText, href: "/profile/documents" },
    { label: "Add National ID", icon: FileText, href: "/profile/documents" },
  ];
  
  return (
    <Card variant="accent" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-16 -mt-16" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Complete Your Profile</CardTitle>
            <CardDescription>Finish setting up to unlock applications</CardDescription>
          </div>
          <span className="text-3xl font-display font-bold text-accent">{completionPercentage}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completionPercentage} className="h-2" />
        
        <div className="space-y-2">
          {pendingItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-warning-600" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationsCard({ applications }: { applications: Application[] }) {
  const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "destructive" | "secondary"; icon: React.ComponentType<{className?: string}> }> = {
    DRAFT: { label: "Draft", variant: "secondary", icon: FileText },
    SUBMITTED: { label: "Submitted", variant: "secondary", icon: Clock },
    UNDER_REVIEW: { label: "Under Review", variant: "warning", icon: Clock },
    SHORTLISTED: { label: "Shortlisted", variant: "success", icon: CheckCircle },
    INTERVIEW_SCHEDULED: { label: "Interview Scheduled", variant: "success", icon: CheckCircle },
    ACCEPTED: { label: "Accepted", variant: "success", icon: CheckCircle },
    REJECTED: { label: "Not Selected", variant: "destructive", icon: AlertCircle },
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">My Applications</CardTitle>
            <CardDescription>{applications.length} application{applications.length !== 1 ? "s" : ""}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applications">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No applications yet</p>
          </div>
        ) : (
          applications.slice(0, 3).map((app) => {
            const status = statusConfig[app.status] || statusConfig.DRAFT;
            const StatusIcon = status.icon;
            return (
              <Link 
                key={app.id}
                href={`/applications/${app.id}`}
                className="block p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{app.program.title}</h4>
                    <p className="text-sm text-muted-foreground">{app.program.employer.name}</p>
                  </div>
                  <Badge variant={status.variant}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Applied {new Date(app.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/programs" className="gap-2">
            Browse More Programs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function RecommendedProgramsCard({ programs }: { programs: Program[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Open Programs</CardTitle>
        <CardDescription>Available training programs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No programs available</p>
        ) : (
          programs.slice(0, 3).map((program) => {
            const durationMonths = Math.round(program.durationWeeks / 4.33);
            return (
              <Link 
                key={program.id}
                href={`/programs/${program.slug}`}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-accent transition-colors">{program.title}</h4>
                    <p className="text-sm text-muted-foreground">{program.employer.name} • {durationMonths} months</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-success-600">{program.availableSlots}</span>
                  <p className="text-xs text-muted-foreground">spots</p>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "Upload Documents", icon: FileText, href: "/profile/documents" },
    { label: "Edit Profile", icon: User, href: "/profile" },
    { label: "View Certifications", icon: GraduationCap, href: "/certifications" },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button key={action.label} variant="ghost" className="justify-start h-auto py-3" asChild>
            <Link href={action.href}>
              <action.icon className="h-5 w-5 mr-3 text-muted-foreground" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch programs (public)
        const programsResponse = await api.programs.list({ status: "OPEN", limit: 3 });
        setPrograms(programsResponse.programs);

        // Fetch applications (requires auth)
        if (isSignedIn) {
          const token = await getToken();
          if (token) {
            const appsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/applications`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (appsResponse.ok) {
              const appsData = await appsResponse.json();
              setApplications(appsData.applications || []);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (userLoaded) {
      fetchData();
    }
  }, [userLoaded, isSignedIn, getToken]);

  if (!userLoaded || loading) {
    return (
      <>
        <DashboardNav />
        <main className="pt-24 pb-12 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <main className="pt-24 pb-12">
        <div className="container-page">
          {/* Welcome Header */}
          <div className="mb-8 stagger-children">
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your applications
            </p>
          </div>
          
          {/* Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileCompletionCard />
              <ApplicationsCard applications={applications} />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <RecommendedProgramsCard programs={programs} />
              <QuickActionsCard />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
