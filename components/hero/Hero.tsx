import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#2563eb22,transparent_60%)]" />

        <div className="mb-6 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-400">
          <Sparkles className="h-4 w-4" />
          <span>Welcome to xtent</span>
        </div>

        <h1 className="mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-5xl font-extrabold leading-tight text-transparent md:text-7xl">
          Your AI.
          <br />
          Your Space.
        </h1>

        <p className="mb-10 max-w-3xl text-xl leading-9 text-zinc-400 md:text-2xl">
          The next-generation AI workspace for conversations,
          creativity, productivity, and collaboration.
        </p>

        <div className="flex gap-4">
          <Link href="/chat">
            <Button size="lg">
              Get Started
            </Button>
          </Link>

          <Link href="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
