import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function GET() {
  try {
    const expireTime = new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString();

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,

        newSessionExpireTime: new Date(
          Date.now() + 60 * 1000
        ).toISOString(),

        liveConnectConstraints: {
          model: "gemini-3.1-flash-live-preview",

          config: {
            responseModalities: [Modality.AUDIO],

            inputAudioTranscription: {},

            outputAudioTranscription: {},

            sessionResumption: {},
          },
        },
      },
    });

    return NextResponse.json({
      token: token.name,
    });
  } catch (error: any) {
    console.error(
      "Live token error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to create Live API token.",
      },
      {
        status: 500,
      }
    );
  }
}