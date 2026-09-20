import pdfParse from "pdf-parse";

export async function extractPdfText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const pdf = await pdfParse(buffer);

  return pdf.text;
}