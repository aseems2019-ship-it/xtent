import { NextResponse } from "next/server";
import { generateResponse } from "@/services/ai";

export async function POST(req: Request) {
  const { message } = await req.json();

  const reply = await generateResponse(message);

  return NextResponse.json({
    reply,
  });
}