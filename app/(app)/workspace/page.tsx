"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
};

const filters = ["All", "AI", "Data", "Development"];

export default function WorkspacePage() {
  const supabase = createClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  /*
   * Load projects belonging to the logged-in user
   */
  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in to use your workspace.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setProjects(data ?? []);
      setLoading(false);
    }

    loadProjects();
  }, [supabase]);

  /*
   * Filter projects
   */
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesFilter =
        filter === "All" || project.type === filter;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        project.name.toLowerCase().includes(searchText) ||
        project.description.toLowerCase().includes(searchText) ||
        project.type.toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [projects, search, filter]);

  /*
   * Create project
   */
  async function createProject() {
    if (!newProjectName.trim()) return;

    setCreating(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in before creating a project.");
      setCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: newProjectName.trim(),
        description:
          newProjectDescription.trim() ||
          "A new XtenT workspace project.",
        type: "Development",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setMessage(error.message);
      setCreating(false);
      return;
    }

    setProjects((current) => [data, ...current]);

    setNewProjectName("");
    setNewProjectDescription("");
    setShowCreate(false);
    setMessage("Project created successfully.");

    setCreating(false);
  }

  /*
   * Delete project
   */
  async function deleteProject(id: string) {
    setMessage("");

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setProjects((current) =>
      current.filter((project) => project.id !== id)
    );

    setMessage("Project deleted.");
  }

  /*
   * Format project date
   */
  function formatUpdatedDate(date: string) {
    const projectDate = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() - projectDate.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    const hours = Math.floor(
      difference / (1000 * 60 * 60)
    );

    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return projectDate.toLocaleDateString();
  }

  return (
    <main className="min-h-full bg-black px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-cyan-400">
              XtenT Workspace
            </p>

            <h1 className="text-4xl font-bold tracking-tight">
              Workspace
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Organize your projects, ideas, notes, and creative
              work in one place.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            + New Project
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-gray-800 bg-[#10131d] px-5 py-4 text-sm text-gray-300">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-5">
            <p className="text-sm text-gray-500">
              Projects
            </p>

            <p className="mt-2 text-3xl font-bold">
              {projects.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-5">
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold">
              {projects.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-5">
            <p className="text-sm text-gray-500">
              Workspace Status
            </p>

            <p className="mt-2 text-lg font-semibold text-cyan-400">
              {loading ? "Loading..." : "Ready"}
            </p>
          </div>

        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-gray-800 bg-[#10131d] px-5 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">

          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                filter === item
                  ? "bg-cyan-400 text-black"
                  : "border border-gray-800 bg-[#10131d] text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

        {/* Workspace Banner */}
        <section className="mb-10 rounded-2xl border border-gray-800 bg-gradient-to-r from-[#101827] to-[#11121c] p-7">

          <div className="max-w-3xl">

            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
              YOUR SPACE
            </span>

            <h2 className="mt-4 text-2xl font-bold">
              Build anything with XtenT.
            </h2>

            <p className="mt-2 text-gray-400">
              Create projects, experiment with ideas, and keep
              your work organized. More workspace tools will be
              added as XtenT grows.
            </p>

          </div>

        </section>

        {/* Projects Header */}
        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Your Projects
          </h2>

          <span className="text-sm text-gray-500">
            {filteredProjects.length} projects
          </span>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">

            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-400" />

            <p className="text-gray-400">
              Loading your projects...
            </p>

          </div>
        ) : filteredProjects.length === 0 ? (

          /* Empty state */
          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">

            <div className="text-4xl">
              🔍
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              No projects found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another search or create a new project.
            </p>

          </div>

        ) : (

          /* Projects */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredProjects.map((project) => (

              <article
                key={project.id}
                className="group rounded-2xl border border-gray-800 bg-[#10131d] p-6 transition hover:-translate-y-1 hover:border-cyan-400/50"
              >

                {/* Project icon */}
                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">

                    {project.type === "AI"
                      ? "🤖"
                      : project.type === "Data"
                      ? "📊"
                      : "💻"}

                  </div>

                  <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400">
                    {project.type}
                  </span>

                </div>

                {/* Project information */}
                <h3 className="text-xl font-semibold">
                  {project.name}
                </h3>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-400">
                  {project.description}
                </p>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-5">

                  <span className="text-xs text-gray-500">
                    Updated {formatUpdatedDate(project.updated_at)}
                  </span>

                  <button
                    onClick={() =>
                      deleteProject(project.id)
                    }
                    className="text-xs text-gray-500 transition hover:text-red-400"
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

        {/* Create Project Modal */}
        {showCreate && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">

            <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#10131d] p-7 shadow-2xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    New Project
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create a project in your workspace.
                  </p>

                </div>

                <button
                  onClick={() => setShowCreate(false)}
                  className="text-2xl text-gray-500 hover:text-white"
                >
                  ×
                </button>

              </div>

              <label className="mb-2 block text-sm font-medium">
                Project Name
              </label>

              <input
                type="text"
                placeholder="My new project"
                value={newProjectName}
                onChange={(e) =>
                  setNewProjectName(e.target.value)
                }
                className="mb-5 w-full rounded-xl border border-gray-800 bg-[#070a14] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-cyan-400"
              />

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                placeholder="What are you building?"
                value={newProjectDescription}
                onChange={(e) =>
                  setNewProjectDescription(e.target.value)
                }
                rows={4}
                className="mb-6 w-full resize-none rounded-xl border border-gray-800 bg-[#070a14] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-cyan-400"
              />

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-gray-800 px-5 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  onClick={createProject}
                  disabled={
                    !newProjectName.trim() || creating
                  }
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creating
                    ? "Creating..."
                    : "Create Project"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </main>
  );
}