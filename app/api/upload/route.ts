import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const conversationId = formData.get("conversationId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await getDocument({
      data: new Uint8Array(arrayBuffer),
    }).promise;

    let text = "";

    for (let page = 1; page <= pdf.numPages; page++) {
      const pdfPage = await pdf.getPage(page);

      const content = await pdfPage.getTextContent();

      text +=
        content.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ") + "\n\n";
    }

    const CHUNK_SIZE = 1000;

    const chunks = [];

    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push({
        conversation_id: conversationId,
        file_name: file.name,
        chunk_index: chunks.length,
        content: text.slice(i, i + CHUNK_SIZE),
      });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("document_chunks")
      .insert(chunks);

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pages: pdf.numPages,
      chunks: chunks.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to process PDF.",
      },
      {
        status: 500,
      }
    );
  }
}