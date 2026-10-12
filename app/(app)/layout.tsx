import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}