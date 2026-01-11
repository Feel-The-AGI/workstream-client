"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@workstream/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workstream/ui/components/card";
import { ArrowLeft, AlertCircle } from "lucide-react";

const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("placeholder");

function ClerkNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-warning-600" />
          </div>
          <CardTitle>Authentication Not Configured</CardTitle>
          <CardDescription>
            Clerk authentication keys are not set up yet. Add your keys to .env.local to enable sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4 text-sm font-mono">
            <p className="text-muted-foreground mb-2"># .env.local</p>
            <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...</p>
            <p>CLERK_SECRET_KEY=sk_...</p>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  if (!hasClerk) {
    return <ClerkNotConfigured />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border border-border shadow-xl rounded-2xl",
              headerTitle: "font-display text-2xl font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border border-border hover:bg-secondary transition-colors",
              formButtonPrimary: "bg-accent hover:bg-accent/90 text-accent-foreground transition-colors",
              footerActionLink: "text-accent hover:text-accent/80",
              formFieldInput: "border border-input focus:ring-2 focus:ring-ring rounded-md",
            },
          }}
        />
      </div>
    </div>
  );
}
