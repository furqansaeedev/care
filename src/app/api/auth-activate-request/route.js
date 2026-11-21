import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { activationEmail } from "@/lib/email-templates";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal if the email exists or not
      return NextResponse.json({ message: "If an account exists, a verification email has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "This account is already activated. Please login." }, { status: 400 });
    }

    // Invalidate old tokens
    await prisma.activationToken.deleteMany({ where: { userId: user.id } });

    // Create new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.activationToken.create({
      data: { tokenHash, expiresAt, userId: user.id },
    });

    const activationLink = `${process.env.APP_URL}/activate?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Activate your MediCare+ Account",
      html: activationEmail(user.name, activationLink),
    });

    return NextResponse.json({ message: "Verification email resent successfully." });
  } catch (error) {
    console.error("Resend activation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}