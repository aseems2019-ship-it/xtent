import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-black p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white">
          Welcome to helpS 🚀
        </h1>

        <p className="mt-6 text-lg text-zinc-400">
          Welcome back,
        </p>

        <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-cyan-400">
          aseemsall007
        </div>
      </div>
    </div>
  );
}
