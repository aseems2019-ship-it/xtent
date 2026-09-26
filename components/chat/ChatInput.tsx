"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  const [message, setMessage] =
    useState("");

  const [attachment, setAttachment] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [showLiveVoice, setShowLiveVoice] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const [convertingPdf, setConvertingPdf] =
    useState(false);

  const recognitionRef =
    useRef<any>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

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
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function handleSubmit() {
    if (
      (!message.trim() && !attachment) ||
      loading
    ) {
      return;
    }

    if (listening) {
      stopListening();
    }

    await onSend(
      message.trim(),
      attachment ?? undefined
    );

    setMessage("");
    setAttachment(null);
    setPreview("");

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "24px";
    }
  }

  function handleAttachment(file: File) {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setAttachment(file);

    if (file.type.startsWith("image/")) {
      setPreview(
        URL.createObjectURL(file)
      );
    } else {
      setPreview("");
    }
  }

  function removeAttachment() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setAttachment(null);
    setPreview("");
  }

  function handleChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setMessage(e.target.value);

    const textarea = e.target;

    textarea.style.height = "24px";
    textarea.style.height =
      textarea.scrollHeight + "px";
  }

  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      await handleSubmit();
    }
  }

  function startListening() {
    if (!speechSupported) {
      alert(
        "Voice input is not supported by this browser."
      );

      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}

      recognitionRef.current = null;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.lang =
      navigator.language || "en-IN";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (
      event: any
    ) => {
      let finalText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]
            .transcript;

        if (
          event.results[i].isFinal
        ) {
          finalText += transcript;
        }
      }

      if (finalText) {
        setMessage(
          (previous) =>
            previous +
            (previous ? " " : "") +
            finalText
        );
      }
    };

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setListening(false);
      recognitionRef.current = null;
    }
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch {}

    recognitionRef.current = null;
    setListening(false);
  }

  function toggleMicrophone() {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function openLiveVoice() {
    if (loading) {
      return;
    }

    if (listening) {
      stopListening();
    }

    setShowLiveVoice(true);
  }

  function closeLiveVoice() {
    setShowLiveVoice(false);
  }

  async function convertToPdf() {
    if (!attachment || loading || convertingPdf) {
      return;
    }

    try {
      setConvertingPdf(true);

      const formData = new FormData();

      formData.append(
        "file",
        attachment
      );

      const response = await fetch(
        "/api/pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "Failed to generate PDF."
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "xtent-document.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "PDF conversion failed:",
        error
      );

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
      <DropZone
        onFileDrop={handleAttachment}
      >
        <div className="border-t border-zinc-800 bg-zinc-950 p-4">

          {/* ATTACHMENT PREVIEW */}

          {attachment && (
            <div className="mx-auto mb-4 max-w-4xl">

              {preview ? (
                <ImagePreview
                  image={preview}
                  onRemove={
                    removeAttachment
                  }
                />
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">

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
                        {(
                          attachment.size /
                          1024
                        ).toFixed(1)}{" "}
                        KB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeAttachment
                    }
                    className="ml-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* INPUT BAR */}

          <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2">

            {/* ATTACH FILE */}

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={loading}
              title="Attach file"
              className="rounded-xl p-3 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ImagePlus size={20} />
            </button>

            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*,.pdf,.txt,.md,.docx"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (file) {
                  handleAttachment(file);
                }

                e.target.value = "";
              }}
            />

            {/* TEXT INPUT */}

            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              maxLength={10000}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Message xtent..."
              className="max-h-52 min-h-[24px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-white outline-none placeholder:text-zinc-500"
            />

            {/* MICROPHONE */}

            <button
              type="button"
              onClick={
                toggleMicrophone
              }
              disabled={loading}
              title={
                listening
                  ? "Stop voice input"
                  : "Voice input"
              }
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                listening
                  ? "bg-red-500 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Mic
                size={22}
                className={
                  listening
                    ? "animate-pulse"
                    : ""
                }
              />
            </button>

            {/* LIVE VOICE */}

            <button
              type="button"
              onClick={
                openLiveVoice
              }
              disabled={loading}
              title="Start live voice chat"
              aria-label="Start live voice chat"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <AudioLines
                size={24}
              />
            </button>

            {/* CONVERT TO PDF */}

            {attachment && (
              <button
                type="button"
                onClick={
                  convertToPdf
                }
                disabled={
                  loading ||
                  convertingPdf
                }
                title={
                  convertingPdf
                    ? "Generating PDF..."
                    : "Convert attachment to PDF"
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileDown
                  size={20}
                  className={
                    convertingPdf
                      ? "animate-pulse"
                      : ""
                  }
                />
              </button>
            )}

            {/* SEND */}

            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={
                loading ||
                (!message.trim() &&
                  !attachment)
              }
              title="Send message"
              className="rounded-xl bg-cyan-500 p-3 text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>

          {/* FOOTER */}

          <div className="mt-2 flex justify-between px-2 text-xs text-zinc-500">

            <span>
              Enter to send • Shift +
              Enter for new line
            </span>

            <span>
              {message.length}/10000
            </span>
          </div>
        </div>
      </DropZone>

      {/* LIVE VOICE */}

      {showLiveVoice && (
        <LiveVoiceChat
          onClose={
            closeLiveVoice
          }
        />
      )}
    </>
  );
}

