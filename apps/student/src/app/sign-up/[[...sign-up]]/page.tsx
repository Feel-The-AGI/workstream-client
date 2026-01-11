import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
