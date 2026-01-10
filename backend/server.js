import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateMCQ } from "./mcqGenerator.js";
import { db } from "./database.js";

dotenv.config();
const app = express();

// CONFIRM SERVER FILE
console.log("🔥 THIS SERVER.JS FILE IS RUNNING");

app.use(cors());
app.use(express.json());

/* TEST ROUTE */
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

/* Generate SINGLE MCQ */
app.post("/api/generate-mcq", async (req, res) => {
  try {
    const singleMCQ = await generateMCQ(req.body);
    res.json(singleMCQ);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "MCQ generation failed" });
  }
});

/* START EXAM – MULTIPLE QUESTIONS */
app.post("/api/start-exam", async (req, res) => {
  try {
    console.log("📩 Incoming body:", req.body);

    const { subject, chapter, total } = req.body;

    if (!subject || !chapter || !total) {
      return res.status(400).json({ error: "Missing data" });
    }

    let questions = [];

    for (let i = 0; i < total; i++) {
      const generatedMCQ = await generateMCQ({
        subject,
        chapter,
        concept: "Mixed",
        difficulty: "NEET",
      });

      questions.push({
  question: generatedMCQ.question,
  options: generatedMCQ.options,
  correctAnswer: generatedMCQ.answer   // ✅ FIX
});


    }

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Exam generation failed" });
  }
});

/* SAVE RESULT */
app.post("/api/save-result", async (req, res) => {
  try {
    const { subject, chapter, correct, timeTaken } = req.body;

    await db.run(
      `INSERT INTO progress (subject, chapter, correct, time_taken)
       VALUES (?, ?, ?, ?)`,
      [subject, chapter, correct ? 1 : 0, timeTaken]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save result" });
  }
});

/* ANALYTICS */
app.get("/api/analytics", async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT chapter,
             COUNT(*) AS total,
             SUM(correct) AS correct
      FROM progress
      GROUP BY chapter
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

/* START SERVER */
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

