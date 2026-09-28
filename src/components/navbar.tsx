"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, BarChart3, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-dm-indigo/20 text-dm-indigo"
        : "text-dm-muted hover:text-dm-text hover:bg-white/5"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dm-bg/85 backdrop-blur-xl">
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 transform group-hover:scale-105 transition-transform">
            <defs>
              <linearGradient id="db-grad-1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="db-glow-1" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
            {/* Rounded Dark Squircle Container */}
            <rect width="36" height="36" rx="10" fill="#131629" stroke="url(#db-grad-1)" strokeWidth="1.5" strokeOpacity="0.4"/>
            {/* Left Book Page / Deal Wing */}
            <path d="M10 12C10 10.8954 10.8954 10 12 10H16.5C17.3284 10 18 10.6716 18 11.5V25.5C18 25.7761 17.7761 26 17.5 26H12C10.8954 26 10 25.1046 10 24V12Z" fill="url(#db-grad-1)" fillOpacity="0.25" stroke="url(#db-glow-1)" strokeWidth="1.6"/>
            {/* Right Page Morphing into AI Memory Nodes */}
            <path d="M18 13H22.5M18 18H24.5M18 23H21.5" stroke="url(#db-glow-1)" strokeWidth="1.8" strokeLinecap="round"/>
            {/* Memory Nodes */}
            <circle cx="24" cy="13" r="2" fill="#C084FC"/>
            <circle cx="26" cy="18" r="2.2" fill="#818CF8"/>
            <circle cx="23" cy="23" r="2" fill="#C084FC"/>
            {/* AI Spark / Hindsight Star on Spine */}
            <path d="M18 6.5L18.9 8.6L21 9.5L18.9 10.4L18 12.5L17.1 10.4L15 9.5L17.1 8.6L18 6.5Z" fill="#E0E7FF"/>
          </svg>
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Deal<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Book</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/" className={linkClass("/")}>
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link href="/patterns" className={linkClass("/patterns")}>
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Patterns</span>
          </Link>
          <Link
            href="/deals/new"
            className="flex items-center gap-2 px-3.5 py-2 ml-1 sm:ml-2 rounded-lg text-sm font-medium bg-dm-indigo hover:bg-dm-indigo-hover text-white transition-all duration-200 shadow-lg shadow-dm-indigo/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Deal</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
