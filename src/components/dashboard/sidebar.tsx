"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  FiHome, 
  FiTarget, 
  FiCheckSquare, 
  FiFileText, 
  FiLogOut, 
  FiActivity, 
  FiChevronDown 
} from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Habits", href: "/habits", icon: FiCheckSquare },
    { name: "Goals", href: "/goals", icon: FiTarget },
    { name: "Notes", href: "/notes", icon: FiFileText },
    { name: "Insights", href: "/assistant", icon: FiActivity },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#FAF7F5] dark:bg-zinc-950 border-r border-[#EADEDF] dark:border-zinc-850 flex flex-col p-6 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="flex-1 flex flex-col">
        {/* Logo Section */}
        <div className="flex flex-col mb-6 pl-2">
          <span className="text-2xl font-extrabold tracking-wide text-zinc-900 dark:text-white leading-none">
            LIFE <span className="text-[#4D1A1E] dark:text-rose-450">OS</span>
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wide mt-1.5 uppercase">
            Build discipline. Design freedom.
          </span>
        </div>

        {/* Menu Section */}
        <div className="mb-4">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 pl-4 pr-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[#4D1A1E] text-white shadow-md shadow-[#4D1A1E]/10"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? "text-white scale-105" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:scale-105"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Landscape Illustration Card */}
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-[#FDFCFB] dark:bg-zinc-900 border border-[#EADEDF] dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 mb-4 flex flex-col gap-2.5 shadow-sm mt-auto">
          <div className="relative h-20 w-full rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/sidebar_landscape.png" 
              alt="Discipline Landscape" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5 pl-0.5">
            <h5 className="font-extrabold text-[10.5px] leading-tight text-zinc-850 dark:text-zinc-100">Discipline today.</h5>
            <h5 className="font-extrabold text-[10.5px] leading-tight text-zinc-850 dark:text-zinc-100">Freedom tomorrow.</h5>
            <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 mt-1 font-bold flex items-center gap-1">
              Keep going, Aditya. 🍂
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Section at the bottom */}
      <div className="flex items-center justify-between pl-1 pr-1 border-t border-[#EADEDF] dark:border-zinc-850 pt-4 mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#4D1A1E] text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
            A
          </div>
          <div className="flex items-center gap-1 cursor-pointer">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">Aditya</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">Level 23</span>
            </div>
            <FiChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-[#4D1A1E] dark:hover:text-rose-450 hover:bg-[#FAF0F1] dark:hover:bg-zinc-900 transition cursor-pointer"
          title="Sign Out"
        >
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}