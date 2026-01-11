import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  Briefcase,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workstream/ui/components/avatar";
import { Progress } from "@workstream/ui/components/progress";
import { Separator } from "@workstream/ui/components/separator";

const profileData = {
  firstName: "Kofi",
  lastName: "Asante",
  email: "kofi.asante@email.com",
  phone: "+233 24 123 4567",
  location: "Accra, Ghana",
  dateOfBirth: "March 15, 1999",
  bio: "Final year Computer Science student passionate about software development and building products that solve real problems.",
  
  education: {
    institution: "University of Ghana",
    degree: "BSc Computer Science",
    graduationYear: "2025",
    gpa: "3.7",
  },
  
  skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
  
  interests: ["Software Engineering", "Product Management", "Data Science"],
  
  completionItems: [
    { label: "Basic Info", complete: true },
    { label: "Education", complete: true },
    { label: "Skills", complete: true },
    { label: "Documents", complete: false },
    { label: "Personal Statement", complete: false },
  ],
};

function ProfileHeader() {
  return (
    <div className="border-b border-border bg-background sticky top-0 z-40">
      <div className="container-page py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileCard() {
  const completedCount = profileData.completionItems.filter(i => i.complete).length;
  const totalCount = profileData.completionItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <Card variant="elevated">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src="" />
            <AvatarFallback className="text-2xl font-display font-bold">
              {profileData.firstName[0]}{profileData.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-display font-bold">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-muted-foreground mt-1">
              {profileData.education.degree} • {profileData.education.institution}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profileData.location}
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Class of {profileData.education.graduationYear}
              </div>
            </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
            <div className="bg-secondary/50 rounded-xl p-4 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="text-2xl font-display font-bold text-accent">
                  {completionPercentage}%
                </span>
                <span className="text-sm text-muted-foreground">complete</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoSection({ 
  title, 
  icon: Icon, 
  children,
  action
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ContactInfo() {
  return (
    <InfoSection 
      title="Contact Information" 
      icon={User}
      action={<Button variant="ghost" size="sm">Edit</Button>}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{profileData.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Phone</p>
          <p className="font-medium">{profileData.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p className="font-medium">{profileData.location}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date of Birth</p>
          <p className="font-medium">{profileData.dateOfBirth}</p>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Bio</p>
        <p className="text-sm">{profileData.bio}</p>
      </div>
    </InfoSection>
  );
}

function EducationInfo() {
  return (
    <InfoSection 
      title="Education" 
      icon={GraduationCap}
      action={<Button variant="ghost" size="sm">Edit</Button>}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <GraduationCap className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-medium">{profileData.education.degree}</h4>
          <p className="text-sm text-muted-foreground">{profileData.education.institution}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-muted-foreground">
              Expected {profileData.education.graduationYear}
            </span>
            <Badge variant="success">GPA: {profileData.education.gpa}</Badge>
          </div>
        </div>
      </div>
    </InfoSection>
  );
}

function SkillsInfo() {
  return (
    <InfoSection 
      title="Skills" 
      icon={Briefcase}
      action={<Button variant="ghost" size="sm">Edit</Button>}
    >
      <div className="flex flex-wrap gap-2">
        {profileData.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="px-3 py-1">
            {skill}
          </Badge>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Career Interests</p>
        <div className="flex flex-wrap gap-2">
          {profileData.interests.map((interest) => (
            <Badge key={interest} variant="outline" className="px-3 py-1">
              {interest}
            </Badge>
          ))}
        </div>
      </div>
    </InfoSection>
  );
}

function DocumentsLink() {
  return (
    <Link href="/profile/documents">
      <Card className="hover:border-accent/30 hover:shadow-md transition-all group">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <h4 className="font-medium group-hover:text-accent transition-colors">
                  Documents
                </h4>
                <p className="text-sm text-muted-foreground">
                  2 of 4 required documents uploaded
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CompletionChecklist() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Checklist</CardTitle>
        <CardDescription>Complete these to unlock all programs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {profileData.completionItems.map((item) => (
          <div 
            key={item.label}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.complete ? (
                <CheckCircle className="h-5 w-5 text-success-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning-500" />
              )}
              <span className={item.complete ? "text-muted-foreground" : "font-medium"}>
                {item.label}
              </span>
            </div>
            {item.complete && (
              <Badge variant="success" className="text-xs">Done</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background pb-12">
      <ProfileHeader />
      
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileCard />
            <ContactInfo />
            <EducationInfo />
            <SkillsInfo />
            <DocumentsLink />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <CompletionChecklist />
          </div>
        </div>
      </div>
    </main>
  );
}
