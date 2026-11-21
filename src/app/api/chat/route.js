import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          user: { select: { name: true, role: true, id: true } },
        },
      });

      if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

      await prisma.message.updateMany({
        where: { conversationId, senderId: { not: session.userId }, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({ conversation });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { patientProfile: true, doctorProfile: true },
    });

    let conversations = [];

    if (user.role === "PATIENT") {
      conversations = await prisma.conversation.findMany({
        where: { userId: session.userId },
        include: {
          user: { select: { name: true, role: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else if (user.role === "DOCTOR") {
      const appointments = await prisma.appointment.findMany({
        where: { doctorId: user.doctorProfile.id, status: "CONFIRMED" },
        include: { patient: { include: { user: true } } },
      });

      const patientIds = [...new Set(appointments.map((apt) => apt.patient.userId))];

      conversations = await prisma.conversation.findMany({
        where: { userId: { in: patientIds } },
        include: {
          user: { select: { name: true, role: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId, content } = await req.json();
    if (!content) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

    const conversation = await prisma.conversation.findUnique({ 
      where: { id: conversationId },
    });
    
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.userId,
        conversationId: conversation.id,
      },
      include: { sender: { select: { name: true, id: true, role: true } } },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}