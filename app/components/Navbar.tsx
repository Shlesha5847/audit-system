"use client";

import Link from "next/link";
import { useUser } from "@/lib/UserContext";

export default function Navbar() {
  const { currentUser, users, firms, currentFirm, switchUser, switchFirm } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/clients" className="flex items-center gap-2">
            <span className="h-8 w-8 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center text-sm shadow-xs">
              AS
            </span>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Audit System
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/clients"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Clients
            </Link>
          </nav>
        </div>

        {/* Switchers Cluster */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* 1. Firm Switcher (Multi-Tenant) */}
          <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-1.5 px-2.5">
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold text-emerald-700/70 leading-tight">
                Tenant Firm
              </span>
              <span className="text-xs font-semibold text-emerald-900 truncate max-w-[80px] sm:max-w-none">
                {currentFirm.name}
              </span>
            </div>

            <select
              value={currentUser.firm_id}
              onChange={(e) => switchFirm(e.target.value)}
              className="text-xs font-semibold bg-white border border-emerald-300 rounded px-2 py-1 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Role / User Switcher */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1.5 px-2.5">
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold text-gray-400 leading-tight">
                User & Role
              </span>
              <span className="text-xs font-semibold text-gray-800 truncate max-w-[70px] sm:max-w-none">
                {currentUser.name}
              </span>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="text-xs font-medium bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>

            <span
              className={`hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                currentUser.role === "reviewer"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : "bg-blue-100 text-blue-800 border-blue-200"
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
