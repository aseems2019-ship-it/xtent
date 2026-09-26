import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { GoogleGenAI } from "@google/genai";
import * as mupdf from "mupdf";

export const runtime = "nodejs";

const OCR_MODEL = "gemini-3.6-flash";

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

/**
 * Render a PDF page to PNG using MuPDF.
 *
 * IMPORTANT:
 * The PDF bytes passed to MuPDF are copied into a completely
 * independent Buffer so that unpdf and MuPDF never share the
 * same underlying ArrayBuffer.
 */
async function renderPdfPage(
  pdfBuffer: Buffer,
  pageNumber: number
): Promise<Uint8Array> {
  console.log(
    `Loading PDF page ${pageNumber} with MuPDF...`
  );

  // Create a fresh copy specifically for MuPDF.
  const mupdfBuffer = Buffer.from(pdfBuffer);

  const document =
    mupdf.PDFDocument.openDocument(
      mupdfBuffer,
      "application/pdf"
    );

  const page =
    document.loadPage(pageNumber - 1);

  const bounds =
    page.getBounds();

  const scale = 2;

  const matrix =
    mupdf.Matrix.scale(
      scale,
      scale
    );

  const width =
    Math.ceil(
      (bounds[2] - bounds[0]) *
        scale
    );

  const height =
    Math.ceil(
      (bounds[3] - bounds[1]) *
        scale
    );

  console.log(
    `Rendering page ${pageNumber}: ${width}x${height}`
  );

  const pixmap =
    page.toPixmap(
      matrix,
      mupdf.ColorSpace.DeviceRGB,
      false
    );

  const png =
    pixmap.asPNG();

  if (!png) {
    throw new Error(
      `MuPDF failed to render PDF page ${pageNumber}.`
    );
  }

  console.log(
    `Page ${pageNumber} rendered successfully with MuPDF.`
  );

  return new Uint8Array(
    Buffer.from(png)
  );
}

/**
 * Send one rendered PDF page to Gemini OCR.
 */
async function runGeminiOCR(
  image: Uint8Array,
  pageNumber: number
): Promise<string> {
  const ai =
    getGeminiClient();

  console.log(
    `Sending page ${pageNumber} to Gemini OCR...`
  );

  const base64Image =
    Buffer.from(image)
      .toString("base64");

  const response =
    await ai.models.generateContent({
      model: OCR_MODEL,

      contents: [
        {
          role: "user",

          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },

            {
              text: `
Extract all readable text from this PDF page.

This is OCR.

Rules:
- Extract the visible text accurately.
- Do not summarize.
- Do not explain the page.
- Do not add information that is not visible.
- Preserve headings and paragraphs where possible.
- Preserve lists where possible.
- If there is a table, reproduce it in readable Markdown/text form.
- Preserve numbers, dates, symbols, and labels where possible.
- Return only the extracted text.
`,
            },
          ],
        },
      ],
    });

  return response.text?.trim() || "";
}

/**
 * OCR scanned PDF page-by-page.
 */
async function extractScannedPdfText(
  pdfBuffer: Buffer,
  totalPages: number
): Promise<string> {
  const pages: string[] = [];

  console.log(
    `Starting Gemini OCR for ${totalPages} page(s)...`
  );

  for (
    let pageNumber = 1;
    pageNumber <= totalPages;
    pageNumber++
  ) {
    console.log(
      `Rendering PDF page ${pageNumber}/${totalPages}...`
    );

    const image =
      await renderPdfPage(
        pdfBuffer,
        pageNumber
      );

    const text =
      await runGeminiOCR(
        image,
        pageNumber
      );

    if (text) {
      pages.push(
        `--- Page ${pageNumber} ---\n${text}`
      );
    }
  }

  return pages
    .join("\n\n")
    .trim();
}

export async function POST(
  req: Request
) {
  try {
    // -----------------------------------------
    // Get uploaded file
    // -----------------------------------------

    const formData =
      await req.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No PDF file uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Validate PDF
    // -----------------------------------------

    if (
      file.type !==
      "application/pdf"
    ) {
      return NextResponse.json(
        {
          error:
            "Only PDF files are supported.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Create ONE permanent server-side Buffer
    // -----------------------------------------

    const arrayBuffer =
      await file.arrayBuffer();

    const originalBuffer =
      Buffer.from(
        new Uint8Array(arrayBuffer)
      );

    console.log(
      `PDF received: ${originalBuffer.length} bytes`
    );

    // -----------------------------------------
    // STEP 1
    // Normal selectable text extraction
    //
    // Give unpdf its OWN copy.
    // -----------------------------------------

    console.log(
      "Extracting PDF text..."
    );

    const unpdfBuffer =
      new Uint8Array(
        Buffer.from(originalBuffer)
      );

    const result =
      await extractText(
        unpdfBuffer
      );

    const extractedText =
      Array.isArray(result.text)
        ? result.text.join("\n")
        : String(
            result.text || ""
          );

    const normalText =
      extractedText.trim();

    if (normalText) {
      console.log(
        "Selectable PDF text found."
      );

      return NextResponse.json({
        success: true,
        text: normalText,
        pages: result.totalPages,
        method: "text",
      });
    }

    // -----------------------------------------
    // STEP 2
    // Scanned PDF -> MuPDF -> Gemini OCR
    // -----------------------------------------

    console.log(
      "No selectable text found."
    );

    console.log(
      "Starting scanned PDF OCR..."
    );

    const ocrText =
      await extractScannedPdfText(
        originalBuffer,
        result.totalPages
      );

    if (!ocrText) {
      return NextResponse.json(
        {
          error:
            "xtent could not read any text from this scanned PDF.",
          scanned: true,
          method: "ocr",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Gemini OCR completed successfully."
    );

    return NextResponse.json({
      success: true,
      text: ocrText,
      pages: result.totalPages,
      method: "ocr",
      scanned: true,
    });
  } catch (error) {
    console.error(
      "PDF extraction/OCR error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process the PDF.",
      },
      {
        status: 500,
      }
    );
  }
}
