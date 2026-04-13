"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FileText, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { Badge } from "@workstream/ui/components/badge";
import { Button } from "@workstream/ui/components/button";
import { Input } from "@workstream/ui/components/input";
import { Label } from "@workstream/ui/components/label";
import { Skeleton } from "@workstream/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workstream/ui/components/select";
import { UploadButton } from "@/lib/uploadthing";
import { api, type Document } from "@/lib/api";

const DOC_TYPE_LABELS: Record<string, string> = {
  TRANSCRIPT: "Academic Transcript",
  CERTIFICATE: "Certificate",
  CV: "CV / Resume",
  ID_DOCUMENT: "ID Document",
  RECOMMENDATION: "Recommendation Letter",
  OTHER: "Other",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  TRANSCRIPT: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  CV: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
  ID_DOCUMENT: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  CERTIFICATE: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  RECOMMENDATION: "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800",
  OTHER: "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700",
};

const VERIFICATION_BADGE_VARIANT: Record<
  string,
  "secondary" | "accent" | "outline" | "success" | "warning"
> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "outline",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DocumentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-9 w-28 rounded" />
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [docName, setDocName] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    fetchDocuments();
  }, [isLoaded, isSignedIn]);

  async function fetchDocuments() {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.documents.list(token);
      setDocuments(data.documents as Document[]);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pb-12">
      <div className="container-page py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-display font-bold tracking-tight">My Documents</h1>
          {!loading && documents.length > 0 && (
            <Badge variant="secondary" className="text-sm font-medium">
              {documents.length}
            </Badge>
          )}
        </div>

        {/* Upload card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload a Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-type">Document Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="doc-type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name">Document Name (optional)</Label>
                <Input
                  id="doc-name"
                  placeholder="e.g. WASSCE Certificate 2023"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <UploadButton
                endpoint="documentUploader"
                onClientUploadComplete={async (res) => {
                  if (!res || res.length === 0) return;
                  setUploadError(null);
                  try {
                    const token = await getToken();
                    if (!token) throw new Error("Not authenticated");
                    await api.documents.create(token, {
                      type: selectedType || "OTHER",
                      name: docName || res[0].name,
                      fileName: res[0].name,
                      fileUrl: res[0].ufsUrl ?? (res[0] as { url?: string }).url ?? "",
                      fileSize: res[0].size,
                      mimeType: "application/octet-stream",
                    });
                    setUploadSuccess(true);
                    setDocName("");
                    setSelectedType("");
                    await fetchDocuments();
                    setTimeout(() => setUploadSuccess(false), 3000);
                  } catch (err) {
                    setUploadError(err instanceof Error ? err.message : "Failed to save document");
                  }
                }}
                onUploadError={(error: Error) => {
                  setUploadError(error.message);
                }}
              />
            </div>

            {uploadSuccess && (
              <p className="text-sm text-success-600 font-medium">
                Document uploaded successfully!
              </p>
            )}
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, JPG, PNG. Max file size: 8 MB.
            </p>
          </CardContent>
        </Card>

        {/* Documents grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </div>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No documents yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Upload your first document using the form above. Verified documents can be reused across multiple applications.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="flex flex-col">
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  {/* Type badge + verification badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        DOC_TYPE_COLORS[doc.type] ?? DOC_TYPE_COLORS.OTHER,
                      ].join(" ")}
                    >
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </span>
                    <Badge variant={VERIFICATION_BADGE_VARIANT[doc.verificationStatus] ?? "secondary"}>
                      {doc.verificationStatus}
                    </Badge>
                  </div>

                  {/* Name */}
                  <p className="font-semibold leading-snug">{doc.name}</p>

                  {/* File name */}
                  <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>

                  {/* Size + date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>

                  {/* View button */}
                  <div className="mt-auto pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Document
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
