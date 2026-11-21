"use client";

import { Clock, LogOut, ShieldAlert } from "lucide-react";

export default function PendingApprovalPage() {
  
  // This function actually deletes the cookie via the API
  const handleLogout = async () => {
    try {
      await fetch("/api/auth-logout", { method: "POST" });
      // Force a hard reload to ensure the proxy and client cache clear
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
            <Clock size={48} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-text">Account Pending Approval</h1>
          <p className="text-text-light text-sm max-w-md mx-auto">
            Thank you for registering as a doctor. Your account has been successfully activated. 
            However, an administrator must review and approve your profile before you can access the doctor dashboard.
          </p>
        </div>

        <div className="card space-y-4 text-left border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text">What happens next?</p>
              <ul className="list-disc pl-4 text-xs text-text-light mt-1 space-y-1">
                <li>Our team will verify your medical credentials.</li>
                <li>This usually takes 24-48 hours.</li>
                <li>You will receive an email once approved.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-2">
          {/* Changed Link to Button with onClick handler */}
          <button 
            onClick={handleLogout}
            className="btn-secondary w-full py-3 text-sm inline-flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}