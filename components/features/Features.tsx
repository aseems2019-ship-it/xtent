import { Brain, FileText, Globe, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Powerful AI",
    description:
      "Access intelligent AI models to help you write, code, learn, and create.",
  },
  {
    icon: FileText,
    title: "Smart Documents",
    description:
      "Upload PDFs and documents to search, summarize, and chat with your files.",
  },
  {
    icon: Globe,
    title: "Connected Workspace",
    description:
      "Bring conversations, projects, and collaboration together in one place.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your conversations and data stay protected with a privacy-focused design.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold">Everything You Need</h2>

        <p className="mt-4 text-lg text-zinc-400">
          Built for productivity, creativity, and intelligent collaboration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-white/10"
            >
              <Icon className="mb-4 h-10 w-10 text-cyan-400" />

              <h3 className="mb-3 text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="text-zinc-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}