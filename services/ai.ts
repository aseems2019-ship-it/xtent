export async function generateResponse(prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return JSON.stringify(data, null, 2);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
  } catch (error) {
    console.error(error);
    return "Request failed";
  }
}