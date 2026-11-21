import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, LogOut, Search, Loader2, Menu, X, Calendar, ArrowLeft } from "lucide-react";
import { doctorSidebarLinks } from "@/lib/constants";
import * as Icons from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function PatientsPage() {
  return (<Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}><PatientsContent /></Suspense>);
}

async function PatientsContent() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { doctorProfile: true } });
  if (!user || user.role !== "DOCTOR" || user.doctorProfile?.status !== "APPROVED") redirect("/login");

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: user.doctorProfile.id },
    include: { patient: { include: { user: true } } },
    distinct: ["patientId"],
    orderBy: { date: "desc" },
  });

  return (
    <div className="min-h-screen bg-background relative flex">
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />
      <label htmlFor="sidebar-toggle" className="fixed inset-0 bg-black/50 z-40 hidden peer-checked:block lg:hidden"></label>

      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 lg:static lg:translate-x-0">
        <div className="flex h-full flex-col">
          <Link href="/" className="flex h-16 items-center gap-2 px-6 border-b border-border hover:bg-secondary/50"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={18} /></div><span className="text-lg font-bold text-primary">MediCare+</span></Link>
          <nav className="flex-1 space-y-1 px-4 py-6">{doctorSidebarLinks.map((link) => { const Icon = Icons[link.icon]; return (<Link key={link.name} href={link.href} className={`sidebar-link ${link.href === "/patients" ? "sidebar-link-active" : ""}`}><Icon size={20} />{link.name}</Link>); })}</nav>
          <div className="border-t border-border p-4"><Link href="/api/auth-logout" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50"><LogOut size={20} /> Logout</Link></div>
        </div>
      </aside>

      <div className="flex flex-col w-full flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-6">
          <div className="flex items-center gap-3">
            <label htmlFor="sidebar-toggle" className="lg:hidden cursor-pointer p-2 text-primary bg-surface rounded-md border border-border">
              <Menu size={24} className="peer-checked:hidden" /><X size={24} className="hidden peer-checked:block" />
            </label>
            <div className="text-lg font-semibold text-primary">Patients</div>
          </div>
          <div className="flex items-center gap-4"><div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{user.name.charAt(0)}</div></div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div><h1 className="text-2xl font-bold text-primary">Your Patients</h1><p className="text-sm text-text-light">Manage all patients who have visited you.</p></div>
            <div className="flex items-center gap-2 rounded-xl bg-surface border border-border px-4 py-2 w-full md:w-64"><Search size={18} className="text-text-light" /><input type="text" placeholder="Search patients..." className="bg-transparent outline-none text-sm w-full text-text" /></div>
          </div>

          <div className="card overflow-hidden p-0 hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-secondary/50 text-text-light text-xs font-semibold border-b border-border"><th className="p-4">Patient Name</th><th className="p-4">Email</th><th className="p-4">Last Appointment</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                    <td className="p-4 flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-primary text-xs font-bold">{apt.patient.user.name.charAt(0)}</div><span className="text-sm font-medium text-text">{apt.patient.user.name}</span></td>
                    <td className="p-4 text-sm text-text-light">{apt.patient.user.email}</td>
                    <td className="p-4 text-sm text-text-light">{new Date(apt.date).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {/* FIXED: Link to view profile */}
                      <Link href={`/patients/view?id=${apt.patient.userId}`} className="text-primary hover:underline text-sm font-medium">View Profile</Link>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (<tr><td colSpan="4" className="p-8 text-center text-text-light">No patients found.</td></tr>)}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="card flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{apt.patient.user.name.charAt(0)}</div>
                  <div><p className="font-semibold text-text">{apt.patient.user.name}</p><p className="text-xs text-text-light">{apt.patient.user.email}</p></div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-light">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(apt.date).toLocaleDateString()}</span>
                  {/* FIXED: Link to view profile */}
                  <Link href={`/patients/view?id=${apt.patient.userId}`} className="text-primary hover:underline font-medium">View Profile</Link>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (<p className="text-center text-text-light py-8">No patients found.</p>)}
          </div>
        </main>
      </div>
    </div>
  );
}