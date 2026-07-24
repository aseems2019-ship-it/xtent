import {
  MessageSquare,
  FolderOpen,
  Compass,
  Users,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const menu = [
    { icon: MessageSquare, label: "AI Chat" },
    { icon: FolderOpen, label: "Workspace" },
    { icon: Compass, label: "Explore" },
    { icon: Users, label: "Communities" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 border-r border-gray-800 bg-[#111827] p-6">
      <h1 className="mb-10 text-2xl font-bold text-white">
        XtenT
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition hover:bg-indigo-600 hover:text-white"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}