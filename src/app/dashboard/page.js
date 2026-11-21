import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, LogOut, Calendar, Users, MessageCircle, Loader2, Menu, X } from "lucide-react";
import * as Icons from "lucide-react";
import { patientSidebarLinks, doctorSidebarLinks } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { patientProfile: true, doctorProfile: true },
  });

  if (!user) redirect("/login");

  const isDoctor = user.role === "DOCTOR";
  const sidebarLinks = isDoctor ? doctorSidebarLinks : patientSidebarLinks;

  // DATA FETCHING
  let upcomingAppointments = [];
  let totalAppointments = 0;
  let unreadMessages = 0;
  let todayAppointments = [];
  let totalPatients = 0;
  let pendingRequests = 0;
  let completedConsultations = 0;

  if (!isDoctor && user.patientProfile) {
    const now = new Date();
    upcomingAppointments = await prisma.appointment.findMany({
      where: { patientId: user.patientProfile.id, status: "CONFIRMED", date: { gte: now } },
      include: { doctor: { include: { user: true } } },
      orderBy: { date: "asc" },
      take: 3,
    });
    totalAppointments = await prisma.appointment.count({ where: { patientId: user.patientProfile.id } });
    unreadMessages = await prisma.message.count({
      where: { conversation: { userId: user.id }, isRead: false, senderId: { not: user.id } },
    });
  }

  if (isDoctor && user.doctorProfile) {
    if (user.doctorProfile.status !== "APPROVED") redirect("/pending-approval");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    todayAppointments = await prisma.appointment.findMany({
      where: { doctorId: user.doctorProfile.id, date: { gte: today, lt: tomorrow } },
      include: { patient: { include: { user: true } } },
      orderBy: { startTime: "asc" },
    });
    
    const uniquePatients = await prisma.appointment.findMany({ where: { doctorId: user.doctorProfile.id }, distinct: ["patientId"] });
    totalPatients = uniquePatients.length;
    pendingRequests = await prisma.appointment.count({ where: { doctorId: user.doctorProfile.id, status: "PENDING" } });
    completedConsultations = await prisma.appointment.count({ where: { doctorId: user.doctorProfile.id, status: "COMPLETED" } });
  }

  return (
    <div className="min-h-screen bg-background relative flex">
      {/* MOBILE TOGGLE */}
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />
      <label htmlFor="sidebar-toggle" className="fixed inset-0 bg-black/50 z-40 hidden peer-checked:block lg:hidden"></label>

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 lg:static lg:translate-x-0">
        <div className="flex h-full flex-col">
          <Link href="/" className="flex h-16 items-center gap-2 px-6 border-b border-border hover:bg-secondary/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={18} /></div>
            <span className="text-lg font-bold text-primary">MediCare+</span>
          </Link>
          <nav className="flex-1 space-y-1 px-4 py-6">
            {sidebarLinks.map((link) => {
              const Icon = Icons[link.icon];
              return (
                <Link key={link.name} href={link.href} className={`sidebar-link ${link.href === "/dashboard" ? "sidebar-link-active" : ""}`}>
                  <Icon size={20} />{link.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <Link href="/api/auth-logout" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50">
              <LogOut size={20} /> Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col w-full flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-6">
          <div className="flex items-center gap-3">
            <label htmlFor="sidebar-toggle" className="lg:hidden cursor-pointer p-2 text-primary bg-surface rounded-md border border-border">
              <Menu size={24} className="peer-checked:hidden" />
              <X size={24} className="hidden peer-checked:block" />
            </label>
            <div className="text-lg font-semibold text-primary">{isDoctor ? "Doctor Dashboard" : "Dashboard"}</div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* FIXED: Image Check for Header Avatar */}
            <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold overflow-hidden">
              {user.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="hidden md:block"><p className="text-sm font-medium text-text">{user.name}</p><p className="text-xs text-text-light">{isDoctor ? "Doctor" : "Patient"}</p></div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-bold text-primary">Welcome back, {user.name.split(" ")[0]}!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {isDoctor ? (
              <>
                <div className="card"><p className="text-xs text-text-light">Today's Appointments</p><p className="text-2xl font-bold text-primary">{todayAppointments.length}</p></div>
                <div className="card"><p className="text-xs text-text-light">Total Patients</p><p className="text-2xl font-bold text-primary">{totalPatients}</p></div>
                <div className="card"><p className="text-xs text-text-light">Pending Requests</p><p className="text-2xl font-bold text-primary">{pendingRequests}</p></div>
                <div className="card"><p className="text-xs text-text-light">Completed</p><p className="text-2xl font-bold text-primary">{completedConsultations}</p></div>
              </>
            ) : (
              <>
                <div className="card"><p className="text-xs text-text-light">Upcoming Appointments</p><p className="text-2xl font-bold text-primary">{upcomingAppointments.length}</p></div>
                <div className="card"><p className="text-xs text-text-light">Total Appointments</p><p className="text-2xl font-bold text-primary">{totalAppointments}</p></div>
                <div className="card"><p className="text-xs text-text-light">New Messages</p><p className="text-2xl font-bold text-primary">{unreadMessages}</p></div>
                <div className="card"><p className="text-xs text-text-light">Health Tips</p><p className="text-2xl font-bold text-primary">Stay Healthy!</p></div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isDoctor ? (
              <>
                <div className="card">
                  <h2 className="text-lg font-semibold text-text mb-4">Today's Appointments</h2>
                  {todayAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {todayAppointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                          <div><p className="text-sm font-medium text-text">{apt.patient.user.name}</p><p className="text-xs text-text-light">{apt.startTime}</p></div>
                          <span className={`badge-${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-text-light text-center py-4">No appointments scheduled for today.</p>}
                </div>
                <div className="card">
                  <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link href="/availability" className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4 hover:bg-secondary">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary"><Calendar size={20} /></div>
                      <div><p className="text-sm font-semibold text-text">Manage Availability</p></div>
                    </Link>
                    <Link href="/patients" className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4 hover:bg-secondary">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary"><Users size={20} /></div>
                      <div><p className="text-sm font-semibold text-text">View Patients</p></div>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="card">
                  <h2 className="text-lg font-semibold text-text mb-4">Your Next Appointment</h2>
                  {upcomingAppointments.length > 0 ? (
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">{upcomingAppointments[0].doctor.user.name.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-text">Dr. {upcomingAppointments[0].doctor.user.name}</p>
                        <p className="text-sm text-text-light">{upcomingAppointments[0].doctor.specialty}</p>
                        <p className="text-xs text-text-light mt-2">{new Date(upcomingAppointments[0].date).toLocaleDateString()} at {upcomingAppointments[0].startTime}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-light text-center py-4">No upcoming appointments.</p>
                  )}
                </div>
                <div className="card">
                  <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link href="/appointments" className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4 hover:bg-secondary">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary"><Calendar size={20} /></div>
                      <div><p className="text-sm font-semibold text-text">Book Appointment</p></div>
                    </Link>
                    <Link href="/chat" className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4 hover:bg-secondary">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary"><MessageCircle size={20} /></div>
                      <div><p className="text-sm font-semibold text-text">Chat with a Doctor</p></div>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}