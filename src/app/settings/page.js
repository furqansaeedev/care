import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, Loader2, Bell, Moon, Shield, Lock } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { settings: true },
  });

  if (!user) redirect("/login");

  // Server Action: Save Notification Settings
  async function updateSettings(formData) {
    "use server";
    const session = await getSession();
    if (!session || !session.userId) return;

    const emailNotifications = formData.get("emailNotifications") === "on";
    const smsAlerts = formData.get("smsAlerts") === "on";

    await prisma.settings.upsert({
      where: { userId: session.userId },
      update: { emailNotifications, smsAlerts },
      create: { userId: session.userId, emailNotifications, smsAlerts },
    });

    revalidatePath("/settings");
  }

  // Server Action: Change Password
  async function changePassword(formData) {
    "use server";
    const session = await getSession();
    if (!session || !session.userId) return;

    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return;

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      // In a real app, return an error message to the UI
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedPassword },
    });

    revalidatePath("/settings");
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
        <h1 className="text-3xl font-bold text-primary mb-8">Settings</h1>

        <form action={updateSettings} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-text flex items-center gap-2"><Bell size={20} /> Notifications</h2>
            
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-text">Email Notifications</p>
                <p className="text-sm text-text-light">Receive appointment updates via email</p>
              </div>
              <input type="checkbox" name="emailNotifications" defaultChecked={user.settings?.emailNotifications ?? true} className="h-5 w-5 accent-primary" />
            </div>

            <div className="flex items-center justify-between pb-2">
              <div>
                <p className="font-medium text-text">SMS Alerts</p>
                <p className="text-sm text-text-light">Receive important alerts via SMS</p>
              </div>
              <input type="checkbox" name="smsAlerts" defaultChecked={user.settings?.smsAlerts ?? false} className="h-5 w-5 accent-primary" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3">Save Notification Settings</button>
        </form>

        {/* Appearance Section */}
        <div className="card space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2"><Moon size={20} /> Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Dark Mode</p>
              <p className="text-sm text-text-light">Toggle dark mode from the top navbar</p>
            </div>
            <span className="text-sm text-text-light">Use the sun/moon icon</span>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="card space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-text flex items-center gap-2"><Shield size={20} /> Change Password</h2>
          <form action={changePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text">Current Password</label>
                <input type="password" name="currentPassword" required className="input-field" placeholder="Enter current password" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text">New Password</label>
                <input type="password" name="newPassword" required className="input-field" placeholder="Enter new password" />
              </div>
            </div>
            <button type="submit" className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
              <Lock size={18} /> Update Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}