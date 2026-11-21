import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { userName, isModerator } = await req.json();

    const appId = process.env.JAAS_APP_ID;
    let privateKey = process.env.JAAS_PRIVATE_KEY;

    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    if (!appId || !privateKey) {
      return NextResponse.json({ error: "JaaS credentials missing" }, { status: 500 });
    }

    // Aapki Key ID (screenshot wali)
    const keyId = "vpaas-magic-cookie-9e184f3c30024ca88342256bb2b0ee03/a4cb2c"; // Replace with your actual Key ID

    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: appId,
      room: "*",
      context: {
        user: {
          name: userName || "MediCare User",
          moderator: isModerator || false,
        },
        // FIX: JaaS ko yeh object lazmi chahiye, saari values boolean (true/false) hain
        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          "sip-inbound-call": false,
          "sip-outbound-call": false,
          "inbound-call": false,
          "outbound-call": false,
          "file-upload": false,
          "list-visitors": false,
          "send-groupchat": false,
          "create-polls": false,
        },
      },
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      header: {
        kid: keyId,
        typ: "JWT",
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("JWT generation error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}