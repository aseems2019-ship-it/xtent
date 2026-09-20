import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function main() {
  const response = await ai.models.generateContent({
    model: "models/gemini-3.6-flash",
    contents: "Hello",
  });

  console.log(response.text);
}

main();