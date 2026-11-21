import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token missing" }, { status: 400 });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const activationToken = await prisma.activationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!activationToken || activationToken.used || activationToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: activationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.activationToken.update({
        where: { id: activationToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}