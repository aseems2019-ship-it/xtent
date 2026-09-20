export async function extractDocument(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/document", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to process PDF."
    );
  }

  return data;
}