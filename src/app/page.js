// import { Suspense } from "react";
// import Link from "next/link";
// import { Search, Stethoscope, HeartPulse, Brain, Baby, Bone, ShieldCheck, ArrowRight, Play, Menu, User, X } from "lucide-react";
// import { publicNavLinks } from "@/lib/constants";
// import { getSession } from "@/lib/session";
// import ThemeToggle from "./ThemeToggle";

// export default function Home() {
//   return (
//     <main className="bg-background overflow-x-hidden w-full min-h-screen">
//       <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border">
//         <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
//           <Link href="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div><span className="text-xl font-bold text-primary">MediCare+</span></Link>
//           <nav className="hidden md:flex items-center gap-8">{publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text-light hover:text-primary transition-colors">{link.name}</Link>))}</nav>
//           <Suspense fallback={<div className="w-32 h-10 bg-secondary/50 animate-pulse rounded-full hidden md:block"></div>}><HeaderActions /></Suspense>
//           <details className="md:hidden relative group">
//             <summary className="list-none cursor-pointer text-primary p-2 flex items-center justify-center"><Menu size={24} className="group-open:hidden" /><X size={24} className="hidden group-open:block" /></summary>
//             <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl p-4 flex flex-col gap-4 z-50">
//               {publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text hover:text-primary py-2 border-b border-border/50">{link.name}</Link>))}
//               <div className="pt-2"><Suspense fallback={<div className="h-8 w-full bg-secondary animate-pulse rounded-md"></div>}><MobileHeaderActions /></Suspense></div>
//             </div>
//           </details>
//         </div>
//       </header>
//       <section className="relative overflow-hidden bg-linear-to-br from-secondary/40 via-background to-secondary/20 px-6 py-12 md:py-16">
//         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//           <div className="space-y-6">
//             <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-primary"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-light text-white text-xs">+</span>Your Health, Our Priority</div>
//             <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">Expert Healthcare <br /> From Anywhere</h1>
//             <p className="text-lg text-text-light max-w-lg">Book appointments, consult with top doctors, and take care of your health easily.</p>
//             <div className="flex flex-wrap items-center gap-4 pt-2"><Link href="/doctors" className="btn-primary gap-2">Find a Doctor <ArrowRight size={18} /></Link><button className="flex items-center gap-2 text-sm font-medium text-text hover:text-primary transition-colors"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border shadow-sm text-primary"><Play size={18} className="ml-0.5" /></span>Watch Video</button></div>
//           </div>
//           <div className="relative flex justify-center"><div className="relative w-full max-w-md h-70 md:h-80 rounded-3xl bg-secondary/80 overflow-hidden flex items-center justify-center"><span className="text-text-light text-sm">Doctor Image</span></div></div>
//         </div>
//       </section>
//       <section className="relative -mt-6 z-10 px-6 pb-12">
//         <div className="max-w-5xl mx-auto">
//           <div className="flex flex-col md:flex-row items-center gap-3 rounded-2xl bg-surface p-3 shadow-lg border border-border">
//             <div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} /><input type="text" placeholder="Search doctors..." className="w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-4 text-sm text-text focus:outline-none" /></div>
//             <button className="btn-primary w-full md:w-auto px-8 py-3 text-sm">Search</button>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">{[{ icon: Stethoscope, label: "General Medicine" }, { icon: HeartPulse, label: "Cardiology" }, { icon: Brain, label: "Neurology" }, { icon: Baby, label: "Pediatrics" }, { icon: Bone, label: "Orthopedics" }, { icon: ShieldCheck, label: "Dermatology" }].map((cat, i) => (<div key={i} className="card flex flex-col items-center justify-center gap-3 py-4 hover:shadow-md cursor-pointer"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"><cat.icon size={24} /></div><span className="text-xs font-medium text-text text-center">{cat.label}</span></div>))}</div>
//         </div>
//       </section>
//     </main>
//   );
// }

// async function HeaderActions() {
//   const session = await getSession();
//   return (<div className="hidden md:flex items-center gap-4"><ThemeToggle />{session ? (<><Link href="/dashboard" className="text-sm font-medium text-text flex items-center gap-1"><User size={16} /> Dashboard</Link><Link href="/api/auth-logout" className="btn-primary py-2 px-5 text-xs bg-red-500 hover:bg-red-600">Logout</Link></>) : (<><Link href="/login" className="text-sm font-medium text-text">Login</Link><Link href="/login" className="btn-primary py-2 px-5 text-xs">Get Started</Link></>)}</div>);
// }

// async function MobileHeaderActions() {
//   const session = await getSession();
//   return (<div className="flex flex-col gap-3">{session ? (<><Link href="/dashboard" className="btn-primary w-full py-2 text-center text-sm">Dashboard</Link><Link href="/api/auth-logout" className="btn-secondary w-full py-2 text-sm text-red-600 text-center">Logout</Link></>) : (<><Link href="/login" className="btn-secondary w-full py-2 text-sm text-center">Login</Link><Link href="/login" className="btn-primary w-full py-2 text-sm text-center">Get Started</Link></>)}</div>);
// }

