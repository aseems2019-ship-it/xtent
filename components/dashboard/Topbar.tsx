"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Topbar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-11 shrink-0 items-center justify-end border-b border-zinc-800 bg-black px-4">
      <div className="flex items-center gap-2">
        {/* User Avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-black">
          A
        </div>

        {/* User Name */}
        <span className="text-xs font-medium text-zinc-300">
          aseemsall007
        </span>

        {/* Online Indicator */}
        <span
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          title="Online"
        />

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="ml-1 rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}