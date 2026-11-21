import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, Loader2, Clock, Save } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default function AvailabilityPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <AvailabilityContent />
    </Suspense>
  );
}

async function AvailabilityContent() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { doctorProfile: true },
  });

  if (!user || user.role !== "DOCTOR" || user.doctorProfile?.status !== "APPROVED") {
    redirect("/login");
  }

  const availabilities = await prisma.availability.findMany({
    where: { doctorId: user.doctorProfile.id },
  });

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Server Action to save availability
  async function saveAvailability(formData) {
    "use server";
    const session = await getSession();
    if (!session || !session.userId) return;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) return;

    // Delete old availability and create new
    await prisma.availability.deleteMany({ where: { doctorId: user.doctorProfile.id } });

    const selectedDays = formData.getAll("days");
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");

    if (selectedDays.length > 0 && startTime && endTime) {
      await prisma.availability.createMany({
        data: selectedDays.map((day) => ({
          doctorId: user.doctorProfile.id,
          dayOfWeek: parseInt(day),
          startTime,
          endTime,
          isAvailable: true,
        })),
      });
    }

    revalidatePath("/availability");
    revalidatePath("/doctors");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div>
            <span className="text-xl font-bold text-primary">MediCare+</span>
          </Link>
          <Link href="/dashboard" className="btn-secondary py-2 px-5 text-xs">Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-primary mb-2">Manage Availability</h1>
        <p className="text-text-light mb-8">Set your working hours so patients can book appointments.</p>

        <form action={saveAvailability} className="card space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text flex items-center gap-1"><Clock size={16} /> Working Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {days.map((day, index) => (
                <label key={index} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-secondary/20 cursor-pointer">
                  <input
                    type="checkbox"
                    name="days"
                    value={index}
                    defaultChecked={availabilities.some(a => a.dayOfWeek === index)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-text">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Start Time</label>
              <input type="time" name="startTime" defaultValue={availabilities[0]?.startTime || "09:00"} className="input-field" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">End Time</label>
              <input type="time" name="endTime" defaultValue={availabilities[0]?.endTime || "17:00"} className="input-field" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <Save size={18} /> Save Availability
          </button>
        </form>
      </main>
    </div>
  );
}