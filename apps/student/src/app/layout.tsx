import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workstream | Launch Your Career",
  description: "Ghana's demand-led pathway from education to employment. Apply to curated programs, get trained, and land guaranteed interviews.",
  keywords: ["jobs", "careers", "Ghana", "employment", "training", "education"],
};

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey = clerkPubKey && clerkPubKey.startsWith("pk_") && !clerkPubKey.includes("placeholder");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-body antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );

  if (hasValidClerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
