"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully!");

    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6">
      <form
        onSubmit={signup}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl"
      >
        <h1 className="mb-2 text-3xl font-bold text-white">
          Create Account
        </h1>

        <p className="mb-8 text-zinc-400">
          Join XtenT and start chatting with AI.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="mt-6 text-center text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-cyan-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </main>
  );
}