import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { passwordResetEmail } from "@/lib/email-templates";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = forgotPasswordSchema.safeParse(body);
    
    if (!validated.success) {
      // FIXED: Changed .errors to .issues
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { email } = validated.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { tokenHash, expiresAt, userId: user.id },
    });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your MediCare+ Password",
      html: passwordResetEmail(user.name, resetLink),
    });

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}