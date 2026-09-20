import { createClient } from "@/lib/supabase/client";

export async function getRelevantDocumentContext(
  conversationId: string,
  question: string
): Promise<string> {
  if (!conversationId) {
    return "";
  }

  try {
    const supabase = createClient();

    // Get all chunks for this conversation.
    const { data, error } = await supabase
      .from("document_chunks")
      .select(
        "file_name, chunk_index, content"
      )
      .eq(
        "conversation_id",
        conversationId
      )
      .order("chunk_index", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to retrieve document chunks:",
        error
      );

      return "";
    }

    if (!data || data.length === 0) {
      return "";
    }

    // If there is no question, return the first
    // few chunks instead of failing.
    if (!question?.trim()) {
      return data
        .slice(0, 8)
        .map((chunk) => chunk.content)
        .join("\n\n");
    }

    // --------------------------------------------------
    // Find chunks relevant to the question.
    // --------------------------------------------------

    const words = question
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(
        (word) => word.length >= 3
      );

    const scored = data.map((chunk) => {
      const content =
        chunk.content.toLowerCase();

      let score = 0;

      for (const word of words) {
        if (content.includes(word)) {
          score++;
        }
      }

      return {
        ...chunk,
        score,
      };
    });

    // --------------------------------------------------
    // Sort by relevance.
    // --------------------------------------------------

    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        a.chunk_index - b.chunk_index
      );
    });

    // --------------------------------------------------
    // Use the best chunks.
    // --------------------------------------------------

    const selected =
      scored
        .filter((chunk) => chunk.score > 0)
        .slice(0, 8);

    // If no words matched, use the beginning
    // of the document as fallback context.
    const finalChunks =
      selected.length > 0
        ? selected
        : data.slice(0, 5);

    return finalChunks
      .sort(
        (a, b) =>
          a.chunk_index -
          b.chunk_index
      )
      .map((chunk) => {
        return `[${chunk.file_name}]\n${chunk.content}`;
      })
      .join("\n\n");
  } catch (error) {
    console.error(
      "Document retrieval error:",
      error
    );

    return "";
  }
}