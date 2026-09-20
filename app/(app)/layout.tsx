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
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}