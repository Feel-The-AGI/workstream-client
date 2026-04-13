"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@workstream/ui/components/button";
import { api } from "@/lib/api";

type VerifyResult = {
  payment: {
    id: string;
    status: string;
    amount: number;
    paidAt: string | null;
  };
  application: {
    id: string;
    applicationNumber: string;
    status: string;
  };
};

export default function PaymentCallbackContent() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setError("No payment reference found.");
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const data = await api.payments.verify(token, reference);
        setResult(data as VerifyResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment verification failed");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference, getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Payment Verification Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="accent" asChild>
            <Link href="/dashboard/applications">Back to Applications</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isSuccess =
    (result?.payment?.status === "COMPLETED" || result?.payment?.status === "SUCCESS") ?? false;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="h-16 w-16 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success-600" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Payment Confirmed!</h1>
            <p className="text-muted-foreground mb-4">
              Your application has been submitted successfully.
            </p>
            {result?.payment && (
              <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">
                    GHS {result.payment.amount.toLocaleString()}
                  </span>
                </div>
                {reference && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{reference}</span>
                  </div>
                )}
              </div>
            )}
            <Button variant="accent" asChild className="w-full">
              <Link href="/dashboard/applications">View My Applications</Link>
            </Button>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-warning-600" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Payment Verification Failed</h1>
            <p className="text-muted-foreground mb-6">
              We could not confirm your payment. Please check your applications or contact support if the issue persists.
            </p>
            <Button variant="accent" asChild className="w-full">
              <Link href="/dashboard/applications">Back to Applications</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
