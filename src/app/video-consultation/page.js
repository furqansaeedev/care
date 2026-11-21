"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PhoneOff, Video, Loader2 } from "lucide-react";

export default function VideoConsultationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background">Loading...</div>}>
      <VideoCall />
    </Suspense>
  );
}

function VideoCall() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const [loading, setLoading] = useState(true);
  const [apiInstance, setApiInstance] = useState(null);
  const isJitsiLoaded = useRef(false);

  useEffect(() => {
    if (!appointmentId || isJitsiLoaded.current) return;
    isJitsiLoaded.current = true;

    const APP_ID = process.env.NEXT_PUBLIC_JAAS_APP_ID;
    if (!APP_ID) {
      console.error("JaaS APP_ID missing in .env");
      setLoading(false);
      return;
    }

    const roomName = `${APP_ID}/MediCarePlus-Appointment-${appointmentId}`;

    async function fetchTokenAndLoadJitsi() {
      try {
        const tokenRes = await fetch("/api/jaas-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: "Patient", isModerator: false }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.token) throw new Error("Failed to fetch JWT token");

        const jwtToken = tokenData.token;

        const existingScript = document.getElementById("jitsi-external-api");
        if (existingScript) existingScript.remove();

        const script = document.createElement("script");
        script.id = "jitsi-external-api";
        script.src = `https://8x8.vc/${APP_ID}/external_api.js`;
        script.async = true;
        
        script.onload = () => {
          const container = document.getElementById("jitsi-container");
          if (!container) return;
          container.innerHTML = "";

          // @ts-ignore
          const api = new window.JitsiMeetExternalAPI("8x8.vc", {
            roomName: roomName,
            parentNode: container,
            jwt: jwtToken,
            apiKey: APP_ID,
            configOverwrite: {
              prejoinConfig: { enabled: true },
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closed_caption', 'fullscreen', 
                'fodeviceselection', 'profile', 'chat', 'settings', 
                'raisehand', 'videoquality', 'filmstrip', 'tileview', 
                'select-background', 'download', 'help', 'mute-everyone'
              ],
            },
          });
          
          setApiInstance(api);
          setLoading(false);
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading Jitsi:", error);
        setLoading(false);
      }
    }

    fetchTokenAndLoadJitsi();

    return () => {
      const script = document.getElementById("jitsi-external-api");
      if (script) script.remove();
    };
  }, [appointmentId]);

  function handleEndCall() {
    if (apiInstance) {
      apiInstance.dispose();
    }
    router.push("/appointments");
  }

  if (!appointmentId) return <div className="p-10 text-center">No Appointment ID</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 text-white">
          <Video size={20} />
          <span className="font-bold">MediCare+ Video Consultation</span>
        </div>
        <button onClick={handleEndCall} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
          <PhoneOff size={18} /> End Call
        </button>
      </header>
      
      <div className="flex-1 w-full h-full bg-black relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}
        <div id="jitsi-container" className="w-full h-full" />
      </div>
    </div>
  );
}