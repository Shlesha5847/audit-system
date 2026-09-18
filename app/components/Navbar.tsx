"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/UserContext";

export default function Navbar() {
  const { currentUser, users, firms, currentFirm, switchUser, switchFirm } = useUser();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/clients" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-tight leading-tight">
                AuditSystem
              </span>
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Supabase
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/clients"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pathname.startsWith("/clients")
                  ? "bg-slate-100 text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Clients Workspace
            </Link>
          </nav>
        </div>

        {/* Right: Tenant Firm & Role Switchers */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* 1. Tenant Firm Switcher */}
          <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-1.5 px-3 shadow-2xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <div className="flex flex-col text-right pr-0.5">
              <span className="text-[9px] uppercase font-bold text-emerald-600/80 tracking-wider leading-tight">
                Tenant
              </span>
              <span className="text-xs font-bold text-emerald-950 truncate max-w-[75px] sm:max-w-none">
                {currentFirm.name}
              </span>
            </div>

            <div className="relative">
              <select
                value={currentUser.firm_id}
                onChange={(e) => switchFirm(e.target.value)}
                className="text-xs font-semibold bg-white border border-emerald-200/80 text-emerald-900 rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer shadow-xs appearance-none"
              >
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-emerald-700">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. User & Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 px-3 shadow-2xs hover:border-slate-300 transition-colors">
            <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
              currentUser.role === "reviewer"
                ? "bg-purple-600"
                : "bg-indigo-600"
            }`}>
              {currentUser.name.charAt(0)}
            </div>

            <div className="flex flex-col text-right pr-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">
                User
              </span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[70px] sm:max-w-none">
                {currentUser.name}
              </span>
            </div>

            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-xs appearance-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Role Badge */}
            <span
              className={`hidden md:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${
                currentUser.role === "reviewer"
                  ? "bg-purple-100/80 text-purple-700 border-purple-200"
                  : "bg-indigo-100/80 text-indigo-700 border-indigo-200"
              }`}
            >
              {currentUser.role}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
