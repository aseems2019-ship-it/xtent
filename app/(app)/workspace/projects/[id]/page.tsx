"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProject() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in to view this project.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        setMessage("Project could not be found.");
        setLoading(false);
        return;
      }

      setProject(data);
      setLoading(false);
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId, supabase]);

  if (loading) {
    return (
      <main className="min-h-full bg-[#070a14] px-6 py-8 text-white md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-400" />

            <p className="text-gray-400">
              Loading project...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-full bg-[#070a14] px-6 py-8 text-white md:px-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/workspace/projects"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Projects
          </Link>

          <div className="mt-6 rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">
            <div className="text-4xl">📁</div>

            <h1 className="mt-4 text-2xl font-bold">
              Project not found
            </h1>

            <p className="mt-2 text-gray-500">
              {message ||
                "This project may have been deleted or you may not have access to it."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#070a14] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href="/workspace/projects"
          className="text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          ← Back to Projects
        </Link>

        {/* Project Header */}
        <section className="mt-6 rounded-2xl border border-gray-800 bg-[#10131d] p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div className="flex gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                {project.type === "AI"
                  ? "🤖"
                  : project.type === "Data"
                  ? "📊"
                  : "💻"}
              </div>

              <div>
                <div className="mb-2">
                  <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                    {project.type}
                  </span>
                </div>

                <h1 className="text-3xl font-bold">
                  {project.name}
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-gray-400">
                  {project.description}
                </p>
              </div>

            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-gray-500">
                Created
              </p>

              <p className="mt-1 text-sm text-gray-300">
                {new Date(
                  project.created_at
                ).toLocaleDateString()}
              </p>
            </div>

          </div>
        </section>

        {/* Project Workspace */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">

          {/* AI */}
          <button className="rounded-2xl border border-gray-800 bg-[#10131d] p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/50">
            <div className="text-2xl">🤖</div>

            <h2 className="mt-4 text-lg font-semibold">
              AI Assistant
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Work with AI inside this project.
            </p>
          </button>

          {/* Notes */}
          <button className="rounded-2xl border border-gray-800 bg-[#10131d] p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/50">
            <div className="text-2xl">📝</div>

            <h2 className="mt-4 text-lg font-semibold">
              Notes
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Keep project ideas, notes, and important information.
            </p>
          </button>

          {/* Files */}
          <button className="rounded-2xl border border-gray-800 bg-[#10131d] p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/50">
            <div className="text-2xl">📂</div>

            <h2 className="mt-4 text-lg font-semibold">
              Files
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Organize files and resources for this project.
            </p>
          </button>

        </section>

        {/* Coming Soon */}
        <section className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-7">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            PROJECT WORKSPACE
          </span>

          <h2 className="mt-4 text-2xl font-bold">
            Your project space is ready.
          </h2>

          <p className="mt-2 max-w-2xl leading-7 text-gray-400">
            This is the foundation for the full helpS project
            workspace. We will add AI conversations, notes,
            files, and other project tools here step by step.
          </p>
        </section>

      </div>
    </main>
  );
}