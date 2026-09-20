import { GoogleGenAI } from "@google/genai";
import { getMemoryPrompt } from "./memories";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ImageData {
  mimeType: string;
  data: string;
}

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

export async function generateConversationTitle(
  message: string
) {
  return message
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");
}

export async function* generateResponseStream(
  messages: ChatMessage[],
  image?: ImageData | null
) {
  try {
    const ai = getGeminiClient();

    const memoryPrompt = await getMemoryPrompt();

    const contents: any[] = [];

    // ---------------------------------------------
    // MEMORY
    // ---------------------------------------------

    if (memoryPrompt?.trim()) {
      contents.push({
        role: "user",
        parts: [
          {
            text: memoryPrompt,
          },
        ],
      });

      contents.push({
        role: "model",
        parts: [
          {
            text: "Understood.",
          },
        ],
      });
    }

    // ---------------------------------------------
    // CONVERSATION
    // ---------------------------------------------

    for (const message of messages) {
      if (!message.content?.trim()) {
        continue;
      }

      const role =
        message.role === "assistant"
          ? "model"
          : "user";

      const last =
        contents[contents.length - 1];

      if (last && last.role === role) {
        const previousText =
          last.parts?.[0]?.text ?? "";

        last.parts[0].text =
          `${previousText}\n\n${message.content}`;
      } else {
        contents.push({
          role,
          parts: [
            {
              text: message.content,
            },
          ],
        });
      }
    }

    // ---------------------------------------------
    // ENSURE FIRST MESSAGE IS USER
    // ---------------------------------------------

    if (
      contents.length > 0 &&
      contents[0].role !== "user"
    ) {
      contents.shift();
    }

    // ---------------------------------------------
    // ENSURE LAST MESSAGE IS USER
    // ---------------------------------------------

    while (
      contents.length > 0 &&
      contents[contents.length - 1].role !== "user"
    ) {
      contents.pop();
    }

    // ---------------------------------------------
    // SAFETY FALLBACK
    // ---------------------------------------------

    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [
          {
            text: "Hello",
          },
        ],
      });
    }

    // ---------------------------------------------
    // ADD IMAGE
    // ---------------------------------------------

    if (image) {
      const last =
        contents[contents.length - 1];

      if (last?.role === "user") {
        last.parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      }
    }

    console.log(
      "Gemini request roles:",
      contents.map(
        (item) => item.role
      )
    );

    // ---------------------------------------------
    // SYSTEM INSTRUCTION
    // ---------------------------------------------

    const systemInstruction = `
You are XtenT AI.

You are intelligent, helpful, friendly and professional.

Rules:
- Give accurate and useful answers.
- Never mention Gemini or Google unless the user explicitly asks.
- If an image is provided, analyze it carefully.
- Use Markdown when it improves readability.
- Use relevant stored memory when appropriate.
- If document information is provided, use it carefully.
- Do not invent information that is not supported by the provided context.
- If you are uncertain, say so clearly.
- Follow the user's request directly.
`;

    // ---------------------------------------------
    // TRY MODELS
    // ---------------------------------------------

    let lastError: unknown = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(
          `Trying Gemini model: ${model}`
        );

        const stream =
          await ai.models.generateContentStream({
            model,
            config: {
              systemInstruction,
            },
            contents,
          });

        console.log(
          `Gemini model selected: ${model}`
        );

        for await (const chunk of stream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }

        return;
      } catch (error: any) {
        lastError = error;

        console.error(
          `Gemini model failed: ${model}`,
          error
        );

        const status =
          error?.status ??
          error?.code ??
          error?.response?.status;

        // Retry another model for temporary
        // availability/rate-limit problems.
        if (
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504
        ) {
          continue;
        }

        // Authentication/configuration/request
        // errors should not silently switch models.
        throw error;
      }
    }

    console.error(
      "All Gemini models failed:",
      lastError
    );

    yield "❌ XtenT AI is temporarily unavailable. Please try again in a moment.";
  } catch (error: any) {
    console.error(
      "XtenT AI error:",
      error
    );

    yield (
      error?.message ||
      "❌ Something went wrong while generating the response."
    );
  }
}