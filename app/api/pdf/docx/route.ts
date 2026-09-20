import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No DOCX file uploaded." },
        { status: 400 }
      );
    }

    if (
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      !file.name.toLowerCase().endsWith(".docx")
    ) {
      return NextResponse.json(
        { error: "Only DOCX files are supported." },
        { status: 400 }
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const mammoth = await import("mammoth");

    const result =
      await mammoth.extractRawText({
        arrayBuffer,
      });

    const text = result.value.trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "No readable text was found in the DOCX file.",
        },
        { status: 400 }
      );
    }

    const paragraphs = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24,
              }),
            ],
            spacing: {
              after: 200,
            },
          })
      );

    const document =
      new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

    const docxBytes =
      await Packer.toBuffer(document);

    const response =
      await fetch(
        "https://api.docx2pdf.com/convert",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/octet-stream",
          },
          body: new Uint8Array(docxBytes),
        }
      );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "DOCX to PDF conversion service failed.",
        },
        { status: 500 }
      );
    }

    const pdfBuffer =
      await response.arrayBuffer();

    return new NextResponse(
      pdfBuffer,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",
          "Content-Disposition":
            `attachment; filename="${file.name.replace(/\.docx$/i, "")}.pdf"`,
        },
      }
    );
  } catch (error) {
    console.error(
      "DOCX PDF generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to convert DOCX to PDF.",
      },
      { status: 500 }
    );
  }
}