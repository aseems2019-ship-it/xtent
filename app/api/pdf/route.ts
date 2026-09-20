import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response("No file uploaded.", {
        status: 400,
      });
    }

    const bytes = new Uint8Array(
      await file.arrayBuffer()
    );

    // IMAGE → PDF
    if (file.type.startsWith("image/")) {
      const pdfDoc = await PDFDocument.create();

      let image;

      if (file.type === "image/png") {
        image = await pdfDoc.embedPng(bytes);
      } else if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg"
      ) {
        image = await pdfDoc.embedJpg(bytes);
      } else {
        return new Response(
          "Only PNG and JPG/JPEG images are supported.",
          { status: 400 }
        );
      }

      const page = pdfDoc.addPage([
        image.width,
        image.height,
      ]);

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });

      const pdfBytes = await pdfDoc.save();

      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="helpS-document.pdf"',
        },
      });
    }

    // DOCUMENT → TEXT
    let text = "";

    if (
      file.type === "text/plain" ||
      file.name.toLowerCase().endsWith(".txt") ||
      file.name.toLowerCase().endsWith(".md")
    ) {
      text = new TextDecoder().decode(bytes);
    }

    // DOCX → TEXT
    else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(bytes),
      });

      text = result.value;
    }

    else {
      return new Response(
        "Supported files: PNG, JPG, JPEG, TXT, MD and DOCX.",
        { status: 400 }
      );
    }

    text = text.trim();

    if (!text) {
      return new Response(
        "The document contains no readable text.",
        { status: 400 }
      );
    }

    // TEXT → PDF
    const pdfDoc = await PDFDocument.create();

    const font = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const fontSize = 11;
    const lineHeight = 16;

    const pageWidth = 595;
    const pageHeight = 842;

    const margin = 50;
    const maxWidth = pageWidth - margin * 2;

    const words = text.split(/\s+/);
    const lines: string[] = [];

    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      const width = font.widthOfTextAtSize(
        testLine,
        fontSize
      );

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }

        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    let page = pdfDoc.addPage([
      pageWidth,
      pageHeight,
    ]);

    let y = pageHeight - margin;

    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage([
          pageWidth,
          pageHeight,
        ]);

        y = pageHeight - margin;
      }

      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="helpS-document.pdf"',
      },
    });
  } catch (error) {
    console.error(
      "PDF generation error:",
      error
    );

    return new Response(
      "Failed to generate PDF.",
      { status: 500 }
    );
  }
}

