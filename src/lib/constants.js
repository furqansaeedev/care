export const publicNavLinks = [
  { name: "Home", href: "/" },
  { name: "Doctors", href: "/doctors" },
  { name: "Appointments", href: "/appointments?view=public" },
  { name: "About", href: "/#about" },
  { name: "Contact", href: "/#contact" },
];

export const patientSidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Appointments", href: "/appointments?view=dashboard", icon: "CalendarDays" },
  { name: "Chat", href: "/chat", icon: "MessageCircle" },
  { name: "Profile", href: "/profile", icon: "User" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

export const doctorSidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Appointments", href: "/appointments?view=dashboard", icon: "CalendarDays" },
  { name: "Patients", href: "/patients", icon: "Users" },
  { name: "Availability", href: "/availability", icon: "Calendar" },
  { name: "Profile", href: "/profile", icon: "User" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];