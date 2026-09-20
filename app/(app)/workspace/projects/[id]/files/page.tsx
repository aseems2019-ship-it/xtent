"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
};

type ProjectFile = {
  name: string;
  path: string;
  created_at: string;
  size?: number;
};

export default function ProjectFilesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in to access this project.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        setMessage("Project not found.");
        setLoading(false);
        return;
      }

      setProject(data);

      await loadFiles();

      setLoading(false);
    }

    loadProject();
  }, [projectId]);

  async function loadFiles() {
    const { data, error } = await supabase.storage
      .from("project-files")
      .list(projectId, {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    const validFiles = (data ?? []).filter(
      (file) => file.name !== ".emptyFolderPlaceholder"
    );

    setFiles(
      validFiles.map((file) => ({
        name: file.name,
        path: `${projectId}/${file.name}`,
        created_at: file.created_at ?? "",
        size: file.metadata?.size,
      }))
    );
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage("");

    const filePath = `${projectId}/${file.name}`;

    const { error } = await supabase.storage
      .from("project-files")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error(error);
      setMessage(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }

    setMessage("✅ File uploaded successfully.");

    await loadFiles();

    setUploading(false);

    event.target.value = "";
  }

  function getFileUrl(path: string) {
    const { data } = supabase.storage
      .from("project-files")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function deleteFile(path: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (!confirmed) return;

    const { error } = await supabase.storage
      .from("project-files")
      .remove([path]);

    if (error) {
      console.error(error);
      setMessage(`Delete failed: ${error.message}`);
      return;
    }

    setFiles((current) =>
      current.filter((file) => file.path !== path)
    );

    setMessage("File deleted.");
  }

  function formatSize(size?: number) {
    if (!size) return "Unknown size";

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(
      size /
      (1024 * 1024 * 1024)
    ).toFixed(1)} GB`;
  }

  if (loading) {
    return (
      <main className="min-h-full bg-[#070a14] px-6 py-8 text-white md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-cyan-400" />

            <p className="text-gray-400">
              Loading project files...
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
          <h1 className="text-2xl font-bold">
            Project not found
          </h1>

          <Link
            href="/workspace/projects"
            className="mt-4 inline-block text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-[#070a14] px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href={`/workspace/projects/${project.id}`}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Project
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-gray-500">
              {project.name}
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Project Files
            </h1>

            <p className="mt-2 text-gray-400">
              Upload and manage files for this project.
            </p>
          </div>

          <label className="cursor-pointer rounded-xl bg-cyan-400 px-6 py-3 text-center font-semibold text-black transition hover:bg-cyan-300">
            {uploading
              ? "Uploading..."
              : "+ Upload File"}

            <input
              type="file"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 rounded-xl border border-gray-800 bg-[#10131d] px-5 py-4 text-sm text-gray-300">
            {message}
          </div>
        )}

        {/* Files */}
        {files.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-[#10131d] p-12 text-center">

            <div className="text-5xl">
              📂
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              No files yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-gray-500">
              Upload datasets, documents, images, code files,
              and other resources for this project.
            </p>

            <label className="mt-6 inline-block cursor-pointer rounded-xl border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-cyan-400 hover:text-cyan-400">
              Choose a File

              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>

          </div>
        ) : (
          <div className="mt-8 space-y-3">

            {files.map((file) => (
              <div
                key={file.path}
                className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-[#10131d] p-5 transition hover:border-gray-700 md:flex-row md:items-center md:justify-between"
              >

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">
                    📄
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {file.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatSize(file.size)}
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <a
                    href={getFileUrl(file.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-400"
                  >
                    Open
                  </a>

                  <button
                    onClick={() => deleteFile(file.path)}
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 transition hover:border-red-400 hover:text-red-400"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* Information */}
        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

          <p className="text-sm leading-6 text-gray-400">
            Files uploaded here are stored inside this
            project's folder in XtenT.
          </p>

          <p className="mt-2 text-xs text-gray-600">
            Storage bucket: project-files
          </p>

        </div>

      </div>
    </main>
  );
}