"use client";

import { useState, useEffect, Suspense } from "react";
import { Calendar, Clock, CheckCircle, XCircle, Plus, X, MessageCircle, Video } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AppointmentUI({ appointments, doctors, isDoctor, isSuccess, conversationId, view }) {
  const isDashboardView = view === "dashboard";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-primary">{isDoctor ? "My Schedule" : "My Appointments"}</h1>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          Appointment booked successfully! Waiting for doctor confirmation.
        </div>
      )}

      {!isDoctor && (
        <Suspense fallback={<div className="w-full h-12 bg-secondary/50 animate-pulse rounded-xl mb-6"></div>}>
          <BookingToggle doctors={doctors} />
        </Suspense>
      )}

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-text-light text-center py-10">No appointments found.</p>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="card flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                  {isDoctor 
                    ? (apt.patient?.user?.name?.charAt(0) || "P") 
                    : (apt.doctor?.user?.name?.charAt(0) || "D")}
                </div>
                <div>
                  <p className="font-semibold text-text">
                    {isDoctor 
                      ? (apt.patient?.user?.name || "Patient") 
                      : (apt.doctor?.user?.name ? `Dr. ${apt.doctor.user.name}` : "Doctor")}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-light mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> 
                      {mounted ? new Date(apt.date).toLocaleDateString() : "Loading..."}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {apt.startTime} - {apt.endTime}</span>
                  </div>
                  {apt.reason && <p className="text-xs text-text-light mt-1">Reason: {apt.reason}</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <span className={`badge-${apt.status.toLowerCase()}`}>{apt.status}</span>
                
                {apt.status === "CONFIRMED" && (
                  <>
                    <Link 
                      href={`/video-consultation?appointmentId=${apt.id}`} 
                      className="btn-primary py-1 px-3 text-xs flex items-center gap-1 bg-primary text-white hover:bg-primary-dark"
                    >
                      <Video size={14} /> Join Call
                    </Link>
                    {conversationId && (
                      <Link 
                        href={`/chat?conversationId=${conversationId}`} 
                        className="btn-primary py-1 px-3 text-xs flex items-center gap-1 bg-secondary text-primary hover:bg-secondary-dark"
                      >
                        <MessageCircle size={14} /> Chat
                      </Link>
                    )}
                  </>
                )}

                {isDoctor && apt.status === "PENDING" && isDashboardView && (
                  <DoctorActionButtons appointmentId={apt.id} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookingToggle({ doctors }) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("book") === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);

  async function handleBooking(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const doctorId = formData.get("doctorId");
    const date = formData.get("date");
    const timeSlot = formData.get("time");
    const reason = formData.get("reason");

    if (!timeSlot) {
      alert("Please select a time slot");
      setLoading(false);
      return;
    }

    const [startTime, endTime] = timeSlot.split("-");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, date, startTime, endTime, reason }),
    });

    if (res.ok) {
      const currentView = searchParams.get("view") || "public";
      window.location.href = `/appointments?view=${currentView}&success=true`;
    } else {
      const err = await res.json();
      alert(err.error || "Failed to book appointment");
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <Plus size={18} /> Book New Appointment
        </button>
      ) : (
        <div className="card border-primary/20 bg-secondary/10 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold text-primary">Book an Appointment</h2>
            <button onClick={() => setIsOpen(false)} className="text-text-light hover:text-red-500"><X size={20} /></button>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text">Select Doctor</label>
                <select name="doctorId" required className="input-field" defaultValue={searchParams.get("doctorId") || ""}>
                  <option value="" disabled>Choose a doctor</option>
                  {doctors.map(doc => (<option key={doc.id} value={doc.id}>Dr. {doc.user.name} - {doc.specialty}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text">Select Date</label>
                <input type="date" name="date" required min={new Date().toISOString().split("T")[0]} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text">Time Slot</label>
                <select name="time" required className="input-field" defaultValue="">
                  <option value="" disabled>Select a time slot</option>
                  <option value="09:00-09:30">09:00 AM - 09:30 AM</option>
                  <option value="09:30-10:00">09:30 AM - 10:00 AM</option>
                  <option value="10:00-10:30">10:00 AM - 10:30 AM</option>
                  <option value="10:30-11:00">10:30 AM - 11:00 AM</option>
                  <option value="14:00-14:30">02:00 PM - 02:30 PM</option>
                  <option value="14:30-15:00">02:30 PM - 03:00 PM</option>
                  <option value="15:00-15:30">03:00 PM - 03:30 PM</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text">Reason (Optional)</label>
                <input type="text" name="reason" placeholder="e.g. Fever, Checkup" className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm mt-2">
              {loading ? "Booking..." : "Confirm Appointment"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function DoctorActionButtons({ appointmentId }) {
  const [loading, setLoading] = useState(false);
  async function updateStatus(status) {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status }),
      });
      if (res.ok) window.location.reload();
      else { alert("Failed to update status"); setLoading(false); }
    } catch (error) { console.error(error); setLoading(false); }
  }
  return (
    <div className="flex gap-2">
      <button onClick={() => updateStatus("CONFIRMED")} disabled={loading} className="btn-primary py-1 px-3 text-xs bg-green-600 hover:bg-green-700 flex items-center gap-1"><CheckCircle size={14} /> Confirm</button>
      <button onClick={() => updateStatus("CANCELLED")} disabled={loading} className="btn-secondary py-1 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"><XCircle size={14} /> Cancel</button>
    </div>
  );
}