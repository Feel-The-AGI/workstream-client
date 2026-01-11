import Link from "next/link";
import { ArrowLeft, Search, Filter, Clock, Users, MapPin, Building2 } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Input } from "@workstream/ui/components/input";

const programs = [
  {
    id: "1",
    title: "Software Engineering Track",
    employer: "TechCorp Ghana",
    description: "Master modern web development with React, Node.js, and cloud technologies. Build production-ready applications and deploy to scale.",
    duration: "12 weeks",
    format: "Full-time",
    location: "Remote-friendly",
    spotsLeft: 15,
    totalSpots: 25,
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    salary: "GHS 4,500 - 6,500/month",
    deadline: "Jan 20, 2026",
  },
  {
    id: "2",
    title: "Data Analytics Cohort",
    employer: "FinServ Africa",
    description: "Learn to transform raw data into actionable insights. Master SQL, Python, and visualization tools used by leading companies.",
    duration: "8 weeks",
    format: "Part-time",
    location: "Accra",
    spotsLeft: 10,
    totalSpots: 20,
    skills: ["SQL", "Python", "Tableau", "Excel"],
    salary: "GHS 3,800 - 5,200/month",
    deadline: "Jan 25, 2026",
  },
  {
    id: "3",
    title: "Customer Success Program",
    employer: "GlobalTech",
    description: "Develop skills to help customers achieve their goals. Learn communication, problem-solving, and product expertise.",
    duration: "6 weeks",
    format: "Full-time",
    location: "Hybrid",
    spotsLeft: 20,
    totalSpots: 30,
    skills: ["Communication", "CRM Tools", "Problem Solving"],
    salary: "GHS 3,200 - 4,000/month",
    deadline: "Feb 1, 2026",
  },
  {
    id: "4",
    title: "Product Management Track",
    employer: "StartupHub",
    description: "Learn to build products users love. Master user research, roadmapping, and cross-functional collaboration.",
    duration: "10 weeks",
    format: "Full-time",
    location: "Remote",
    spotsLeft: 8,
    totalSpots: 15,
    skills: ["User Research", "Roadmapping", "Agile", "Analytics"],
    salary: "GHS 5,000 - 7,500/month",
    deadline: "Jan 30, 2026",
  },
  {
    id: "5",
    title: "Digital Marketing Accelerator",
    employer: "MediaWave Ghana",
    description: "Master digital marketing channels including social media, SEO, content marketing, and paid advertising.",
    duration: "8 weeks",
    format: "Part-time",
    location: "Accra",
    spotsLeft: 12,
    totalSpots: 25,
    skills: ["Social Media", "SEO", "Google Ads", "Content"],
    salary: "GHS 2,800 - 4,200/month",
    deadline: "Feb 5, 2026",
  },
];

function ProgramCard({ program }: { program: typeof programs[0] }) {
  const spotsPercentage = (program.spotsLeft / program.totalSpots) * 100;
  const isLimitedSpots = spotsPercentage <= 40;
  
  return (
    <Card className="group hover:border-accent/30 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline">{program.format}</Badge>
              <Badge variant="outline">{program.location}</Badge>
            </div>
            <CardTitle className="text-xl group-hover:text-accent transition-colors">
              {program.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="h-4 w-4" />
              {program.employer}
            </CardDescription>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-lg font-semibold ${isLimitedSpots ? 'text-warning-600' : 'text-success-600'}`}>
              {program.spotsLeft} spots
            </span>
            <p className="text-xs text-muted-foreground">left</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {program.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {program.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{program.location}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expected Salary</span>
            <span className="font-medium">{program.salary}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Deadline: <span className="font-medium text-foreground">{program.deadline}</span>
        </span>
        <Button variant="accent" asChild>
          <Link href={`/programs/${program.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
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
        <div className="grid md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </main>
  );
}
