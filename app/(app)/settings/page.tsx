"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name ?? "");
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
      }
    }

    loadProfile();
  }, [supabase]);

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username,
        bio,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Profile updated successfully.");
    }
  }

  return (
    <div className="max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Profile Settings
      </h1>

      <input
        className="mb-4 w-full rounded border p-3"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        className="mb-4 w-full rounded border p-3"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <textarea
        className="mb-4 w-full rounded border p-3"
        placeholder="Bio"
        rows={5}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button
        onClick={saveProfile}
        className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black"
      >
        Save Profile
      </button>

      {message && (
        <p className="mt-4">{message}</p>
      )}
    </div>
  );
}