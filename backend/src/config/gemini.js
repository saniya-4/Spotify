import axios from "axios";

export const callGemini = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

    const response = await axios.post(
      endpoint,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        },
      },
      {
        params: { key: apiKey },
        timeout: 10000,
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("AI RAW:", text);

    return text;
  } catch (error) {
    console.error("Gemini Error:", error?.response?.data || error.message);
    return "";
  }
};