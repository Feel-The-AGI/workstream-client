import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workstream | Launch Your Career",
  description: "Ghana's demand-led pathway from education to employment. Apply to curated programs, get trained, and land guaranteed interviews.",
  keywords: ["jobs", "careers", "Ghana", "employment", "training", "education"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-body antialiased">
        {children}
      </body>
    </html>
  );
}
