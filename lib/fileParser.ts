import * as XLSX from "xlsx";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function parseFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return result.value;
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const workbook = XLSX.read(buffer);

    let text = "";

    workbook.SheetNames.forEach((sheet) => {
      text += XLSX.utils.sheet_to_csv(
        workbook.Sheets[sheet]
      );
    });

    return text;
  }

  return "";
}