import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    geminiLoaded: !!process.env.GEMINI_API_KEY,
    keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 5),
  });
}