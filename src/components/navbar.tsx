"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Plus, BarChart3, LayoutDashboard } from "lucide-react";

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
          <div className="p-2 rounded-xl bg-dm-indigo/20 group-hover:bg-dm-indigo/30 transition-colors">
            <Brain className="w-7 h-7 text-dm-indigo" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-dm-text to-dm-indigo bg-clip-text text-transparent tracking-tight">
            DealBook
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
