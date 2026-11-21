import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { registerSchema, loginSchema } from "@/lib/validation";
import { sendEmail } from "@/lib/mail";
import { activationEmail } from "@/lib/email-templates";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    // ==========================================
    // REGISTRATION FLOW
    // ==========================================
    if (action === "register") {
      const validated = registerSchema.safeParse(body);
      if (!validated.success) return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });

      const { name, email, password, role } = validated.data;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return NextResponse.json({ error: "Email already exists. Please login." }, { status: 409 });

      const hashedPassword = await hashPassword(password);
      
      // Use a transaction to ensure User and Profile are created together
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { name, email, password: hashedPassword, role },
        });

        // Explicitly create the profile based on role
        if (role === "DOCTOR") {
          await tx.doctorProfile.create({
            data: { userId: newUser.id, specialty: "General", status: "PENDING" },
          });
        } else if (role === "PATIENT") {
          await tx.patientProfile.create({
            data: { userId: newUser.id },
          });
        }

        return newUser;
      });

      // Generate Activation Token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.activationToken.create({ data: { tokenHash, expiresAt, userId: user.id } });

      // Send Email
      const activationLink = `${process.env.APP_URL}/activate?token=${rawToken}`;
      const emailResult = await sendEmail({
        to: email,
        subject: "Activate your MediCare+ Account",
        html: activationEmail(name, activationLink),
      });

      if (!emailResult.success) {
        return NextResponse.json({ error: `Registration saved, but email failed: ${emailResult.error}` }, { status: 500 });
      }

      return NextResponse.json({ message: "Registration successful. Check your email to activate." }, { status: 201 });
    }

    // ==========================================
    // LOGIN FLOW
    // ==========================================
    if (action === "login") {
      const validated = loginSchema.safeParse(body);
      if (!validated.success) return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });

      const { email, password } = validated.data;
      const user = await prisma.user.findUnique({ 
        where: { email },
        include: { doctorProfile: true, patientProfile: true } 
      });
      
      if (!user || !user.password) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      if (!user.emailVerified) return NextResponse.json({ error: "Please verify your email first.", needsActivation: true }, { status: 403 });

      // STRICT ROLE CHECK FOR ADMIN
      if (user.role === "ADMIN") {
        await createSession({ ...user });
        return NextResponse.json({ success: true, redirect: "/admin" });
      }

      // AUTO-CREATE MISSING PROFILES (Safety net)
      if (user.role === "DOCTOR" && !user.doctorProfile) {
        await prisma.doctorProfile.create({ data: { userId: user.id, specialty: "General" } });
        user.doctorProfile = { status: "PENDING" }; 
      }
      if (user.role === "PATIENT" && !user.patientProfile) {
        await prisma.patientProfile.create({ data: { userId: user.id } });
      }

      // Check Doctor Approval Status
      if (user.role === "DOCTOR") {
        if (user.doctorProfile?.status !== "APPROVED") {
          await createSession({ ...user, doctorStatus: user.doctorProfile?.status || "PENDING" });
          return NextResponse.json({ success: true, redirect: "/pending-approval" });
        }
      }

      await createSession({ ...user, doctorStatus: user.doctorProfile?.status });
      
      return NextResponse.json({ success: true, redirect: "/dashboard" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}