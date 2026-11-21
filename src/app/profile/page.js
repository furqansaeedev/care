import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, Loader2, User, Mail, Phone, MapPin, Save } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AvatarUpload } from "../ThemeToggle";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { patientProfile: true, doctorProfile: true },
  });

  if (!user) redirect("/login");

  const isDoctor = user.role === "DOCTOR";

  async function updateProfile(formData) {
    "use server";
    const session = await getSession();
    if (!session || !session.userId) return;

    const name = formData.get("name");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const bio = formData.get("bio");

    await prisma.user.update({ where: { id: session.userId }, data: { name } });

    if (isDoctor) {
      await prisma.doctorProfile.update({ where: { userId: session.userId }, data: { bio } });
    } else {
      await prisma.patientProfile.update({ where: { userId: session.userId }, data: { phone, address } });
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
  }

  async function changePassword(formData) {
    "use server";
    const session = await getSession();
    if (!session || !session.userId) return;

    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return;

    const bcrypt = require("bcryptjs");
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return;

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: session.userId }, data: { password: hashedPassword } });

    revalidatePath("/profile");
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
        <h1 className="text-3xl font-bold text-primary mb-8">Your Profile</h1>

        <div className="card">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-border">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-primary text-4xl font-bold overflow-hidden">
                {/* FIXED: Added key to force refresh image */}
                {user.image ? (
                  <img key={user.image} src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <AvatarUpload />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-text">{user.name}</h2>
              <p className="text-text-light">{user.email}</p>
              <span className={`badge-${isDoctor ? "confirmed" : "pending"} mt-2 inline-block`}>{user.role}</span>
            </div>
          </div>

          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text flex items-center gap-1"><User size={14} /> Full Name</label>
                <input type="text" name="name" defaultValue={user.name} required className="input-field" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text flex items-center gap-1"><Mail size={14} /> Email</label>
                <input type="email" defaultValue={user.email} disabled className="input-field opacity-60" />
              </div>
            </div>

            {!isDoctor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text flex items-center gap-1"><Phone size={14} /> Phone</label>
                  <input type="text" name="phone" defaultValue={user.patientProfile?.phone || ""} className="input-field" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text flex items-center gap-1"><MapPin size={14} /> Address</label>
                  <input type="text" name="address" defaultValue={user.patientProfile?.address || ""} className="input-field" />
                </div>
              </div>
            )}

            {isDoctor && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-text">Bio</label>
                <textarea name="bio" rows="3" defaultValue={user.doctorProfile?.bio || ""} className="input-field" placeholder="Tell patients about yourself..."></textarea>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text mb-4">Change Password</h3>
            <form action={changePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-text">Current Password</label><input type="password" name="currentPassword" required className="input-field" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-text">New Password</label><input type="password" name="newPassword" required className="input-field" /></div>
              </div>
              <button type="submit" className="btn-secondary w-full py-3">Update Password</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}