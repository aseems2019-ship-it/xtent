"use client";

import { ImageIcon } from "lucide-react";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold">
            Create with XtenT
          </h1>

          <p className="mt-2 text-zinc-400">
            Work with images and documents using XtenT.
          </p>
        </div>

        {/* Available Features */}
        <div className="max-w-xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
              <ImageIcon size={28} />
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold">
                Image Understanding
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Upload an image in chat and ask XtenT to
                understand, analyze, describe, or answer
                questions about it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}