import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/mail";
import { appointmentBookedEmail, appointmentConfirmedEmail } from "@/lib/email-templates";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { patientProfile: true, doctorProfile: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.role === "PATIENT") {
      const appointments = await prisma.appointment.findMany({
        where: { patientId: user.patientProfile.id },
        include: { doctor: { include: { user: true } } },
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ appointments });
    }

    if (user.role === "DOCTOR") {
      const appointments = await prisma.appointment.findMany({
        where: { doctorId: user.doctorProfile.id },
        include: { patient: { include: { user: true } } },
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ appointments });
    }
    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT") return NextResponse.json({ error: "Only patients can book" }, { status: 403 });

    const body = await req.json();
    const { doctorId, date, startTime, endTime, reason } = body;

    if (!doctorId || !date || !startTime || !endTime) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { patientProfile: true },
    });

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    const availability = await prisma.availability.findFirst({
      where: { doctorId, dayOfWeek, isAvailable: true },
    });

    if (!availability) return NextResponse.json({ error: "Doctor is not available on this day" }, { status: 400 });
    if (startTime < availability.startTime || endTime > availability.endTime) {
      return NextResponse.json({ error: "Selected time is outside the doctor's working hours" }, { status: 400 });
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: { doctorId, date: appointmentDate, startTime, status: { in: ["PENDING", "CONFIRMED"] } },
    });

    if (existingAppointment) return NextResponse.json({ error: "Time slot already booked" }, { status: 409 });

    const appointment = await prisma.appointment.create({
      data: { date: appointmentDate, startTime, endTime, reason, status: "PENDING", patientId: user.patientProfile.id, doctorId },
    });

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (doctor) {
      await prisma.notification.create({
        data: {
          userId: doctor.userId,
          title: "New Appointment Request",
          message: `${user.name} has booked an appointment on ${appointmentDate.toLocaleDateString()} at ${startTime}.`,
          type: "APPOINTMENT",
        },
      });

      await sendEmail({
        to: doctor.user.email,
        subject: "New Appointment Request - MediCare+",
        html: appointmentBookedEmail(doctor.user.name, user.name, appointmentDate.toLocaleDateString(), `${startTime} - ${endTime}`),
      });
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error("Appointment booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== "DOCTOR") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { appointmentId, status } = await req.json();
    if (!appointmentId || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { doctorProfile: true },
    });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: { include: { user: true } } },
    });

    if (!appointment || appointment.doctorId !== user.doctorProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.appointment.update({ where: { id: appointmentId }, data: { status } });

    if (status === "CONFIRMED") {
      const existingConversation = await prisma.conversation.findFirst({
        where: { userId: appointment.patient.userId },
      });

      if (!existingConversation) {
        await prisma.conversation.create({
          data: { userId: appointment.patient.userId },
        });
      }

      await sendEmail({
        to: appointment.patient.user.email,
        subject: "Appointment Confirmed - MediCare+",
        html: appointmentConfirmedEmail(
          appointment.patient.user.name,
          user.name,
          new Date(appointment.date).toLocaleDateString(),
          `${appointment.startTime} - ${appointment.endTime}`
        ),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}