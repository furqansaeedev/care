import { Suspense } from "react";
import Link from "next/link";
import { Search, HeartPulse, Stethoscope, User, Menu, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ThemeToggle from "../ThemeToggle";
import { publicNavLinks } from "@/lib/constants";

export default function DoctorsPage({ searchParams }) {
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
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-4"><h1 className="text-4xl font-bold text-primary">Find Your Doctor</h1><p className="text-text-light max-w-2xl mx-auto">Search our network of verified healthcare professionals.</p></div>
        <Suspense fallback={<div className="text-center py-10 text-primary">Loading...</div>}><DoctorList searchParams={searchParams} /></Suspense>
      </main>
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

async function DoctorList({ searchParams }) {
  const params = await searchParams;
  const rawSearch = params?.search?.trim() || "";
  const search = rawSearch.replace(/^(dr\.?|dr)\s+/i, "").trim();
  const doctors = search ? await prisma.doctorProfile.findMany({ where: { status: "APPROVED", OR: [{ specialty: { equals: search, mode: "insensitive" } }, { user: { name: { equals: search, mode: "insensitive" } } }] }, include: { user: { select: { name: true, image: true } } } }) : [];
  return (
    <div className="space-y-8">
      <form action="/doctors" method="GET" className="max-w-2xl mx-auto flex items-center gap-2 rounded-full bg-surface p-2 shadow-sm border border-border">
        <Search className="ml-4 text-text-light" size={20} />
        <input type="text" name="search" defaultValue={rawSearch} placeholder="Search by exact doctor name..." className="flex-1 bg-transparent py-2 px-2 text-sm text-text outline-none" />
        <button type="submit" className="btn-primary px-6 py-2 text-sm">Search</button>
      </form>
      {doctors.length === 0 ? (<div className="text-center py-12"><p className="text-text-light text-lg mb-2">{rawSearch ? `No doctors found matching "${rawSearch}".` : "Search for a doctor to get started."}</p></div>) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="card flex flex-col items-center text-center space-y-4 hover:shadow-lg">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">{doc.user.image ? <img src={doc.user.image} alt={doc.user.name} className="h-full w-full object-cover" /> : doc.user.name.charAt(0)}</div>
              <div><h3 className="font-bold text-text text-lg">Dr. {doc.user.name}</h3><p className="text-sm text-primary font-medium">{doc.specialty}</p></div>
              <div className="flex items-center gap-2 text-xs text-text-light"><Stethoscope size={14} /><span>{doc.experience || 0} years exp</span></div>
              <Link href={`/doctor-details?id=${doc.id}`} className="btn-primary w-full py-2 text-sm">View Profile</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}