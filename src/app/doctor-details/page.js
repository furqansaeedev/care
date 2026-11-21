import Link from "next/link";
import { HeartPulse, ArrowLeft, Award, Briefcase, User, Menu, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import ThemeToggle from "../ThemeToggle";
import { publicNavLinks } from "@/lib/constants";

export default function DoctorDetailsPage({ searchParams }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div><span className="text-xl font-bold text-primary">MediCare+</span></Link>
          <nav className="hidden md:flex items-center gap-8">{publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text-light hover:text-primary transition-colors">{link.name}</Link>))}</nav>
          <Suspense fallback={<div className="w-32 h-10 bg-secondary/50 animate-pulse rounded-full"></div>}><HeaderActions /></Suspense>
          <details className="md:hidden relative group">
            <summary className="list-none cursor-pointer text-primary p-2 flex items-center justify-center"><Menu size={24} className="group-open:hidden" /><X size={24} className="hidden group-open:block" /></summary>
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl p-4 flex flex-col gap-4 z-50">
              {publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text hover:text-primary py-2 border-b border-border/50">{link.name}</Link>))}
              <div className="pt-2"><Suspense fallback={<div className="h-8 w-full bg-secondary animate-pulse rounded-md"></div>}><MobileHeaderActions /></Suspense></div>
            </div>
          </details>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12"><Suspense fallback={<div className="text-center py-10 text-primary">Loading...</div>}><DoctorProfileWrapper searchParams={searchParams} /></Suspense></main>
    </div>
  );
}

async function HeaderActions() {
  const session = await getSession();
  return (<div className="hidden md:flex items-center gap-4"><ThemeToggle />{session ? (<><Link href="/dashboard" className="text-sm font-medium text-text flex items-center gap-1"><User size={16} /> Dashboard</Link><Link href="/api/auth-logout" className="btn-primary py-2 px-5 text-xs bg-red-500 hover:bg-red-600">Logout</Link></>) : (<Link href="/login" className="btn-secondary py-2 px-5 text-xs">Login</Link>)}</div>);
}

async function MobileHeaderActions() {
  const session = await getSession();
  return (<div className="flex flex-col gap-3">{session ? (<><Link href="/dashboard" className="btn-primary w-full py-2 text-sm text-center">Dashboard</Link><Link href="/api/auth-logout" className="btn-secondary w-full py-2 text-sm text-red-600 text-center">Logout</Link></>) : (<Link href="/login" className="btn-secondary w-full py-2 text-sm text-center">Login</Link>)}</div>);
}

async function DoctorProfileWrapper({ searchParams }) {
  const params = await searchParams; const id = params?.id;
  if (!id) return <p className="text-center text-text-light">Doctor not found.</p>;
  const [doctor, session] = await Promise.all([prisma.doctorProfile.findUnique({ where: { id }, include: { user: true } }), getSession()]);
  if (!doctor || doctor.status !== "APPROVED") return <p className="text-center text-text-light">Doctor profile is not available.</p>;
  const isDoctor = session?.role === "DOCTOR";
  return (
    <div className="space-y-6">
      <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft size={16} /> Back to Doctors</Link>
      <div className="card flex flex-col md:flex-row items-center md:items-start gap-8 p-8">
        <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center text-primary text-5xl font-bold shrink-0">{doctor.user.name.charAt(0)}</div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div><h1 className="text-3xl font-bold text-primary">Dr. {doctor.user.name}</h1><p className="text-lg text-text-light font-medium">{doctor.specialty}</p></div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-text-light"><div className="flex items-center gap-1"><Award size={16} /> {doctor.experience || 0} Years Exp</div><div className="flex items-center gap-1"><Briefcase size={16} /> License: {doctor.licenseNumber || "N/A"}</div></div>
          <p className="text-text-light leading-relaxed">{doctor.bio || "This doctor has not added a bio yet."}</p>
          <div className="pt-4 flex flex-col md:flex-row gap-4">
            {isDoctor ? (<Link href="/dashboard" className="btn-primary px-8 py-3 flex items-center gap-2"><User size={18} /> Go to Your Dashboard</Link>) : (<Link href={`/appointments?book=true&doctorId=${doctor.id}`} className="btn-primary px-8 py-3">Book Appointment</Link>)}
            <button className="btn-secondary px-8 py-3">Contact Clinic</button>
          </div>
        </div>
      </div>
    </div>
  );
}