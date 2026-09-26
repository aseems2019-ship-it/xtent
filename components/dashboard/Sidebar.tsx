"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  FolderOpen,
  Compass,
  Users,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  return (
    <aside className="relative flex h-screen w-[58px] shrink-0 flex-col items-center border-r border-zinc-800 bg-[#0b0b0d] text-white">
      {/* xtent Logo */}
      <Link
        href="/chat"
        title="xtent"
        className="flex h-[58px] w-full items-center justify-center border-b border-zinc-800"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-black">
          X
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-3 py-5">
        {/* AI Chat */}
        <Link
          href="/chat"
          title="AI Chat"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-cyan-400 transition hover:bg-zinc-700"
        >
          <MessageSquare size={20} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            AI Chat
          </span>
        </Link>

        {/* Workspace */}
        <Link
          href="/workspace"
          title="Workspace"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <FolderOpen size={20} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            Workspace
          </span>
        </Link>

        {/* Create */}
        <Link
          href="/create"
          title="Create"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <Sparkles size={20} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            Create
          </span>
        </Link>

        {/* Explore */}
        <Link
          href="/explore"
          title="Explore"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <Compass size={20} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            Explore
          </span>
        </Link>

        {/* Communities */}
        <Link
          href="/communities"
          title="Communities"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <Users size={20} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            Communities
          </span>
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="relative flex flex-col items-center gap-2 border-t border-zinc-800 py-3">
        {/* Settings */}
        <Link
          href="/settings"
          title="Settings"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <Settings size={20} strokeWidth={2} />

          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            Settings
          </span>
        </Link>

        {/* Profile */}
        <button
          type="button"
          title="Profile"
          onClick={() => setProfileOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white transition hover:bg-zinc-700"
        >
          A
        </button>

        {/* Profile Menu */}
        {profileOpen && (
          <div className="absolute bottom-3 left-[68px] z-50 w-48 rounded-xl border border-zinc-800 bg-[#18181b] p-2 shadow-2xl">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={17} />

              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
