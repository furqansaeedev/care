"use client";

import Link from "next/link";
import { HeartPulse, Mail, Lock, Eye, CheckCircle2, User, Shield, Loader2, Info, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicNavLinks } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setSuccess("");
    const formData = new FormData(e.target); const data = Object.fromEntries(formData.entries()); data.action = isRegistering ? "register" : "login";
    try {
      const res = await fetch("/api/auth-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) { if (result.needsActivation) { router.push("/activate-request"); return; } throw new Error(result.error || "Something went wrong"); }
      if (isRegistering) { router.push("/activate-request"); } else { router.push(result.redirect || "/dashboard"); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      <details className="md:hidden absolute top-4 right-4 z-50 group">
        <summary className="list-none cursor-pointer text-primary p-2 flex items-center justify-center bg-surface rounded-md shadow-md"><Menu size={24} className="group-open:hidden" /><X size={24} className="hidden group-open:block" /></summary>
        <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl p-4 flex flex-col gap-4">
          {publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text hover:text-primary py-2 border-b border-border/50">{link.name}</Link>))}
        </div>
      </details>
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-secondary/60 to-secondary p-12 relative overflow-hidden">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div><span className="text-xl font-bold text-primary">MediCare+</span></Link>
          <div className="space-y-4 mt-12">
            <h1 className="text-4xl font-bold text-primary leading-tight">{isRegistering ? "Create an Account" : "Welcome Back!"}</h1>
            <p className="text-lg text-text-light">{isRegistering ? "Join us to get the best healthcare." : "Sign in to your account"}</p>
            <ul className="space-y-3 pt-4">{["Quality Healthcare", "Expert Doctors", "24/7 Support"].map((item, i) => (<li key={i} className="flex items-center gap-3 text-sm font-medium text-text"><CheckCircle2 size={20} className="text-primary-light" /> {item}</li>))}</ul>
          </div>
        </div>
        <div className="relative flex justify-center items-center mt-8"><div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center"><HeartPulse size={80} className="text-primary-light opacity-50" /></div></div>
      </div>
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 md:p-16 mt-12 md:mt-0">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left"><h2 className="text-2xl font-bold text-primary">{isRegistering ? "Register" : "Sign In"}</h2><p className="text-sm text-text-light mt-1">{isRegistering ? "Enter your details to create an account" : "Enter your details to access your account"}</p></div>
          {error && (<div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>)}
          {success && (<div className="rounded-xl bg-green-50 p-3 text-sm text-green-600 border border-green-200">{success}</div>)}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (<div className="input-icon-wrapper"><User size={18} /><input type="text" name="name" placeholder="Full Name" className="input-field" required /></div>)}
            <div className="input-icon-wrapper"><Mail size={18} /><input type="email" name="email" placeholder="Enter your Gmail address" className="input-field" required /></div>
            {isRegistering && (<div className="input-icon-wrapper"><Shield size={18} /><select name="role" className="input-field text-text-light appearance-none" required defaultValue=""><option value="" disabled>Select Account Role</option><option value="PATIENT">Patient</option><option value="DOCTOR">Doctor</option></select></div>)}
            <div><div className="input-icon-wrapper relative"><Lock size={18} /><input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" className="input-field" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"><Eye size={18} /></button></div>{isRegistering && (<p className="mt-1 flex items-center gap-1 text-[11px] text-text-light"><Info size={12} className="shrink-0" /> Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.</p>)}</div>
            {isRegistering && (<div className="input-icon-wrapper relative"><Lock size={18} /><input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="input-field" required /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"><Eye size={18} /></button></div>)}
            {!isRegistering && (<div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-text-light"><input type="checkbox" className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-surface" />Remember me</label><Link href="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link></div>)}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">{loading ? (<><Loader2 size={18} className="animate-spin" /> Please wait...</>) : (isRegistering ? "Sign Up" : "Sign In")}</button>
          </form>
          <p className="text-center text-sm text-text-light">{isRegistering ? "Already have an account? " : "Don't have an account? "}<button onClick={() => { setIsRegistering(!isRegistering); setError(""); setSuccess(""); }} className="font-semibold text-primary hover:underline">{isRegistering ? "Sign In" : "Sign Up"}</button></p>
        </div>
      </div>
    </div>
  );
}