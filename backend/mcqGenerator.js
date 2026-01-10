import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMCQ({ subject, chapter, concept, difficulty }) {
  const prompt = `
You are a NEET question setter.
Subject: ${subject}
Chapter: ${chapter}
Concept: ${concept}
Difficulty: ${difficulty}
Rules:
- NCERT based
- Single correct answer
- NEET pattern
- Return JSON only
- Do NOT use markdown or backticks

JSON format:
{
  "question": "",
  "options": ["", "", "", ""],
  "answer": "",
  "explanation": ""
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6
  });

  let rawText = response.choices[0].message.content;

  console.log("🧠 RAW AI RESPONSE:\n", rawText);

  // ✅ Clean markdown if AI still sends it
  let cleanText = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED");
    console.error(cleanText);
    throw err;
  }
}
