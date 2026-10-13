
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-64px)] items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.10),transparent_50%)]" />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.07] px-4 py-2 text-sm text-cyan-300">
          <Sparkles className="h-4 w-4" />
          <span>Your AI workspace</span>
        </div>

        <h1 className="mb-6 text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl md:text-8xl">
          Your AI.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Your Space.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg md:text-xl">
          Think, create, and get things done in one intelligent
          workspace built around you.
        </p>

        <div className="mt-10 flex items-center gap-2 text-sm text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>Conversations, creativity, and productivity — together.</span>
        </div>
      </div>
    </section>
  );
}
