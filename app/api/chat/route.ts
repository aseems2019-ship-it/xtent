import { NextResponse } from "next/server";
import { generateResponse } from "@/services/ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const reply = await generateResponse(messages);

  return NextResponse.json({
    reply,
  });
}