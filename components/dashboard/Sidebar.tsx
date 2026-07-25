"use client";

import Link from "next/link";
import { MessageSquare, FolderOpen, Compass, Users, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-white">
      {/* Logo */}
      <div className="border-b border-zinc-800 p-6">
        <h1 className="text-2xl font-bold text-cyan-400">
          XtenT
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href="/chat"
          className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          <MessageSquare size={20} />
          AI Chat
        </Link>

        <Link
          href="/workspace"
          className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          <FolderOpen size={20} />
          Workspace
        </Link>

        <Link
          href="/explore"
          className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          <Compass size={20} />
          Explore
        </Link>

        <Link
          href="/communities"
          className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          <Users size={20} />
          Communities
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-800"
        >
          <Settings size={20} />
          Settings
        </Link>
      </nav>
    </aside>
  );
}