"use client";

import { Paperclip } from "lucide-react";
import { useRef } from "react";
import { useParams } from "next/navigation";

interface Props {
  onFileSelect: (file: File) => Promise<void> | void;
}

export default function FileUpload({
  onFileSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const params = useParams();

  const conversationId = params.id as string;

  async function handleFile(file: File) {
    // Existing upload (Supabase Storage)
    await onFileSelect(file);

    // Only process PDFs
    if (file.type !== "application/pdf") return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("conversationId", conversationId);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    console.log("PDF processed:", result);
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        title="Upload File"
      >
        <Paperclip size={20} />
      </button>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".pdf,.doc,.docx,.txt,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            handleFile(file);
          }
        }}
      />
    </>
  );
}