import Link from "next/link";
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  File,
  Image,
  Trash2
} from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Progress } from "@workstream/ui/components/progress";

type DocumentStatus = "pending" | "uploaded" | "verified" | "rejected";

interface DocumentRequirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  rejectionReason?: string;
}

const documentRequirements: DocumentRequirement[] = [
  {
    id: "transcript",
    title: "Academic Transcript",
    description: "Official transcript from your university showing all completed courses and grades",
    required: true,
    status: "uploaded",
    fileName: "transcript_2025.pdf",
    fileSize: "2.4 MB",
    uploadedAt: "Jan 8, 2026",
  },
  {
    id: "degree",
    title: "Degree Certificate",
    description: "Scanned copy of your degree certificate or provisional degree letter",
    required: true,
    status: "verified",
    fileName: "bsc_computer_science.pdf",
    fileSize: "1.8 MB",
    uploadedAt: "Jan 5, 2026",
  },
  {
    id: "national_id",
    title: "National ID (Ghana Card)",
    description: "Clear photo of your Ghana Card, both front and back",
    required: true,
    status: "pending",
  },
  {
    id: "cv",
    title: "Curriculum Vitae",
    description: "Your updated CV highlighting education, skills, and any experience",
    required: true,
    status: "rejected",
    fileName: "kofi_cv.pdf",
    fileSize: "0.8 MB",
    uploadedAt: "Jan 3, 2026",
    rejectionReason: "CV format not standard. Please use our recommended template.",
  },
  {
    id: "personal_statement",
    title: "Personal Statement",
    description: "A 500-word statement about your career goals and why you want to join Workstream",
    required: false,
    status: "pending",
  },
  {
    id: "reference",
    title: "Reference Letter",
    description: "Letter of recommendation from a professor or previous employer",
    required: false,
    status: "pending",
  },
];

const statusConfig = {
  pending: { 
    label: "Not Uploaded", 
    variant: "secondary" as const, 
    icon: Clock,
    color: "text-muted-foreground"
  },
  uploaded: { 
    label: "Under Review", 
    variant: "warning" as const, 
    icon: Clock,
    color: "text-warning-600"
  },
  verified: { 
    label: "Verified", 
    variant: "success" as const, 
    icon: CheckCircle,
    color: "text-success-600"
  },
  rejected: { 
    label: "Rejected", 
    variant: "destructive" as const, 
    icon: AlertCircle,
    color: "text-error-500"
  },
};

function DocumentCard({ doc }: { doc: DocumentRequirement }) {
  const status = statusConfig[doc.status];
  const StatusIcon = status.icon;
  
  return (
    <Card className={`transition-all duration-200 ${doc.status === "rejected" ? "border-error-500/50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{doc.title}</CardTitle>
              {doc.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
            <CardDescription className="text-sm">{doc.description}</CardDescription>
          </div>
          <Badge variant={status.variant} className="shrink-0">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {doc.status === "pending" ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50 hover:border-accent/50 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
            </div>
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
          </label>
        ) : (
          <div className="space-y-3">
            {/* File preview */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.fileSize} • Uploaded {doc.uploadedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-error-500" />
                </Button>
              </div>
            </div>
            
            {/* Rejection reason */}
            {doc.status === "rejected" && doc.rejectionReason && (
              <div className="flex items-start gap-2 p-3 bg-error-500/10 rounded-lg border border-error-500/20">
                <AlertCircle className="h-4 w-4 text-error-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-error-500">Reupload Required</p>
                  <p className="text-sm text-muted-foreground">{doc.rejectionReason}</p>
                </div>
              </div>
            )}
            
            {/* Re-upload button for rejected docs */}
            {doc.status === "rejected" && (
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Version
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const uploadedCount = documentRequirements.filter(d => d.status !== "pending").length;
  const verifiedCount = documentRequirements.filter(d => d.status === "verified").length;
  const requiredCount = documentRequirements.filter(d => d.required).length;
  const requiredUploaded = documentRequirements.filter(d => d.required && d.status !== "pending").length;
  
  const completionPercentage = Math.round((verifiedCount / requiredCount) * 100);
  
  return (
    <main className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Documents</h1>
              <p className="text-sm text-muted-foreground">
                Upload and manage your application documents
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="stagger-children space-y-4">
              {documentRequirements.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card variant="accent">
              <CardHeader>
                <CardTitle className="text-lg">Document Progress</CardTitle>
                <CardDescription>
                  Complete all required documents to apply
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Verification Progress</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} />
                
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Required Documents</span>
                    <span className="font-medium">{requiredUploaded}/{requiredCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Verified</span>
                    <span className="font-medium text-success-600">{verifiedCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                  <span>Ensure documents are clear and readable</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                  <span>PDF format is preferred for text documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                  <span>For ID photos, ensure all text is visible</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500 mt-0.5 shrink-0" />
                  <span>Maximum file size is 10MB per document</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Need Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Having trouble with document uploads? Our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
