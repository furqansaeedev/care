import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, Loader2, Bell, CheckCircle, Calendar } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <NotificationsContent />
    </Suspense>
  );
}

async function NotificationsContent() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  // Server Action to mark as read
  async function markAsRead(formData) {
    "use server";
    const notificationId = formData.get("notificationId");
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
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
        <h1 className="text-3xl font-bold text-primary mb-8 flex items-center gap-2"><Bell size={28} /> Notifications</h1>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="card text-center py-12">
              <Bell size={48} className="text-text-light mx-auto mb-4" />
              <p className="text-text-light">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className={`card flex items-start gap-4 ${!notif.isRead ? "border-l-4 border-l-primary" : ""}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === "APPOINTMENT" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                  {notif.type === "APPOINTMENT" ? <Calendar size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-text">{notif.title}</h3>
                    <span className="text-xs text-text-light">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text-light mt-1">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <form action={markAsRead}>
                    <input type="hidden" name="notificationId" value={notif.id} />
                    <button type="submit" className="text-primary hover:text-primary-dark text-xs font-medium">
                      Mark Read
                    </button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}   