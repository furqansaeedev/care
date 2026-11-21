import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, LogOut, Menu, X } from "lucide-react";
import * as Icons from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AppointmentUI from "./AppointmentUI";
import { publicNavLinks, patientSidebarLinks, doctorSidebarLinks } from "@/lib/constants";
import ThemeToggle from "../ThemeToggle";

export default function AppointmentsPage({ searchParams }) {
  return (<Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-primary">Loading...</div>}><AppointmentsWrapper searchParams={searchParams} /></Suspense>);
}

async function AppointmentsWrapper({ searchParams }) {
  const session = await getSession();
  const params = await searchParams;
  const isDashboardView = params?.view === "dashboard";
  const isSuccess = params?.success === "true";
  
  let user = null; 
  let appointments = []; 
  let doctors = []; 
  let conversationId = null;

  if (session?.userId) {
    user = await prisma.user.findUnique({ 
      where: { id: session.userId }, 
      include: { patientProfile: true, doctorProfile: true } 
    });

    if (user) {
      const isDoctor = user.role === "DOCTOR";
      
      if (isDoctor && user.doctorProfile) {
        appointments = await prisma.appointment.findMany({ 
          where: { doctorId: user.doctorProfile.id }, 
          include: { patient: { include: { user: true } } }, 
          orderBy: { date: "desc" } 
        });
      } else if (!isDoctor && user.patientProfile) {
        appointments = await prisma.appointment.findMany({ 
          where: { patientId: user.patientProfile.id }, 
          include: { doctor: { include: { user: true } } }, 
          orderBy: { date: "desc" } 
        });
      }

      if (appointments.length > 0) {
        const conv = isDoctor 
          ? await prisma.conversation.findFirst({ where: { userId: appointments[0]?.patient?.userId } }) 
          : await prisma.conversation.findFirst({ where: { userId: user.id } });
        if (conv) conversationId = conv.id;
      }

      doctors = !isDoctor 
        ? await prisma.doctorProfile.findMany({ where: { status: "APPROVED" }, include: { user: true } }) 
        : [];
    }
  }

  if (isDashboardView && !session?.userId) redirect("/login");

  // Determine actual role (if user exists, use their role, otherwise false)
  const actualIsDoctor = user?.role === "DOCTOR";

  if (isDashboardView && user) {
    const isDoctor = user.role === "DOCTOR";
    const sidebarLinks = isDoctor ? doctorSidebarLinks : patientSidebarLinks;
    
    return (
      <div className="min-h-screen bg-background relative flex">
        <input type="checkbox" id="sidebar-toggle" className="hidden peer" />
        <label htmlFor="sidebar-toggle" className="fixed inset-0 bg-black/50 z-40 hidden peer-checked:block lg:hidden"></label>
        
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 lg:static lg:translate-x-0">
          <div className="flex h-full flex-col">
            <Link href="/" className="flex h-16 items-center gap-2 px-6 border-b border-border hover:bg-secondary/50"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={18} /></div><span className="text-lg font-bold text-primary">MediCare+</span></Link>
            <nav className="flex-1 space-y-1 px-4 py-6">
              {sidebarLinks.map((link) => { 
                const Icon = Icons[link.icon]; 
                const isActive = link.href.includes("/appointments"); 
                return (<Link key={link.name} href={link.href} className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}><Icon size={20} />{link.name}</Link>); 
              })}
            </nav>
            <div className="border-t border-border p-4"><Link href="/api/auth-logout" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50"><LogOut size={20} /> Logout</Link></div>
          </div>
        </aside>

        <div className="flex flex-col w-full flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-6">
            <div className="flex items-center gap-3">
              <label htmlFor="sidebar-toggle" className="lg:hidden cursor-pointer p-2 text-primary bg-surface rounded-md border border-border">
                <Menu size={24} className="peer-checked:hidden" /><X size={24} className="hidden peer-checked:block" />
              </label>
              <div className="text-lg font-semibold text-primary">My Appointments</div>
            </div>
            <div className="flex items-center gap-4"><ThemeToggle /><div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{user.name.charAt(0)}</div></div>
          </header>
          <main className="flex-1 p-6"><AppointmentUI appointments={appointments} doctors={doctors} isDoctor={isDoctor} isSuccess={isSuccess} conversationId={conversationId} view="dashboard" /></main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div><span className="text-xl font-bold text-primary">MediCare+</span></Link>
          <nav className="hidden md:flex items-center gap-8">{publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text-light hover:text-primary transition-colors">{link.name}</Link>))}</nav>
          <div className="hidden md:flex items-center gap-4"><ThemeToggle />{session ? (<Link href="/dashboard" className="btn-primary py-2 px-5 text-xs">Dashboard</Link>) : (<><Link href="/login" className="text-sm font-medium text-text hover:text-primary">Login</Link><Link href="/login" className="btn-primary py-2 px-5 text-xs">Get Started</Link></>)}</div>
          <details className="md:hidden relative group">
            <summary className="list-none cursor-pointer text-primary p-2 flex items-center justify-center"><Menu size={24} className="group-open:hidden" /><X size={24} className="hidden group-open:block" /></summary>
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl p-4 flex flex-col gap-4 z-50">{publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text hover:text-primary py-2 border-b border-border/50">{link.name}</Link>))}</div>
          </details>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-6"><h1 className="text-3xl font-bold text-primary mb-2">Appointments</h1><p className="text-text-light">Manage your appointments or book a new one.</p></div>
        {/* FIXED: Pass actualIsDoctor instead of hardcoded false */}
        <AppointmentUI appointments={appointments} doctors={doctors} isDoctor={actualIsDoctor} isSuccess={isSuccess} conversationId={conversationId} view="public" />
      </main>
    </div>
  );
}