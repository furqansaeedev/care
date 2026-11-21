"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Camera } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  if (!mounted) return <div className="w-9 h-9"></div>;

  return (
    <button onClick={toggleTheme} className="text-text-light hover:text-primary transition-colors p-2 rounded-full hover:bg-secondary" aria-label="Toggle Dark Mode">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

// Avatar Upload using next-cloudinary
export function AvatarUpload() {
  return (
    <CldUploadWidget
      cloudName="lxp8cnh"
      uploadPreset="medicare_upload" // Cloudinary Dashboard se preset name
      onSuccess={(result) => {
        if (result.info && typeof result.info === "object") {
          const imageUrl = result.info.secure_url;
          // Server Action call karein image save karne ke liye
          fetch("/api/update-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
          }).then(() => {
            window.location.reload();
          });
        }
      }}
    >
      {({ open }) => {
        return (
          <button
            onClick={() => open()}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors"
          >
            <Camera size={16} />
          </button>
        );
      }}
    </CldUploadWidget>
  );
}