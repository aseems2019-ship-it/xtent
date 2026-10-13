
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  PanelLeft,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isChatPage =
    pathname === "/chat" || pathname.startsWith("/chat/");

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  const handleHistoryToggle = () => {
    if (!isChatPage) {
      router.push("/chat");
      return;
    }

    window.dispatchEvent(new Event("toggle-chat-history"));
  };

  return (
    <aside
      className={`relative h-dvh w-[58px] shrink-0 flex-col items-center border-r border-zinc-800 bg-[#0b0b0d] text-white ${
        isChatPage ? "hidden md:flex" : "flex"
      }`}
    >
      {/* xtent Logo */}
      <Link
        href="/chat"
        title="xtent"
        className="flex h-[58px] w-full shrink-0 items-center justify-center border-b border-zinc-800"
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
          className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-zinc-800 ${
            isChatPage
              ? "bg-zinc-800 text-cyan-400"
              : "text-zinc-400 hover:text-white"
          }`}
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

      {/* Bottom Navigation */}
      <div className="relative flex shrink-0 flex-col items-center gap-2 border-t border-zinc-800 py-3">
        {/* Toggle conversation history */}
        <button
          type="button"
          title={isChatPage ? "Toggle chat history" : "Open chat history"}
          aria-label={
            isChatPage ? "Toggle chat history" : "Open chat history"
          }
          onClick={handleHistoryToggle}
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <PanelLeft size={20} strokeWidth={2} />
          <span className="pointer-events-none absolute left-[68px] z-50 hidden whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
            Chat history
          </span>
        </button>

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
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-semibold text-black transition hover:bg-cyan-400"
        >
          A
        </button>

        {/* Profile menu */}
        {profileOpen && (
          <div className="absolute bottom-0 left-[68px] z-50 w-44 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        )}
      </div>
      
      {/* Copyright */}
      <div className="shrink-0 border-t border-zinc-800 px-2 py-3 text-center">
        <p className="text-[10px] leading-relaxed text-zinc-500">
          © 2026 xtent · Created by Aseem S
        </p>
      </div>
    </aside>
  );
}
