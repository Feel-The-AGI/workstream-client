import Link from "next/link";
import { 
  ArrowRight, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Briefcase,
  User,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Progress } from "@workstream/ui/components/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@workstream/ui/components/avatar";
import { Separator } from "@workstream/ui/components/separator";

function DashboardNav() {
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
            <AvatarImage src="" />
            <AvatarFallback>KA</AvatarFallback>
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

function ApplicationsCard() {
  const applications = [
    {
      id: "1",
      program: "Software Engineering Track",
      employer: "TechCorp Ghana",
      status: "under_review",
      appliedAt: "Jan 5, 2026",
    },
    {
      id: "2",
      program: "Data Analytics Cohort",
      employer: "FinServ Africa",
      status: "interview_scheduled",
      appliedAt: "Dec 28, 2025",
      interviewDate: "Jan 15, 2026",
    },
  ];
  
  const statusConfig = {
    under_review: { label: "Under Review", variant: "warning" as const, icon: Clock },
    interview_scheduled: { label: "Interview Scheduled", variant: "success" as const, icon: CheckCircle },
    accepted: { label: "Accepted", variant: "success" as const, icon: CheckCircle },
    rejected: { label: "Not Selected", variant: "destructive" as const, icon: AlertCircle },
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">My Applications</CardTitle>
            <CardDescription>{applications.length} active applications</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applications">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {applications.map((app) => {
          const status = statusConfig[app.status as keyof typeof statusConfig];
          return (
            <div 
              key={app.id}
              className="p-4 rounded-xl border border-border hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{app.program}</h4>
                  <p className="text-sm text-muted-foreground">{app.employer}</p>
                </div>
                <Badge variant={status.variant}>
                  <status.icon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Applied {app.appliedAt}</span>
                {app.interviewDate && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-success-600 font-medium">Interview: {app.interviewDate}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
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

function RecommendedProgramsCard() {
  const programs = [
    {
      id: "3",
      title: "Customer Success Program",
      employer: "GlobalTech",
      duration: "6 weeks",
      matchScore: 92,
    },
    {
      id: "4",
      title: "Product Management Track",
      employer: "StartupHub",
      duration: "10 weeks",
      matchScore: 87,
    },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommended for You</CardTitle>
        <CardDescription>Based on your profile and interests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.map((program) => (
          <Link 
            key={program.id}
            href={`/programs/${program.id}`}
            className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-medium group-hover:text-accent transition-colors">{program.title}</h4>
                <p className="text-sm text-muted-foreground">{program.employer} • {program.duration}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-display font-bold text-accent">{program.matchScore}%</span>
              <p className="text-xs text-muted-foreground">match</p>
            </div>
          </Link>
        ))}
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
  return (
    <>
      <DashboardNav />
      <main className="pt-24 pb-12">
        <div className="container-page">
          {/* Welcome Header */}
          <div className="mb-8 stagger-children">
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
              Welcome back, Kofi
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
              <ApplicationsCard />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <RecommendedProgramsCard />
              <QuickActionsCard />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
