import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateResponse(
  messages: ChatMessage[]
) {
  try {
    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
    });

    return response.text ?? "No response";
  } catch (error) {
    console.error("Gemini Error:", error);

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong.";
  }
}