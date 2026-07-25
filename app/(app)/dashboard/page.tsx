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
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Welcome to XtenT 🚀
      </h1>

      <p className="mt-6 text-lg">
        Logged in as:
      </p>

      <div className="mt-2 rounded-lg bg-zinc-900 p-4 text-cyan-400">
        {user.email}
      </div>
    </div>
  );
}