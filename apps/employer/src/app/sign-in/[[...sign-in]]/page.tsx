import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
          <span className="text-white text-xl font-bold">W</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">Workstream Employer</span>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl rounded-2xl border border-gray-100",
            headerTitle: "text-2xl font-bold",
            formButtonPrimary:
              "bg-amber-500 hover:bg-amber-600 text-white transition-colors",
            footerActionLink: "text-amber-600 hover:text-amber-700",
          },
        }}
      />
    </div>
  );
}
