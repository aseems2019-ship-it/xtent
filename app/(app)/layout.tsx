import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Topbar />

          <section className="flex-1 p-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}