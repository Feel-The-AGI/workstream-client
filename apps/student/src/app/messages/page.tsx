import { Suspense } from "react";
import MessagesContent from "./messages-content";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
