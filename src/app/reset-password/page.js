"use client";

import Link from "next/link";
import { Lock, Eye, ArrowLeft, Loader2, CheckCircle2, Info } from "lucide-react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md card text-center space-y-4 border-green-200 bg-green-50/50">
          <div className="flex justify-center text-primary-light">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-2xl font-bold text-primary">Password Reset!</h1>
          <p className="text-sm text-text-light">Your password has been changed successfully. Redirecting you to login...</p>
          <Link href="/login" className="btn-primary w-full py-3 text-sm inline-block mt-2">
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Set New Password</h1>
          <p className="text-sm text-text-light">Create a strong, secure password.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 card">
          <div>
            <div className="input-icon-wrapper relative">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"
              >
                <Eye size={18} />
              </button>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-text-light">
              <Info size={12} className="shrink-0" /> Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
            </p>
          </div>

          <div className="input-icon-wrapper relative">
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : "Reset Password"}
          </button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-text-light hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}