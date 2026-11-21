"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ActivateContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("No activation token found in the URL.");
        return;
      }

      try {
        const res = await fetch("/api/auth-activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Activation failed");
        }

        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(error.message);
      }
    };

    activateAccount();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="flex justify-center text-primary">
              <Loader2 size={48} className="animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Verifying your account...</h1>
            <p className="text-text-light text-sm">Please wait while we activate your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center text-primary-light">
              <CheckCircle2 size={64} />
            </div>
            <h1 className="text-3xl font-bold text-primary">Account Activated!</h1>
            <p className="text-text-light text-sm">Your email has been successfully verified. You can now sign in to your account.</p>
            <Link href="/login" className="btn-primary w-full py-3 text-sm inline-block mt-4">
              Proceed to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center text-red-500">
              <XCircle size={64} />
            </div>
            <h1 className="text-3xl font-bold text-text">Activation Failed</h1>
            <p className="text-text-light text-sm">{errorMessage}</p>
            <div className="space-y-3 mt-4">
              <Link href="/activate-request" className="btn-primary w-full py-3 text-sm inline-block">
                Request New Link
              </Link>
              <Link href="/login" className="btn-secondary w-full py-3 text-sm inline-block">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <ActivateContent />
    </Suspense>
  );
}