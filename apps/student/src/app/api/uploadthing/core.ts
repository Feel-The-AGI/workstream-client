import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define document upload route
  documentUploader: f({ 
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      const { userId } = await auth();

      // If you throw, the user will not be able to upload
      if (!userId) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      // Return the file URL to the client
      return { fileUrl: file.ufsUrl, fileName: file.name, fileSize: file.size };
    }),

  // Specific upload routes for different document types
  transcriptUploader: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId, documentType: "TRANSCRIPT" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { 
        fileUrl: file.ufsUrl, 
        fileName: file.name, 
        fileSize: file.size,
        documentType: metadata.documentType 
      };
    }),

  certificateUploader: f({ 
    pdf: { maxFileSize: "8MB", maxFileCount: 3 },
    image: { maxFileSize: "4MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId, documentType: "CERTIFICATE" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { 
        fileUrl: file.ufsUrl, 
        fileName: file.name, 
        fileSize: file.size,
        documentType: metadata.documentType 
      };
    }),

  cvUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId, documentType: "CV" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { 
        fileUrl: file.ufsUrl, 
        fileName: file.name, 
        fileSize: file.size,
        documentType: metadata.documentType 
      };
    }),

  idDocumentUploader: f({ 
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId, documentType: "ID_DOCUMENT" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { 
        fileUrl: file.ufsUrl, 
        fileName: file.name, 
        fileSize: file.size,
        documentType: metadata.documentType 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
