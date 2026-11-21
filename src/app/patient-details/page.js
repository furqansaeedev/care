import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, Loader2, ArrowLeft, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default function PatientDetailsPage({ searchParams }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <PatientDetailsWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function PatientDetailsWrapper({ searchParams }) {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const params = await searchParams;
  const userId = params?.id;

  if (!userId) return <p className="text-center p-10">Patient not found.</p>;

  const patient = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      patientProfile: true,
      appointments: {
        include: { doctor: { include: { user: true } } },
        orderBy: { date: "desc" },
        take: 5,
      },
    },
  });

  if (!patient || patient.role !== "PATIENT") {
    return <p className="text-center p-10">Patient not found.</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div>
            <span className="text-xl font-bold text-primary">MediCare+</span>
          </Link>
          <Link href="/patients" className="btn-secondary py-2 px-5 text-xs flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Patients
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="card space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-border">
            <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-primary text-4xl font-bold">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">{patient.name}</h1>
              <p className="text-text-light">{patient.email}</p>
              <span className="badge-pending mt-2 inline-block">Patient</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2"><User size={20} /> Personal Information</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-text">Name:</span> {patient.name}</p>
                <p><span className="font-medium text-text">Email:</span> {patient.email}</p>
                <p><span className="font-medium text-text">Phone:</span> {patient.patientProfile?.phone || "N/A"}</p>
                <p><span className="font-medium text-text">Address:</span> {patient.patientProfile?.address || "N/A"}</p>
                <p><span className="font-medium text-text">Date of Birth:</span> {patient.patientProfile?.dateOfBirth ? new Date(patient.patientProfile.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                <p><span className="font-medium text-text">Gender:</span> {patient.patientProfile?.gender || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text flex items-center gap-2"><Calendar size={20} /> Recent Appointments</h2>
              {patient.appointments.length > 0 ? (
                <div className="space-y-3">
                  {patient.appointments.map((apt) => (
                    <div key={apt.id} className="p-3 rounded-lg border border-border bg-secondary/10">
                      <p className="text-sm font-medium text-text">Dr. {apt.doctor.user.name}</p>
                      <p className="text-xs text-text-light">{new Date(apt.date).toLocaleDateString()} at {apt.startTime}</p>
                      <span className={`badge-${apt.status.toLowerCase()} mt-2 inline-block`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-light">No appointments yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}