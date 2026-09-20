"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import {
  Mic,
  PhoneOff,
  Loader2,
} from "lucide-react";

interface LiveVoiceChatProps {
  onClose: () => void;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(
      i,
      Math.min(i + chunkSize, bytes.length)
    );

    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Int16Array(bytes.buffer);
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(
      -1,
      Math.min(1, input[i])
    );

    output[i] =
      sample < 0
        ? sample * 0x8000
        : sample * 0x7fff;
  }

  return output;
}

function downsample(
  buffer: Float32Array,
  inputRate: number,
  outputRate: number
): Float32Array {
  if (inputRate === outputRate) {
    return buffer;
  }

  const ratio = inputRate / outputRate;

  const newLength = Math.round(
    buffer.length / ratio
  );

  const result = new Float32Array(
    newLength
  );

  for (let i = 0; i < newLength; i++) {
    const start = Math.floor(
      i * ratio
    );

    const end = Math.min(
      Math.floor((i + 1) * ratio),
      buffer.length
    );

    let sum = 0;
    let count = 0;

    for (let j = start; j < end; j++) {
      sum += buffer[j];
      count++;
    }

    result[i] =
      count > 0
        ? sum / count
        : 0;
  }

  return result;
}

export default function LiveVoiceChat({
  onClose,
}: LiveVoiceChatProps) {
  const [status, setStatus] = useState<
    "connecting" |
    "listening" |
    "speaking" |
    "error"
  >("connecting");

  const [transcript, setTranscript] =
    useState("");

  const [error, setError] =
    useState("");

  const sessionRef =
    useRef<any>(null);

  const mediaStreamRef =
    useRef<MediaStream | null>(null);

  const inputContextRef =
    useRef<AudioContext | null>(null);

  const outputContextRef =
    useRef<AudioContext | null>(null);

  const sourceRef =
    useRef<MediaStreamAudioSourceNode | null>(
      null
    );

  const processorRef =
    useRef<ScriptProcessorNode | null>(
      null
    );

  const nextAudioTimeRef =
    useRef(0);

  const activeRef =
    useRef(true);

  const closingRef =
    useRef(false);

  useEffect(() => {
    activeRef.current = true;
    closingRef.current = false;

    startVoiceChat();

    return () => {
      activeRef.current = false;

      try {
        sessionRef.current?.close();
      } catch {}

      sessionRef.current = null;

      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();

      mediaStreamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      inputContextRef.current
        ?.close()
        .catch(() => {});

      outputContextRef.current
        ?.close()
        .catch(() => {});

      processorRef.current = null;
      sourceRef.current = null;
      mediaStreamRef.current = null;
      inputContextRef.current = null;
      outputContextRef.current = null;

      nextAudioTimeRef.current = 0;
    };
  }, []);

  async function startVoiceChat() {
    try {
      setStatus("connecting");
      setError("");

      console.log(
        "Starting XtenT Live Voice Chat..."
      );

      const tokenResponse =
        await fetch("/api/live/token");

      const tokenData =
        await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !tokenData.token
      ) {
        throw new Error(
          tokenData.error ||
            "Unable to create Live voice session."
        );
      }

      if (!activeRef.current) {
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: tokenData.token,
      });

      const session =
        await ai.live.connect({
          model:
            "gemini-3.1-flash-live-preview",

          callbacks: {
            onopen: () => {
              console.log(
                "XtenT Live connected"
              );

              if (
                activeRef.current
              ) {
                setStatus("listening");
              }
            },

            onmessage: (
              message: any
            ) => {
              handleMessage(message);
            },

            onerror: (
              event: any
            ) => {
              console.error(
                "XtenT Live error:",
                event
              );

              if (
                activeRef.current
              ) {
                setError(
                  "Voice connection failed."
                );

                setStatus("error");
              }
            },

            onclose: (
              event: any
            ) => {
              console.log(
                "XtenT Live closed:",
                event
              );
            },
          },

          config: {
            responseModalities: [
              Modality.AUDIO,
            ],

            inputAudioTranscription: {},

            outputAudioTranscription: {},

            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore",
                },
              },
            },

            thinkingConfig: {
              thinkingLevel: "minimal",
            },

            systemInstruction: `
You are XtenT AI.

You are a friendly and intelligent real-time voice assistant.

Speak naturally and conversationally.

Automatically understand the language spoken by the user.

If the user speaks Malayalam, respond in Malayalam.

If the user speaks Tamil, respond in Tamil.

If the user speaks English, respond in English.

If the user changes language, follow the new language.

Do not unnecessarily translate the user's speech.

Keep answers natural and reasonably short for a voice conversation.

Never mention Gemini or Google unless the user specifically asks.
`,
          },
        });

      if (!activeRef.current) {
        try {
          session.close();
        } catch {}

        return;
      }

      sessionRef.current = session;

      console.log(
        "Live session ready. Starting microphone..."
      );

      await startMicrophone();
    } catch (error: any) {
      console.error(
        "Live voice start error:",
        error
      );

      if (
        activeRef.current
      ) {
        setError(
          error?.message ||
            "Unable to start voice chat."
        );

        setStatus("error");
      }
    }
  }

  async function startMicrophone() {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }
        );

      if (!activeRef.current) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        return;
      }

      mediaStreamRef.current =
        stream;

      const context =
        new AudioContext();

      inputContextRef.current =
        context;

      if (
        context.state ===
        "suspended"
      ) {
        await context.resume();
      }

      const source =
        context.createMediaStreamSource(
          stream
        );

      sourceRef.current =
        source;

      const processor =
        context.createScriptProcessor(
          2048,
          1,
          1
        );

      processorRef.current =
        processor;

      processor.onaudioprocess =
        (event) => {
          if (
            !sessionRef.current ||
            !activeRef.current
          ) {
            return;
          }

          const input =
            event.inputBuffer.getChannelData(
              0
            );

          const pcmInput =
            downsample(
              input,
              context.sampleRate,
              16000
            );

          const pcm =
            floatTo16BitPCM(
              pcmInput
            );

          const base64 =
            arrayBufferToBase64(
              pcm.buffer
            );

          try {
            sessionRef.current.sendRealtimeInput(
              {
                audio: {
                  data: base64,
                  mimeType:
                    "audio/pcm;rate=16000",
                },
              }
            );
          } catch (error) {
            console.error(
              "Microphone send error:",
              error
            );
          }
        };

      source.connect(
        processor
      );

      processor.connect(
        context.destination
      );

      console.log(
        "Microphone started."
      );
    } catch (error: any) {
      console.error(
        "Microphone error:",
        error
      );

      if (
        activeRef.current
      ) {
        setError(
          error?.message ||
            "Microphone permission is required."
        );

        setStatus("error");
      }
    }
  }

  async function handleMessage(
    message: any
  ) {
    const content =
      message?.serverContent;

    if (!content) {
      return;
    }

    if (
      content.interrupted
    ) {
      nextAudioTimeRef.current = 0;
      return;
    }

    if (
      content.inputTranscription
        ?.text
    ) {
      setTranscript(
        content.inputTranscription
          .text
      );
    }

    if (
      content.outputTranscription
        ?.text
    ) {
      setTranscript(
        content.outputTranscription
          .text
      );
    }

    const parts =
      content?.modelTurn?.parts;

    if (parts) {
      for (
        const part of parts
      ) {
        const audioData =
          part?.inlineData?.data;

        if (audioData) {
          if (
            activeRef.current
          ) {
            setStatus("speaking");
          }

          await playAudio(
            audioData
          );
        }
      }
    }

    if (
      content.turnComplete &&
      activeRef.current
    ) {
      setStatus("listening");
    }
  }

  async function playAudio(
    base64: string
  ) {
    if (
      !outputContextRef.current
    ) {
      outputContextRef.current =
        new AudioContext({
          sampleRate: 24000,
        });
    }

    const context =
      outputContextRef.current;

    if (
      context.state ===
      "suspended"
    ) {
      await context.resume();
    }

    const pcm =
      base64ToInt16(base64);

    const audioBuffer =
      context.createBuffer(
        1,
        pcm.length,
        24000
      );

    const channel =
      audioBuffer.getChannelData(
        0
      );

    for (
      let i = 0;
      i < pcm.length;
      i++
    ) {
      channel[i] =
        pcm[i] / 32768;
    }

    const source =
      context.createBufferSource();

    source.buffer =
      audioBuffer;

    source.connect(
      context.destination
    );

    const startTime =
      Math.max(
        context.currentTime,
        nextAudioTimeRef.current
      );

    source.start(
      startTime
    );

    nextAudioTimeRef.current =
      startTime +
      audioBuffer.duration;
  }

  function stopVoiceChat() {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    activeRef.current = false;

    console.log(
      "Stopping XtenT Live Voice Chat..."
    );

    try {
      sessionRef.current?.close();
    } catch {}

    sessionRef.current =
      null;

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();

    mediaStreamRef.current
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    inputContextRef.current
      ?.close()
      .catch(() => {});

    outputContextRef.current
      ?.close()
      .catch(() => {});

    processorRef.current =
      null;

    sourceRef.current =
      null;

    mediaStreamRef.current =
      null;

    inputContextRef.current =
      null;

    outputContextRef.current =
      null;

    nextAudioTimeRef.current = 0;

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            XtenT Voice Chat
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {status === "connecting" &&
              "Connecting..."}

            {status === "listening" &&
              "Listening..."}

            {status === "speaking" &&
              "XtenT is speaking..."}

            {status === "error" &&
              "Connection failed"}
          </p>
        </div>

        <div
          className={`mx-auto my-10 flex h-32 w-32 items-center justify-center rounded-full transition-all ${
            status === "speaking"
              ? "scale-110 bg-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.45)]"
              : "bg-white"
          }`}
        >
          {status === "connecting" ? (
            <Loader2
              size={42}
              className="animate-spin text-black"
            />
          ) : (
            <Mic
              size={42}
              className="text-black"
            />
          )}
        </div>

        {transcript && (
          <div className="mb-6 max-h-32 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center text-sm text-zinc-300">
            {transcript}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={stopVoiceChat}
          className="mx-auto flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-medium text-white transition hover:bg-red-400"
        >
          <PhoneOff size={18} />
          End voice chat
        </button>
      </div>
    </div>
  );
}