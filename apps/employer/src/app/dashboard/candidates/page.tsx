import { Suspense } from "react";
import CandidatesContent from "./candidates-content";

export default function DashboardCandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CandidatesContent />
    </Suspense>
  );
}
