"use client";

import Link from "next/link";
import { HeartPulse, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
            <HeartPulse size={32} />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-primary">Forgot Password?</h1>
          <p className="text-sm text-text-light">No worries, we'll send you reset instructions.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="card text-center space-y-4 border-green-200 bg-green-50/50">
            <div className="flex justify-center text-primary-light">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-lg font-semibold text-primary">Check your email</h2>
            <p className="text-sm text-text-light">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox (and spam folder).
            </p>
            <Link href="/login" className="btn-primary w-full py-3 text-sm inline-block mt-2">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 card">
            <div className="input-icon-wrapper">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="Enter your Gmail address" 
                className="input-field" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-text-light hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}