// First Update 

import { Suspense } from "react";
import Link from "next/link";
import { Search, Stethoscope, HeartPulse, Brain, Baby, Bone, ShieldCheck, ArrowRight, Play, Menu, User, X } from "lucide-react";
import { publicNavLinks } from "@/lib/constants";
import { getSession } from "@/lib/session";
import ThemeToggle from "./ThemeToggle";

export default function Home() {
  return (
    <main className="bg-background overflow-x-hidden w-full min-h-screen">
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-white"><HeartPulse size={20} /></div><span className="text-xl font-bold text-primary">MediCare+</span></Link>
          
          <nav className="hidden md:flex items-center gap-8">{publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text-light hover:text-primary transition-colors">{link.name}</Link>))}</nav>
          
          <Suspense fallback={<div className="w-32 h-10 bg-secondary/50 animate-pulse rounded-full hidden md:block"></div>}><HeaderActions /></Suspense>
          
          <details className="md:hidden relative group">
            <summary className="list-none cursor-pointer text-primary p-2 flex items-center justify-center"><Menu size={24} className="group-open:hidden" /><X size={24} className="hidden group-open:block" /></summary>
            <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-xl p-4 flex flex-col gap-4 z-50">
              {publicNavLinks.map((link) => (<Link key={link.name} href={link.href} className="text-sm font-medium text-text hover:text-primary py-2 border-b border-border/50">{link.name}</Link>))}
              <div className="pt-2"><Suspense fallback={<div className="h-8 w-full bg-secondary animate-pulse rounded-md"></div>}><MobileHeaderActions /></Suspense></div>
            </div>
          </details>
        </div>
      </header>
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-linear-to-br from-secondary/40 via-background to-secondary/20 px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-primary"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-light text-white text-xs">+</span>Your Health, Our Priority</div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">Expert Healthcare <br /> From Anywhere</h1>
            <p className="text-lg text-text-light max-w-lg">Book appointments, consult with top doctors, and take care of your health easily.</p>
            <div className="flex flex-wrap items-center gap-4 pt-2"><Link href="/doctors" className="btn-primary gap-2">Find a Doctor <ArrowRight size={18} /></Link><button className="flex items-center gap-2 text-sm font-medium text-text hover:text-primary transition-colors"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border shadow-sm text-primary"><Play size={18} className="ml-0.5" /></span>Watch Video</button></div>
          </div>
          <div className="relative flex justify-center"><div className="relative w-full max-w-md h-70 md:h-80 rounded-3xl bg-secondary/80 overflow-hidden flex items-center justify-center"><span className="text-text-light text-sm">Doctor Image</span></div></div>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="relative -mt-6 z-10 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-3 rounded-2xl bg-surface p-3 shadow-lg border border-border">
            <div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={20} /><input type="text" placeholder="Search doctors..." className="w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-4 text-sm text-text focus:outline-none" /></div>
            <button className="btn-primary w-full md:w-auto px-8 py-3 text-sm">Search</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
            {[{ icon: Stethoscope, label: "General Medicine" }, { icon: HeartPulse, label: "Cardiology" }, { icon: Brain, label: "Neurology" }, { icon: Baby, label: "Pediatrics" }, { icon: Bone, label: "Orthopedics" }, { icon: ShieldCheck, label: "Dermatology" }].map((cat, i) => (
              <div key={i} className="card flex flex-col items-center justify-center gap-3 py-4 hover:shadow-md cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"><cat.icon size={24} /></div>
                <span className="text-xs font-medium text-text text-center">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

async function HeaderActions() {
  const session = await getSession();
  return (<div className="hidden md:flex items-center gap-4"><ThemeToggle />{session ? (<><Link href="/dashboard" className="text-sm font-medium text-text flex items-center gap-1"><User size={16} /> Dashboard</Link><Link href="/api/auth-logout" className="btn-primary py-2 px-5 text-xs bg-red-500 hover:bg-red-600">Logout</Link></>) : (<><Link href="/login" className="text-sm font-medium text-text">Login</Link><Link href="/login" className="btn-primary py-2 px-5 text-xs">Get Started</Link></>)}</div>);
}

async function MobileHeaderActions() {
  const session = await getSession();
  return (<div className="flex flex-col gap-3">{session ? (<><Link href="/dashboard" className="btn-primary w-full py-2 text-center text-sm">Dashboard</Link><Link href="/api/auth-logout" className="btn-secondary w-full py-2 text-sm text-red-600 text-center">Logout</Link></>) : (<><Link href="/login" className="btn-secondary w-full py-2 text-sm text-center">Login</Link><Link href="/login" className="btn-primary w-full py-2 text-sm text-center">Get Started</Link></>)}</div>);
}