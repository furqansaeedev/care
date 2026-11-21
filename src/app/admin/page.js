import { Suspense } from "react";
import Link from "next/link";
import { HeartPulse, LogOut, CheckCircle, XCircle, Loader2, Menu, X } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default function AdminPage() {
  return (<Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}><AdminContent /></Suspense>);
}

async function AdminContent() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const pendingDoctors = await prisma.doctorProfile.findMany({ where: { status: "PENDING" }, include: { user: true } });

  async function updateDoctorStatus(formData) {
    "use server";
    const doctorId = formData.get("doctorId");
    const status = formData.get("status");
    await prisma.doctorProfile.update({ where: { id: doctorId }, data: { status } });
    revalidatePath("/admin");
  }

  return (
    <div className="min-h-screen bg-background relative flex">
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />
      <label htmlFor="sidebar-toggle" className="fixed inset-0 bg-black/50 z-40 hidden peer-checked:block lg:hidden"></label>

      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 lg:static lg:translate-x-0">
        <div className="flex h-full flex-col">
          <Link href="/" className="flex h-16 items-center gap-2 px-6 border-b border-border"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={18} /></div><span className="text-lg font-bold text-primary">MediCare+</span></Link>
          <nav className="flex-1 space-y-1 px-4 py-6"><Link href="/admin" className="sidebar-link sidebar-link-active"><CheckCircle size={20} /> Approvals</Link></nav>
          <div className="border-t border-border p-4"><Link href="/api/auth-logout" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50"><LogOut size={20} /> Logout</Link></div>
        </div>
      </aside>

      <div className="flex flex-col w-full flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-6">
          <div className="flex items-center gap-3">
            <label htmlFor="sidebar-toggle" className="lg:hidden cursor-pointer p-2 text-primary bg-surface rounded-md border border-border">
              <Menu size={24} className="peer-checked:hidden" /><X size={24} className="hidden peer-checked:block" />
            </label>
            <div className="text-lg font-semibold text-primary">Admin Dashboard</div>
          </div>
        </header>
        <main className="flex-1 p-6 space-y-6">
          <div><h1 className="text-2xl font-bold text-primary">Pending Doctor Approvals</h1><p className="text-sm text-text-light">Review and approve new doctor registrations.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="card space-y-4">
                <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold text-lg">{doc.user.name.charAt(0)}</div><div><h3 className="font-bold text-text">Dr. {doc.user.name}</h3><p className="text-xs text-text-light">{doc.specialty}</p></div></div>
                <div className="text-sm text-text-light space-y-1"><p><strong>Email:</strong> {doc.user.email}</p><p><strong>License:</strong> {doc.licenseNumber || "N/A"}</p></div>
                <div className="flex gap-2 pt-2">
                  <form action={updateDoctorStatus} className="flex-1"><input type="hidden" name="doctorId" value={doc.id} /><input type="hidden" name="status" value="APPROVED" /><button type="submit" className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1"><CheckCircle size={14} /> Approve</button></form>
                  <form action={updateDoctorStatus} className="flex-1"><input type="hidden" name="doctorId" value={doc.id} /><input type="hidden" name="status" value="REJECTED" /><button type="submit" className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1 border-red-200 text-red-600 hover:bg-red-50"><XCircle size={14} /> Reject</button></form>
                </div>
              </div>
            ))}
            {pendingDoctors.length === 0 && (<p className="col-span-full text-center text-text-light py-10">No pending doctor approvals.</p>)}
          </div>
        </main>
      </div>
    </div>
  );
}