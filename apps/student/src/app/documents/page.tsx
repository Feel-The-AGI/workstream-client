"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { UploadDropzone } from "@/lib/uploadthing";
import { api } from "@/lib/api";

interface Document {
  id: string;
  type: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  verificationStatus: string;
  uploadedAt: string;
}

const documentTypes = [
  { value: "TRANSCRIPT", label: "Academic Transcript", description: "Your official academic records" },
  { value: "CERTIFICATE", label: "Certificates", description: "WASSCE, degree certificates, etc." },
  { value: "CV", label: "CV/Resume", description: "Your curriculum vitae" },
  { value: "ID_DOCUMENT", label: "ID Document", description: "National ID, passport, etc." },
  { value: "RECOMMENDATION", label: "Recommendation Letter", description: "Letters from teachers or employers" },
  { value: "OTHER", label: "Other Documents", description: "Any other supporting documents" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  VERIFIED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
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

  async function handleUploadComplete(res: { fileUrl: string; fileName: string; fileSize: number }[]) {
    if (!selectedType || res.length === 0) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      // Save each uploaded file to the backend
      for (const file of res) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: selectedType,
            name: documentTypes.find(t => t.value === selectedType)?.label || selectedType,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            mimeType: file.fileName.endsWith(".pdf") ? "application/pdf" : "image/*",
          }),
        });
      }

      // Refresh documents list
      await fetchDocuments();
      setSelectedType(null);
    } catch (err) {
      console.error("Failed to save document:", err);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">My Documents</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          
          {!selectedType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 text-left transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Upload {documentTypes.find(t => t.value === selectedType)?.label}
                </h3>
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
              
              <UploadDropzone
                endpoint="documentUploader"
                onClientUploadComplete={(res) => {
                  if (res) {
                    handleUploadComplete(res.map(f => ({
                      fileUrl: f.ufsUrl,
                      fileName: f.name,
                      fileSize: f.size,
                    })));
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error.message);
                }}
                onUploadBegin={() => setUploading(true)}
                appearance={{
                  container: "border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-amber-500 transition-colors",
                  uploadIcon: "text-amber-500",
                  label: "text-gray-600",
                  allowedContent: "text-gray-500",
                  button: "bg-amber-500 hover:bg-amber-600 ut-uploading:bg-amber-400",
                }}
              />
              
              <p className="text-sm text-gray-500 mt-4">
                Accepted formats: PDF, JPG, PNG. Max file size: 8MB.
              </p>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{doc.fileName}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[doc.verificationStatus]}`}>
                      {doc.verificationStatus}
                    </span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Why upload documents?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Documents are verified using AI to speed up your application</li>
                <li>• Verified documents can be reused across multiple applications</li>
                <li>• Your documents are securely stored and encrypted</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
