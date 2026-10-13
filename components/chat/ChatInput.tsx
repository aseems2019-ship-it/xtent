
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  Send,
  ImagePlus,
  Mic,
  AudioLines,
  FileDown,
} from "lucide-react";

import ImagePreview from "./ImagePreview";
import DropZone from "./DropZone";
import LiveVoiceChat from "./LiveVoiceChat";

interface ChatInputProps {
  onSend: (
    message: string,
    attachment?: File
  ) => Promise<void>;
  loading: boolean;
  initialMessage?: string;
}

export default function ChatInput({
  onSend,
  loading,
  initialMessage = "",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [showLiveVoice, setShowLiveVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [convertingPdf, setConvertingPdf] = useState(false);

  const recognitionRef = useRef<any>(null);
  const baseMessageRef = useRef("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;

      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;

        try {
          recognition.abort();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function handleSubmit() {
    if ((!message.trim() && !attachment) || loading) {
      return;
    }

    if (recognitionRef.current) {
      stopListening();
    }

    try {
      await onSend(message.trim(), attachment ?? undefined);

      setMessage("");
      setAttachment(null);
      setPreview("");
      baseMessageRef.current = "";

      if (textareaRef.current) {
        textareaRef.current.style.height = "48px";
      }
    } catch (error) {
      console.error("Unable to send message:", error);
    }
  }

  function handleAttachment(file: File) {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setAttachment(file);
    setPreview(
      file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : ""
    );
  }

  function removeAttachment() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setAttachment(null);
    setPreview("");
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value);

    const textarea = e.target;
    textarea.style.height = "48px";
    textarea.style.height =
      Math.min(textarea.scrollHeight, 208) + "px";
  }

  async function handleKeyDown(
    e: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      await handleSubmit();
    }
  }

  function startListening() {
    if (!speechSupported) {
      alert("Voice input is not supported by this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const previousRecognition = recognitionRef.current;

    if (previousRecognition) {
      recognitionRef.current = null;
      previousRecognition.onresult = null;
      previousRecognition.onend = null;
      previousRecognition.onerror = null;

      try {
        previousRecognition.abort();
      } catch {}
    }

    // Preserve any text already typed into the composer.
    baseMessageRef.current = message.trim();

    const recognition = new SpeechRecognition();

    recognition.continuous = true;

    // Display provisional speech before the browser finalizes it.
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-IN";

    recognition.onstart = () => {
      if (recognitionRef.current === recognition) {
        setListening(true);
      }
    };

    recognition.onresult = (event: any) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      // Rebuild the spoken text from the current results list.
      // Do not append every event: interim results can change,
      // and appending them repeatedly can duplicate words.
      const segments: string[] = [];

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript?.trim();

        if (transcript) {
          segments.push(transcript);
        }
      }

      const spokenText = segments.join(" ").trim();
      const baseText = baseMessageRef.current;

      const combinedText =
        baseText && spokenText
          ? `${baseText} ${spokenText}`
          : baseText || spokenText;

      setMessage(combinedText.slice(0, 10000));
    };

    recognition.onerror = (event: any) => {
      if (recognitionRef.current !== recognition) {
        return;
      }

      console.error("Speech recognition error:", event.error);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        alert(
          "Microphone access was denied. Please allow microphone access in your browser settings."
        );
      }

      recognitionRef.current = null;
      setListening(false);
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error("Unable to start voice input:", error);

      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      setListening(false);
    }
  }

  function stopListening() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setListening(false);
      return;
    }

    try {
      // Let the browser finish processing pending speech.
      recognition.stop();
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  }

  function toggleMicrophone() {
    if (recognitionRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }

  function openLiveVoice() {
    if (loading) return;

    if (recognitionRef.current) {
      stopListening();
    }

    setShowLiveVoice(true);
  }

  async function convertToPdf() {
    if (!attachment || loading || convertingPdf) {
      return;
    }

    try {
      setConvertingPdf(true);

      const formData = new FormData();
      formData.append("file", attachment);

      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "xtent-document.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF conversion failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate PDF."
      );
    } finally {
      setConvertingPdf(false);
    }
  }

  return (
    <>
      <DropZone onFileDrop={handleAttachment}>
        <div className="w-full border-t border-zinc-800 bg-zinc-950 p-2 sm:p-4">
          {attachment && (
            <div className="mx-auto mb-3 w-full max-w-4xl">
              {preview ? (
                <ImagePreview
                  image={preview}
                  onRemove={removeAttachment}
                />
              ) : (
                <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                      <FileDown
                        size={20}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="shrink-0 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900 p-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              maxLength={10000}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Message xtent..."
              aria-label="Message xtent"
              className="block min-h-12 max-h-52 w-full min-w-0 resize-none overflow-y-auto bg-transparent px-3 py-3 text-base text-white outline-none placeholder:text-zinc-500"
            />

            <div className="mt-1 flex min-w-0 items-center justify-between gap-1">
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  title="Attach file"
                  aria-label="Attach file"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                >
                  <ImagePlus size={21} />
                </button>

                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/*,.pdf,.txt,.md,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleAttachment(file);
                    }

                    e.target.value = "";
                  }}
                />
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  disabled={loading || !speechSupported}
                  title={listening ? "Stop voice input" : "Voice input"}
                  aria-label={
                    listening ? "Stop voice input" : "Voice input"
                  }
                  aria-pressed={listening}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition disabled:opacity-40 ${
                    listening
                      ? "bg-red-500 text-white"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Mic
                    size={20}
                    className={listening ? "animate-pulse" : ""}
                  />
                </button>

                <button
                  type="button"
                  onClick={openLiveVoice}
                  disabled={loading}
                  title="Start live voice chat"
                  aria-label="Start live voice chat"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                >
                  <AudioLines size={21} />
                </button>

                {attachment && (
                  <button
                    type="button"
                    onClick={convertToPdf}
                    disabled={loading || convertingPdf}
                    title={
                      convertingPdf
                        ? "Generating PDF..."
                        : "Convert attachment to PDF"
                    }
                    aria-label="Convert attachment to PDF"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                  >
                    <FileDown
                      size={20}
                      className={convertingPdf ? "animate-pulse" : ""}
                    />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (!message.trim() && !attachment)}
                  title="Send message"
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-2 flex w-full max-w-4xl justify-between gap-2 px-2 text-[10px] text-zinc-500 sm:text-xs">
            <span>Enter to send · Shift + Enter for new line</span>
            <span className="shrink-0">
              {message.length}/10000
            </span>
          </div>
        </div>
      </DropZone>

      {showLiveVoice && (
        <LiveVoiceChat onClose={() => setShowLiveVoice(false)} />
      )}
    </>
  );
}
