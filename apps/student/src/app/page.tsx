import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, TrendingUp, Shield, Users, CheckCircle } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <span className="font-display text-lg font-bold text-accent-foreground">W</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Workstream</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="#programs" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
            Programs
          </Link>
          <Link href="#employers" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
            For Employers
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container-page">
        <div className="max-w-4xl mx-auto text-center stagger-children">
          <Badge variant="accent" className="mb-6">
            Now accepting applications
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
            Your Career Starts With{" "}
            <span className="text-gradient">Guaranteed Interviews</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto mb-10">
            Join curated training programs backed by real employer demand. 
            Complete the program, nail the interview, land the job. 
            That&apos;s the Workstream guarantee.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="accent" size="xl" asChild>
              <Link href="/sign-up" className="gap-2">
                Apply to Programs
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-12 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <CheckCircle className="h-4 w-4 text-success-500" />
              <span>90%+ placement rate</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <Shield className="h-4 w-4 text-success-500" />
              <span>Employer-backed programs</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <Users className="h-4 w-4 text-success-500" />
              <span>500+ graduates placed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Browse & Apply",
      description: "Explore programs designed around real job openings. Apply with your academic records and documents.",
      icon: GraduationCap,
    },
    {
      number: "02", 
      title: "Get Trained",
      description: "Complete a focused training program tailored to employer needs. Gain practical skills that matter.",
      icon: TrendingUp,
    },
    {
      number: "03",
      title: "Interview & Land",
      description: "Meet directly with partner employers. Pass the interview and receive your job offer.",
      icon: Briefcase,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-16 stagger-children">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
            From Application to Employment
          </h2>
          <p className="text-foreground-secondary">
            A streamlined path that eliminates the guesswork from job hunting
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={step.number} variant="elevated" className="relative group hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-mono text-4xl font-bold text-accent/30 group-hover:text-accent transition-colors">
                    {step.number}
                  </span>
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{step.description}</CardDescription>
              </CardContent>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramsPreviewSection() {
  const programs = [
    {
      title: "Software Engineering Track",
      employer: "TechCorp Ghana",
      duration: "12 weeks",
      spots: 15,
      tags: ["Full-time", "Remote-friendly"],
    },
    {
      title: "Data Analytics Cohort",
      employer: "FinServ Africa",
      duration: "8 weeks",
      spots: 10,
      tags: ["Part-time", "Accra"],
    },
    {
      title: "Customer Success Program",
      employer: "GlobalTech",
      duration: "6 weeks",
      spots: 20,
      tags: ["Full-time", "Hybrid"],
    },
  ];

  return (
    <section id="programs" className="py-20 md:py-32">
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="stagger-children">
            <Badge variant="secondary" className="mb-4">Featured Programs</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
              Open Programs
            </h2>
            <p className="text-foreground-secondary max-w-xl">
              Each program is backed by committed employers with real job openings
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/programs" className="gap-2">
              View All Programs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.title} variant="default" className="group hover:border-accent/30 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex gap-2 mb-3">
                  {program.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-lg group-hover:text-accent transition-colors">
                  {program.title}
                </CardTitle>
                <CardDescription>by {program.employer}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-secondary">{program.duration}</span>
                  <span className="font-medium text-success-600">{program.spots} spots left</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="container-page">
        <div className="max-w-3xl mx-auto text-center stagger-children">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">
            Ready to Launch Your Career?
          </h2>
          <p className="text-lg opacity-80 mb-10">
            Join hundreds of graduates who found meaningful employment through Workstream. 
            Your next opportunity is waiting.
          </p>
          <Button 
            variant="accent" 
            size="xl" 
            asChild
            className="shadow-xl"
          >
            <Link href="/sign-up" className="gap-2">
              Create Your Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container-page">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="font-display text-sm font-bold text-accent-foreground">W</span>
            </div>
            <span className="font-display font-bold">Workstream</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-foreground-secondary">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          
          <p className="text-sm text-foreground-secondary">
            &copy; {new Date().getFullYear()} Workstream. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ProgramsPreviewSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
