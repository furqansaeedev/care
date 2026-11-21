"use client";

import Link from "next/link";
import { HeartPulse, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function ActivateRequestPage() {
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldown]);

  const handleResend = () => {
    if (!canResend) return;
    // In Phase 5, this will call the API to resend the email
    setCooldown(60);
    setCanResend(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-primary">
            <Mail size={40} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">Check your email</h1>
          <p className="text-text-light text-sm">
            We've sent a verification link to your Gmail address. Click the link to activate your MediCare+ account.
          </p>
        </div>

        <div className="card space-y-4 text-left">
          <div className="flex items-center gap-3 text-sm text-text">
            <CheckCircle2 size={18} className="text-primary-light shrink-0" />
            <p>Check your inbox (and spam folder).</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-text">
            <CheckCircle2 size={18} className="text-primary-light shrink-0" />
            <p>The link will expire in 24 hours.</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`btn-primary w-full py-3 text-sm ${!canResend ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {canResend ? "Resend Verification Email" : `Resend available in ${cooldown}s`}
          </button>
          <Link href="/login" className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
            Back to Login <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}