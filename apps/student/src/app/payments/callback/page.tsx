import { Suspense } from "react";
import PaymentCallbackContent from "./payment-callback-content";

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Verifying payment...</p>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
