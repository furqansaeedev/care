import { cookies } from "next/headers";
import { encrypt, decrypt } from "./auth";
import { prisma } from "./prisma";

export async function createSession(user) {
  // Fetch the doctor profile status if the user is a doctor
  let doctorStatus = null;
  if (user.role === "DOCTOR") {
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
    });
    doctorStatus = profile?.status || "PENDING";
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  // Add doctorStatus to the token payload
  const session = await encrypt({ 
    userId: user.id, 
    role: user.role, 
    name: user.name,
    doctorStatus 
  });
  
  (await cookies()).set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function destroySession() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}